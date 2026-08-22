const wrapper = (title: string, bodyHtml: string) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f0ff;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(88,28,235,0.08);">
        <tr><td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.5px;">XperaOne</h1>
        </td></tr>
        <tr><td style="padding:32px;color:#1e1b2e;">
          <h2 style="margin-top:0;color:#4c1d95;font-size:18px;">${title}</h2>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f5f3ff;color:#6b7280;font-size:12px;">
          © ${new Date().getFullYear()} XperaOne. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export function welcomeEmail(name: string) {
  return {
    subject: "Welcome to XperaOne 🎉",
    html: wrapper(
      `Welcome, ${name}!`,
      `<p>Thanks for creating your XperaOne account. Explore our premium digital products in the store anytime.</p>
       <p>Visit your <strong>XperaOne Panel</strong> to track orders, invoices, and downloads.</p>`
    ),
  };
}

export function orderCreatedEmail(orderNumber: string, total: string) {
  return {
    subject: `Order Received — ${orderNumber}`,
    html: wrapper(
      "We received your order",
      `<p>Your order <strong>${orderNumber}</strong> has been created with a total of <strong>${total}</strong>.</p>
       <p>Next step: complete payment using the instructions provided on your payment page, then upload your payment proof.</p>`
    ),
  };
}

export function paymentProofReceivedEmail(orderNumber: string) {
  return {
    subject: `Payment Proof Received — ${orderNumber}`,
    html: wrapper(
      "Payment proof received",
      `<p>We've received your payment proof for order <strong>${orderNumber}</strong>.</p>
       <p>Status: <strong>Verification Pending</strong>. Our team will review it within 24 hours.</p>`
    ),
  };
}

export function paymentApprovedEmail(orderNumber: string) {
  return {
    subject: `Payment Approved — ${orderNumber} 🎉`,
    html: wrapper(
      "Payment approved!",
      `<p>Great news — your payment for order <strong>${orderNumber}</strong> has been verified.</p>
       <p>Your invoice is ready and your digital downloads are now unlocked in your XperaOne Panel.</p>`
    ),
  };
}

export function paymentRejectedEmail(orderNumber: string, reason: string) {
  return {
    subject: `Payment Verification Rejected — ${orderNumber}`,
    html: wrapper(
      "Payment verification rejected",
      `<p>Unfortunately, your payment proof for order <strong>${orderNumber}</strong> could not be verified.</p>
       <p><strong>Reason:</strong> ${reason}</p>
       <p>You can resubmit your payment proof from your order tracking page.</p>`
    ),
  };
}

export function downloadAvailableEmail(orderNumber: string) {
  return {
    subject: `Your Downloads Are Ready — ${orderNumber}`,
    html: wrapper(
      "Downloads unlocked",
      `<p>Your digital products for order <strong>${orderNumber}</strong> are now available in your account under Downloads.</p>`
    ),
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Reset your XperaOne password",
    html: wrapper(
      "Reset your password",
      `<p>Click the link below to reset your password. This link expires in 1 hour.</p>
       <p><a href="${resetUrl}" style="color:#6d28d9;">${resetUrl}</a></p>`
    ),
  };
}
