import { sendMail } from "./transporter";

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  verificationTimeNote?: string;
  rejectionReason?: string;
  invoicePdf?: Buffer;
}

function baseLayout(title: string, bodyHtml: string) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
    <h2 style="color: #111936;">${title}</h2>
    ${bodyHtml}
    <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">This is an automated message from XperaOne.</p>
  </div>`;
}

function itemsTable(items: OrderEmailData["items"]) {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:6px 0;">${i.name}</td>
        <td style="padding:6px 0; text-align:center;">${i.quantity}</td>
        <td style="padding:6px 0; text-align:right;">$${i.unitPrice.toFixed(2)}</td>
      </tr>`
    )
    .join("");
  return `<table style="width:100%; border-collapse:collapse; margin:16px 0;">
    <thead><tr style="border-bottom:1px solid #e5e9f7; font-size:12px; color:#6b7280;">
      <th style="text-align:left; padding-bottom:6px;">Product</th>
      <th style="text-align:center; padding-bottom:6px;">Qty</th>
      <th style="text-align:right; padding-bottom:6px;">Price</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const html = baseLayout(
    `Order Confirmation — #${data.orderNumber}`,
    `<p>Hi ${data.customerName},</p>
     <p>Thanks for your order! Here's a summary:</p>
     ${itemsTable(data.items)}
     <p><strong>Total: $${data.total.toFixed(2)}</strong></p>
     <p>Payment method: ${data.paymentMethod}<br/>Payment status: ${data.paymentStatus}<br/>Order status: ${data.orderStatus}</p>`
  );

  return sendMail({
    to: data.customerEmail,
    subject: `Order Confirmation — #${data.orderNumber}`,
    html,
    attachments: data.invoicePdf
      ? [{ filename: `invoice-${data.orderNumber}.pdf`, content: data.invoicePdf }]
      : undefined,
  });
}

export async function sendPaymentPendingEmail(data: OrderEmailData) {
  const html = baseLayout(
    "Payment Pending Verification",
    `<p>Hi ${data.customerName},</p>
     <p>Your payment for order <strong>#${data.orderNumber}</strong> has been received and is currently pending verification.</p>
     <p>${data.verificationTimeNote ?? "We normally review payments within 2-3 hours."}</p>`
  );
  return sendMail({ to: data.customerEmail, subject: `Payment Pending — Order #${data.orderNumber}`, html });
}

export async function sendPaymentVerifiedEmail(data: OrderEmailData) {
  const html = baseLayout(
    `Payment Verified — Order #${data.orderNumber}`,
    `<p>Hi ${data.customerName},</p>
     <p>Good news — your payment has been verified and your order is now ${data.orderStatus}.</p>
     ${itemsTable(data.items)}
     <p><strong>Total: $${data.total.toFixed(2)}</strong></p>
     <p>You can access your purchase from your account's Downloads page.</p>`
  );
  return sendMail({
    to: data.customerEmail,
    subject: `Payment Verified — Order #${data.orderNumber}`,
    html,
    attachments: data.invoicePdf
      ? [{ filename: `invoice-${data.orderNumber}.pdf`, content: data.invoicePdf }]
      : undefined,
  });
}

export async function sendPaymentRejectedEmail(data: OrderEmailData) {
  const html = baseLayout(
    `Payment Rejected — Order #${data.orderNumber}`,
    `<p>Hi ${data.customerName},</p>
     <p>Unfortunately we couldn't verify the payment for order <strong>#${data.orderNumber}</strong>.</p>
     ${data.rejectionReason ? `<p>Reason: ${data.rejectionReason}</p>` : ""}
     <p>Please contact support or submit a new payment to complete your order.</p>`
  );
  return sendMail({ to: data.customerEmail, subject: `Payment Rejected — Order #${data.orderNumber}`, html });
}

export async function sendOrderStatusUpdatedEmail(data: OrderEmailData) {
  const html = baseLayout(
    `Order Update — #${data.orderNumber}`,
    `<p>Hi ${data.customerName},</p>
     <p>Your order status has changed to: <strong>${data.orderStatus}</strong>.</p>`
  );
  return sendMail({ to: data.customerEmail, subject: `Order Update — #${data.orderNumber}`, html });
}

export async function sendAdminNewOrderEmail(adminEmail: string, data: OrderEmailData & { orderDetailsUrl: string }) {
  const html = baseLayout(
    "New Order Received",
    `<p>Order <strong>#${data.orderNumber}</strong> from ${data.customerName} (${data.customerEmail}).</p>
     ${itemsTable(data.items)}
     <p><strong>Total: $${data.total.toFixed(2)}</strong></p>
     <p>Payment method: ${data.paymentMethod}<br/>Payment status: ${data.paymentStatus}</p>
     <p><a href="${data.orderDetailsUrl}" style="color:#2563eb;">View order in admin panel →</a></p>`
  );
  return sendMail({ to: adminEmail, subject: `New Order Received — #${data.orderNumber}`, html });
}
