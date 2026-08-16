"use client";

import { useState } from "react";
import { sendTestEmail } from "./actions";

export default function TestEmailButton() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!email) return;
    setSending(true);
    setResult(null);
    const formData = new FormData();
    formData.set("test_email", email);
    const res = await sendTestEmail(formData);
    setResult(res.sent ? "✓ Test email sent — check the inbox." : "✗ Could not send — check SMTP settings in your environment variables.");
    setSending(false);
  }

  return (
    <div className="card test-email-card">
      <h2>Send a Test Email</h2>
      <div className="test-row">
        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="button" className="mini-btn" onClick={handleSend} disabled={sending}>
          {sending ? "Sending..." : "Send Test"}
        </button>
      </div>
      {result && <p className="test-result">{result}</p>}

      <style>{`
        .test-email-card { padding: 22px 24px; }
        .test-email-card h2 { font-size: 15px; margin-bottom: 12px; }
        .test-row { display: flex; gap: 8px; }
        .test-row input { flex: 1; padding: 9px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 14px; }
        .mini-btn { font-size: 13px; padding: 9px 16px; border-radius: 6px; border: 1px solid var(--border); background: white; white-space: nowrap; }
        .test-result { font-size: 13px; margin-top: 10px; }
      `}</style>
    </div>
  );
}
