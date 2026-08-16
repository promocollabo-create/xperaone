import nodemailer from "nodemailer";

// Sends via YOUR business email's SMTP, not a third-party email API — set
// these in .env.local / your host's environment variables to your business
// email's SMTP settings (Hostinger email, Google Workspace, Zoho, etc. all
// expose SMTP credentials in their mail settings).
//
// Example for Hostinger-hosted business email:
//   SMTP_HOST=smtp.hostinger.com
//   SMTP_PORT=465
//   SMTP_SECURE=true
//   SMTP_USER=orders@yourdomain.com
//   SMTP_PASS=your-mailbox-password
//
// Example for Gmail/Google Workspace (needs an "app password", not your
// normal login password):
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=465
//   SMTP_SECURE=true
//   SMTP_USER=you@yourdomain.com
//   SMTP_PASS=your-16-char-app-password
export function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null; // caller should treat this as "email not configured yet"
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE !== "false", // true for port 465, false for 587
    auth: { user, pass },
  });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping send:", opts.subject, "→", opts.to);
    return { sent: false, reason: "smtp_not_configured" as const };
  }

  const fromName = process.env.SMTP_FROM_NAME ?? "XperaOne";
  const fromEmail = process.env.SMTP_USER!;

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments,
    });
    return { sent: true as const };
  } catch (error) {
    console.error("[email] send failed:", error);
    return { sent: false, reason: "send_error" as const, error };
  }
}
