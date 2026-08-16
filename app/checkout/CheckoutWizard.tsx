"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { submitCheckout } from "./actions";
import { formatMoney } from "@/lib/currency";

interface PaymentSettings {
  manual_enabled: boolean | null;
  bank_name: string | null;
  bank_account_title: string | null;
  bank_account_number: string | null;
  bank_iban: string | null;
  jazzcash_number: string | null;
  jazzcash_account_title: string | null;
  easypaisa_number: string | null;
  easypaisa_account_title: string | null;
  payment_instructions: string | null;
  verification_time_note: string | null;
}

interface PaymentChannel {
  id: "bank" | "jazzcash" | "easypaisa";
  label: string;
  title: string;
  number: string;
  extra?: { label: string; value: string } | null;
}

function buildChannels(s: PaymentSettings | null): PaymentChannel[] {
  const channels: PaymentChannel[] = [];
  if (s?.bank_name && s?.bank_account_number) {
    channels.push({
      id: "bank",
      label: s.bank_name || "Bank Transfer",
      title: s.bank_account_title ?? "",
      number: s.bank_account_number ?? "",
      extra: s.bank_iban ? { label: "IBAN", value: s.bank_iban } : null,
    });
  }
  if (s?.jazzcash_number) {
    channels.push({ id: "jazzcash", label: "JazzCash", title: s.jazzcash_account_title ?? "", number: s.jazzcash_number });
  }
  if (s?.easypaisa_number) {
    channels.push({ id: "easypaisa", label: "EasyPaisa", title: s.easypaisa_account_title ?? "", number: s.easypaisa_number });
  }
  return channels;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard API unavailable — fail silently, number is still selectable text
        }
      }}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

const STEP_LABELS = ["Cart", "Details", "Payment"];

export default function CheckoutWizard({
  paymentSettings,
  prefillEmail,
  currency,
  error,
}: {
  paymentSettings: PaymentSettings | null;
  prefillEmail: string;
  currency?: string | null;
  error?: string;
}) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [shipSameAsBilling, setShipSameAsBilling] = useState(true);
  const [shipAddress, setShipAddress] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPostalCode, setShipPostalCode] = useState("");
  const [shipCountry, setShipCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const channels = buildChannels(paymentSettings);
  const [selectedChannel, setSelectedChannel] = useState<string>(channels[0]?.id ?? "");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="container section empty-checkout">
        <h1>Your cart is empty</h1>
        <p>Add a product before checking out.</p>
        <Link href="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneValid = phone.trim().replace(/[^0-9]/g, "").length >= 7;

  const canContinueFromDetails =
    name.trim().length > 0 &&
    emailValid &&
    phoneValid &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    country.trim().length > 0 &&
    (shipSameAsBilling || (shipAddress.trim().length > 0 && shipCity.trim().length > 0 && shipCountry.trim().length > 0));

  const activeChannel = channels.find((c) => c.id === selectedChannel) ?? null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setScreenshotPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    formData.set("cart_items", JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity }))));
    formData.set("customer_name", name);
    formData.set("customer_email", email);
    formData.set("customer_phone", phone);
    formData.set("customer_country", country);
    formData.set("billing_address", address);
    formData.set("city", city);
    formData.set("state", state);
    formData.set("postal_code", postalCode);
    formData.set("order_notes", orderNotes);
    formData.set("payment_channel", activeChannel?.label ?? "");
    formData.set("shipping_same_as_billing", String(shipSameAsBilling));
    if (!shipSameAsBilling) {
      formData.set("shipping_address", shipAddress);
      formData.set("shipping_city", shipCity);
      formData.set("shipping_state", shipState);
      formData.set("shipping_postal_code", shipPostalCode);
      formData.set("shipping_country", shipCountry);
    }
    await submitCheckout(formData);
  }

  return (
    <div className="container section checkout-page">
      <div className="steps-indicator">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`step-pill ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}>
            <span>{step > i + 1 ? "✓" : i + 1}</span> {label}
          </div>
        ))}
        <div className="step-pill upcoming"><span>4</span> Confirmed</div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="checkout-grid">
        <div className="checkout-main">
          {step === 1 && (
            <div className="card step-card">
              <h2>Your Cart</h2>
              <div className="cart-rows">
                {items.map((item) => (
                  <div key={item.productId} className="cart-row">
                    {item.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnailUrl} alt={item.name} />
                    ) : (
                      <div className="thumb-placeholder" />
                    )}
                    <div className="cart-row-info">
                      <span className="name">{item.name}</span>
                      <span className="price">{formatMoney(item.price, currency)}</span>
                    </div>
                    <div className="qty-controls">
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <button type="button" className="remove-btn" onClick={() => removeItem(item.productId)}>Remove</button>
                  </div>
                ))}
              </div>
              <Link href="/products" className="add-product-link">+ Add another product</Link>
              <div className="step-actions">
                <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Continue to Details</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card step-card">
              <h2>Contact &amp; Billing Details</h2>
              <label>Full Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
              <label>
                Email Address
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                {email.length > 0 && !emailValid && <span className="field-error">Enter a valid email address</span>}
              </label>
              <label>
                Phone Number
                <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+92 3XX XXXXXXX" />
                {phone.length > 0 && !phoneValid && <span className="field-error">Enter a valid phone number</span>}
              </label>

              <h3 className="section-label">Billing Address</h3>
              <label>Full Address<textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required /></label>
              <div className="field-row">
                <label>Country<input value={country} onChange={(e) => setCountry(e.target.value)} required /></label>
                <label>Province/State<input value={state} onChange={(e) => setState(e.target.value)} /></label>
              </div>
              <div className="field-row">
                <label>City<input value={city} onChange={(e) => setCity(e.target.value)} required /></label>
                <label>Postal/ZIP Code<input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></label>
              </div>

              <h3 className="section-label">Shipping Address</h3>
              <label className="checkbox-label">
                <input type="checkbox" checked={shipSameAsBilling} onChange={(e) => setShipSameAsBilling(e.target.checked)} />
                Shipping address same as billing address
              </label>
              {!shipSameAsBilling && (
                <>
                  <label>Full Address<textarea rows={2} value={shipAddress} onChange={(e) => setShipAddress(e.target.value)} required /></label>
                  <div className="field-row">
                    <label>City<input value={shipCity} onChange={(e) => setShipCity(e.target.value)} required /></label>
                    <label>State/Province<input value={shipState} onChange={(e) => setShipState(e.target.value)} /></label>
                  </div>
                  <div className="field-row">
                    <label>Postal/ZIP Code<input value={shipPostalCode} onChange={(e) => setShipPostalCode(e.target.value)} /></label>
                    <label>Country<input value={shipCountry} onChange={(e) => setShipCountry(e.target.value)} required /></label>
                  </div>
                </>
              )}

              <label>Order Notes (optional)<textarea rows={2} value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Delivery instructions, gift note, etc." /></label>

              <div className="step-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back to Cart</button>
                <button type="button" className="btn btn-primary" disabled={!canContinueFromDetails} onClick={() => setStep(3)}>
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form action={handleSubmit} className="card step-card">
              <h2>Secure Payment</h2>
              <div className="amount-due-box">
                <span>Please transfer exactly</span>
                <strong>{formatMoney(subtotal, currency)}</strong>
              </div>
              {paymentSettings?.payment_instructions && <p className="instructions">{paymentSettings.payment_instructions}</p>}

              {channels.length === 0 ? (
                <p className="field-error">No payment methods are currently configured. Please contact support.</p>
              ) : (
                <>
                  <div className="channel-tabs">
                    {channels.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        className={`channel-tab ${selectedChannel === c.id ? "active" : ""}`}
                        onClick={() => setSelectedChannel(c.id)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {activeChannel && (
                    <div className="channel-details">
                      {activeChannel.title && <p className="channel-row"><span>Account Title</span><strong>{activeChannel.title}</strong></p>}
                      <p className="channel-row">
                        <span>Account Number</span>
                        <span className="channel-value">
                          <strong className="mono">{activeChannel.number}</strong>
                          <CopyButton value={activeChannel.number} />
                        </span>
                      </p>
                      {activeChannel.extra && (
                        <p className="channel-row">
                          <span>{activeChannel.extra.label}</span>
                          <span className="channel-value">
                            <strong className="mono">{activeChannel.extra.value}</strong>
                            <CopyButton value={activeChannel.extra.value} />
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <label>Transaction / Reference ID (optional)
                <input type="text" name="payment_reference" placeholder="e.g. last 6 digits of transaction ID" />
              </label>

              <label className="upload-label">Upload Payment Screenshot
                <div className="upload-box">
                  {screenshotPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={screenshotPreview} alt="Payment screenshot preview" className="upload-preview" />
                  ) : (
                    <span className="upload-placeholder">JPG, PNG, or WEBP — max 5MB</span>
                  )}
                  <input type="file" name="payment_screenshot" accept="image/jpeg,image/png,image/webp" required onChange={handleFileChange} />
                </div>
              </label>

              <p className="verify-note">{paymentSettings?.verification_time_note ?? "We normally review payments within 2-3 hours."}</p>

              <div className="step-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)} disabled={submitting}>Back</button>
                <button type="submit" className="btn btn-primary" disabled={submitting || channels.length === 0}>
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="checkout-summary card">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {items.map((item) => (
              <div key={item.productId} className="summary-item">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatMoney(item.price * item.quantity, currency)}</span>
              </div>
            ))}
          </div>
          <div className="summary-row"><span>Subtotal</span><span>{formatMoney(subtotal, currency)}</span></div>
          <div className="summary-row total"><span>Total</span><span>{formatMoney(subtotal, currency)}</span></div>
        </div>
      </div>

      <style>{`
        .checkout-page { max-width: 1040px; }
        .empty-checkout { text-align: center; padding: 60px 20px; }
        .empty-checkout .btn { display: inline-flex; margin-top: 16px; }
        .steps-indicator { display: flex; gap: 8px; margin-bottom: 24px; }
        .step-pill { flex: 1; text-align: center; font-size: 12px; font-weight: 600; padding: 10px 6px; border-radius: var(--radius-sm); background: var(--bg-light); color: var(--text-muted); }
        .step-pill span { display: inline-block; width: 18px; height: 18px; border-radius: 50%; background: #d1d5db; color: white; font-size: 11px; line-height: 18px; margin-right: 4px; }
        .step-pill.active { background: rgba(37,99,235,0.1); color: var(--blue); }
        .step-pill.active span { background: var(--blue); }
        .step-pill.done span { background: var(--success); }
        .step-pill.upcoming { opacity: 0.5; }
        .checkout-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        .step-card { padding: 28px; }
        .step-card h2 { font-size: 18px; margin-bottom: 18px; }
        .step-card label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 14px; }
        .step-card input, .step-card textarea { font-family: var(--font-body); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; font-weight: 400; }
        .field-error { color: #b91c1c; font-size: 12px; font-weight: 500; }
        .section-label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); margin: 18px 0 10px; }
        .field-row { display: flex; gap: 12px; }
        .field-row label { flex: 1; }
        .checkbox-label { flex-direction: row !important; align-items: center; gap: 8px !important; font-weight: 500 !important; }
        .checkbox-label input { width: auto; }
        .step-actions { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; }
        .step-actions .btn { flex: 1; min-width: 140px; }

        .cart-rows { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .cart-row { display: grid; grid-template-columns: 56px 1fr auto auto; gap: 14px; align-items: center; background: var(--bg-light); padding: 10px 12px; border-radius: var(--radius-sm); }
        .cart-row img, .thumb-placeholder { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; background: #e5e9f7; }
        .cart-row-info { display: flex; flex-direction: column; gap: 2px; }
        .cart-row-info .name { font-weight: 600; font-size: 14px; color: var(--navy); }
        .cart-row-info .price { font-size: 13px; color: var(--text-muted); }
        .qty-controls { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .qty-controls button { width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--border); background: white; }
        .remove-btn { font-size: 12px; color: #b91c1c; background: none; border: none; }
        .add-product-link { font-size: 13px; color: var(--blue); display: inline-block; margin-bottom: 20px; }

        .amount-due-box { background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.2); border-radius: var(--radius-sm); padding: 16px 18px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 4px; }
        .amount-due-box span { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }
        .amount-due-box strong { font-size: 26px; color: var(--navy); }
        .instructions { font-size: 13px; margin-bottom: 16px; color: var(--text-muted); }
        .channel-tabs { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .channel-tab { padding: 9px 16px; border-radius: 999px; border: 1px solid var(--border); background: white; font-size: 13px; font-weight: 600; cursor: pointer; }
        .channel-tab.active { background: var(--blue); border-color: var(--blue); color: white; }
        .channel-details { background: var(--bg-light); padding: 14px 16px; border-radius: var(--radius-sm); margin-bottom: 16px; }
        .channel-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; margin-bottom: 8px; }
        .channel-row:last-child { margin-bottom: 0; }
        .channel-value { display: flex; align-items: center; gap: 10px; }
        .mono { font-family: var(--font-mono); color: var(--navy); }
        .copy-btn { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border); background: white; cursor: pointer; color: var(--blue); }
        .upload-label { margin-bottom: 14px; }
        .upload-box { position: relative; border: 2px dashed var(--border); border-radius: var(--radius-sm); padding: 24px; text-align: center; }
        .upload-box input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .upload-placeholder { font-size: 13px; color: var(--text-muted); }
        .upload-preview { max-width: 100%; max-height: 220px; border-radius: 8px; }
        .verify-note { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }
        .error-box { background: #fef2f2; color: #b91c1c; padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 13px; }

        .checkout-summary { position: sticky; top: 20px; padding: 22px; }
        .checkout-summary h3 { font-size: 14px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted); }
        .summary-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .summary-item { display: flex; justify-content: space-between; font-size: 13px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 13px; padding-top: 10px; border-top: 1px solid var(--border); }
        .summary-row.total { font-weight: 700; font-size: 16px; color: var(--navy); margin-top: 6px; }

        @media (max-width: 860px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .checkout-summary { position: static; order: -1; }
          .field-row { flex-direction: column; gap: 0; }
          .step-actions .btn { flex: 1 1 100%; }
        }
      `}</style>
    </div>
  );
}
