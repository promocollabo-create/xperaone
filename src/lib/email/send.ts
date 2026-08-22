import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import { getEmailSettings } from "@/lib/settings";

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const settings = await getEmailSettings();

  try {
    if (settings.smtpHost && settings.smtpUser && settings.smtpPassword) {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: settings.smtpSecure,
        auth: { user: settings.smtpUser, pass: settings.smtpPassword },
      });
      await transporter.sendMail({
        from: `"${settings.fromName}" <${settings.fromEmail}>`,
        to,
        subject,
        html,
      });
      await db.insert(emailLogs).values({ toEmail: to, subject, body: html, status: "sent" });
    } else {
      // No SMTP configured yet — log the email so nothing is silently lost.
      // Admin can configure real SMTP credentials in Email Settings at any time.
      await db.insert(emailLogs).values({ toEmail: to, subject, body: html, status: "logged_no_smtp" });
    }
  } catch (error) {
    await db.insert(emailLogs).values({
      toEmail: to,
      subject,
      body: html,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
