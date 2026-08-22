"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail, passwordResetEmail } from "@/lib/email/templates";
import { randomToken } from "@/lib/utils";
import { passwordResetTokens } from "@/db/schema";

export type AuthResult = { error?: string; success?: boolean };

export async function registerAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const phone = String(formData.get("phone") || "").trim();

  if (!fullName || !email || !password) {
    return { error: "Please fill in all required fields." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const existing = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(profiles)
    .values({ email, passwordHash, fullName, phone: phone || null, role: "customer" })
    .returning({ id: profiles.id });

  await createSession(created.id);

  const { subject, html } = welcomeEmail(fullName);
  await sendEmail(email, subject, html);

  redirect("/account");
}

export async function loginAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nextPath = String(formData.get("next") || "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const [user] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
  if (!user) {
    return { error: "Invalid email or password." };
  }
  if (user.disabled) {
    return { error: "This account has been disabled. Please contact support." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);

  if (nextPath && nextPath.startsWith("/")) {
    redirect(nextPath);
  }
  redirect(user.role === "admin" ? "/admin" : "/account");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return { error: "Please enter your email address." };

  const [user] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
  // Always respond success to avoid leaking which emails are registered.
  if (user) {
    const token = randomToken(40);
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    const resetUrl = `/reset-password?token=${token}`;
    const { subject, html } = passwordResetEmail(resetUrl);
    await sendEmail(email, subject, html);
  }

  return { success: true };
}

export async function resetPasswordAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");

  if (!token || !password) return { error: "Invalid reset request." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const [row] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(password);
  await db.update(profiles).set({ passwordHash, updatedAt: new Date() }).where(eq(profiles.id, row.userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, row.id));

  return { success: true };
}

export async function getSelf() {
  return getCurrentUser();
}
