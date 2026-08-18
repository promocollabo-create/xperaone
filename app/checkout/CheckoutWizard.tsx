"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { submitCheckout } from "./actions";

interface PaymentSettings {
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

export default function CheckoutWizard({
  paymentSettings,
  prefillEmail,
  error,
}: {
  paymentSettings: PaymentSettings | null;
  prefillEmail: string;
  error?: string;
}) {
  const { items, subtotal } = useCart();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(prefillEmail);
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container section">
        <p>Your cart is empty. <Link href="/products">Browse products →</Link></p>
      </div>
    );
  }

  const canContinueFromStep1 = name.trim().length > 0 && email.trim().length > 0;

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    formData.set("cart_items", JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity }))));
    formData.set("customer_name", name);
    formData.set("customer_email", email);
    formData.set("customer_phone", phone);
    formData.set("customer_country", country);
    formData.set("billing_address", address);
    await submitCheckout(formData);
  }

  return (
    <div className="container section checkout-page">
      <div className="steps-indicator">
        {["Your Info", "Review Order", "Payment"].map((label, i) => (
          <div key={label} className={`step-pill ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}>
            <span>{i + 1}</span> {label}
          </div>
        ))}
      </div>

      {error && <div className="error-box">{error}</div>}

      {step === 1 && (
        <div className="card step-card">
          <h2>Your Information</h2>
          <label>Full Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <label>Country<input value={country} onChange={(e) => setCountry(e.target.value)} /></label>
          <label>Address (optional)<textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <button type="button" className="btn btn-primary" disabled={!canContinueFromStep1} onClick={() => setStep(2)}>
            Continue to Review
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card step-card">
          <h2>Review Your Order</h2>
          <div className="review-items">
            {items.map((item) => (
              <div key={item.productId} className="review-item">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="review-total"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="review-customer">
            <strong>{name}</strong><br />{email}{phone ? ` · ${phone}` : ""}
          </div>
          <div className="step-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Continue to Payment</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form action={handleSubmit} className="card step-card">
          <h2>Payment</h2>
          <p className="instructions">{paymentSettings?.payment_instructions}</p>

          <div className="payment-methods">
            {paymentSettings?.bank_name && (
              <div className="method">
                <strong>Bank Transfer</strong>
                <p>{paymentSettings.bank_name} — {paymentSettings.bank_account_title}</p>
                <p className="mono">{paymentSettings.bank_account_number}</p>
                {paymentSettings.bank_iban && <p className="mono">IBAN: {paymentSettings.bank_iban}</p>}
              </div>
            )}
            {paymentSettings?.jazzcash_number && (
              <div className="method">
                <strong>JazzCash</strong>
                <p>{paymentSettings.jazzcash_account_title}</p>
                <p className="mono">{paymentSettings.jazzcash_number}</p>
              </div>
            )}
            {paymentSettings?.easypaisa_number && (
              <div className="method">
                <strong>EasyPaisa</strong>
                <p>{paymentSettings.easypaisa_account_title}</p>
                <p className="mono">{paymentSettings.easypaisa_number}</p>
              </div>
            )}
          </div>

          <label>Transaction / Reference ID (optional)
            <input type="text" name="payment_reference" placeholder="e.g. last 6 digits of transaction ID" />
          </label>
          <label>Upload Payment Screenshot
            <input type="file" name="payment_screenshot" accept="image/*" required />
          </label>

          <p className="verify-note">{paymentSettings?.verification_time_note}</p>

          <div className="step-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setStep(2)} disabled={submitting}>Back</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      )}

      <style>{`
        .checkout-page { max-width: 640px; }
        .steps-indicator { display: flex; gap: 8px; margin-bottom: 24px; }
        .step-pill { flex: 1; text-align: center; font-size: 12px; font-weight: 600; padding: 10px 6px; border-radius: var(--radius-sm); background: var(--bg-light); color: var(--text-muted); }
        .step-pill span { display: inline-block; width: 18px; height: 18px; border-radius: 50%; background: #d1d5db; color: white; font-size: 11px; line-height: 18px; margin-right: 4px; }
        .step-pill.active { background: rgba(37,99,235,0.1); color: var(--blue); }
        .step-pill.active span { background: var(--blue); }
        .step-pill.done span { background: var(--success); }
        .step-card { padding: 28px; }
        .step-card h2 { font-size: 18px; margin-bottom: 18px; }
        .step-card label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 14px; }
        .step-card input, .step-card textarea { font-family: var(--font-body); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; font-weight: 400; }
        .review-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
        .review-item { display: flex; justify-content: space-between; font-size: 14px; }
        .review-total { display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; color: var(--navy); border-top: 1px solid var(--border); padding-top: 10px; margin-bottom: 16px; }
        .review-customer { font-size: 13px; color: var(--text-muted); background: var(--bg-light); padding: 12px; border-radius: var(--radius-sm); }
        .step-actions { display: flex; gap: 12px; margin-top: 8px; }
        .instructions { font-size: 13px; margin-bottom: 16px; }
        .payment-methods { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .method { background: var(--bg-light); padding: 12px 14px; border-radius: var(--radius-sm); font-size: 13px; }
        .method .mono { font-family: var(--font-mono); font-weight: 600; color: var(--navy); }
        .verify-note { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }
        .error-box { background: #fef2f2; color: #b91c1c; padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 13px; }
      `}</style>
    </div>
  );
}
