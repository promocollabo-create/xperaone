"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateInvoicePdf } from "@/lib/invoice/generate";
import {
  sendOrderConfirmationEmail,
  sendPaymentPendingEmail,
  sendAdminNewOrderEmail,
} from "@/lib/email/templates";

function generateOrderNumber() {
  return "XO-" + Date.now().toString(36).toUpperCase();
}

export async function submitCheckout(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  const cartJson = String(formData.get("cart_items") ?? "[]");
  const cartItems: { productId: string; quantity: number }[] = JSON.parse(cartJson);

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  const customerName = String(formData.get("customer_name") ?? "");
  const customerEmail = String(formData.get("customer_email") ?? "");
  const customerPhone = String(formData.get("customer_phone") ?? "");
  const customerCountry = String(formData.get("customer_country") ?? "");
  const billingAddress = String(formData.get("billing_address") ?? "");
  const paymentReference = String(formData.get("payment_reference") ?? "");
  const screenshotFile = formData.get("payment_screenshot") as File | null;

  if (!customerName || !customerEmail) {
    redirect("/checkout?error=" + encodeURIComponent("Name and email are required"));
  }

  // NEVER trust price/name from the client — re-fetch authoritative data
  // for every product in the cart directly from the database.
  const productIds = cartItems.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, status")
    .in("id", productIds);

  if (productsError || !products || products.length === 0) {
    redirect("/cart?error=" + encodeURIComponent("Could not verify cart items"));
  }

  const lineItems = cartItems
    .map((item) => {
      const product = products!.find((p) => p.id === item.productId && p.status === "published");
      if (!product) return null;
      return {
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: Number(product.price),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (lineItems.length === 0) {
    redirect("/cart?error=" + encodeURIComponent("Cart items are no longer available"));
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const total = subtotal; // extend here for coupon/tax logic later

  const { data: invoiceNumberResult } = await supabase.rpc("next_invoice_number");
  const invoiceNumber = invoiceNumberResult ?? `XPO-${Date.now()}`;

  // Create the order in "awaiting verification" state — it only becomes
  // payment_status = 'verified' after an admin explicitly approves it in
  // /admin/orders/[id]. Nothing here marks it paid.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: generateOrderNumber(),
      customer_id: user.id,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      customer_country: customerCountry || null,
      billing_address: billingAddress || null,
      subtotal,
      total,
      payment_method: "manual",
      payment_reference: paymentReference || null,
      payment_status: "verification_pending",
      status: "pending",
      invoice_number: invoiceNumber,
    })
    .select()
    .single();

  if (orderError || !order) {
    redirect("/checkout?error=" + encodeURIComponent(orderError?.message ?? "Could not create order"));
  }

  // Upload payment screenshot (private bucket, path scoped to this customer
  // so storage RLS can enforce ownership independent of any app logic).
  let screenshotPath: string | null = null;
  if (screenshotFile && screenshotFile.size > 0) {
    const ext = screenshotFile.name.split(".").pop() || "jpg";
    const path = `${user.id}/${order!.id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-screenshots")
      .upload(path, screenshotFile, { upsert: true, contentType: screenshotFile.type });

    if (!uploadError) {
      screenshotPath = path;
      await supabase.from("orders").update({ payment_screenshot_url: path }).eq("id", order!.id);
    }
  }

  // Order items (download_granted stays false until verification).
  await supabase.from("order_items").insert(
    lineItems.map((li) => ({
      order_id: order!.id,
      product_id: li.product_id,
      product_name: li.product_name,
      quantity: li.quantity,
      unit_price: li.unit_price,
      download_granted: false,
    }))
  );

  await supabase.from("order_status_history").insert({
    order_id: order!.id,
    previous_status: null,
    new_status: "pending",
    previous_payment_status: null,
    new_payment_status: "verification_pending",
    changed_by: user.id,
    note: "Order placed by customer.",
  });

  // Fire emails — failures here never block order creation; sendMail()
  // itself no-ops gracefully if SMTP env vars aren't configured yet.
  const { data: settings } = await supabase.from("site_settings").select("site_name").single();
  const { data: emailSettings } = await supabase.from("email_settings").select("*").single();
  const { data: paymentSettings } = await supabase.from("payment_settings").select("verification_time_note").single();

  const emailData = {
    orderNumber: order!.order_number,
    customerName,
    customerEmail,
    items: lineItems.map((li) => ({ name: li.product_name, quantity: li.quantity, unitPrice: li.unit_price })),
    total,
    paymentMethod: "Manual (Bank/JazzCash/EasyPaisa)",
    paymentStatus: "Verification Pending",
    orderStatus: "Pending",
    verificationTimeNote: paymentSettings?.verification_time_note ?? undefined,
  };

  let invoicePdf: Buffer | undefined;
  try {
    invoicePdf = await generateInvoicePdf({
      invoiceNumber,
      orderNumber: order!.order_number,
      orderDate: new Date(order!.created_at).toLocaleDateString(),
      storeName: settings?.site_name ?? "XperaOne",
      customerName,
      customerEmail,
      customerPhone,
      billingAddress,
      items: lineItems.map((li) => ({ name: li.product_name, quantity: li.quantity, unitPrice: li.unit_price })),
      subtotal,
      discount: 0,
      total,
      paymentMethod: "Manual",
      paymentStatus: "Verification Pending",
      orderStatus: "Pending",
    });
  } catch {
    invoicePdf = undefined; // email still sends without the attachment
  }

  if (emailSettings?.notify_order_confirmation !== false) {
    await sendOrderConfirmationEmail({ ...emailData, invoicePdf });
  }
  if (emailSettings?.notify_payment_pending !== false) {
    await sendPaymentPendingEmail(emailData);
  }
  if (emailSettings?.notify_admin_new_order !== false && emailSettings?.admin_notification_email) {
    await sendAdminNewOrderEmail(emailSettings.admin_notification_email, {
      ...emailData,
      orderDetailsUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order!.id}`,
    });
  }

  redirect(`/order/${order!.id}`);
}
