import "server-only";
import { db } from "@/db";
import { websiteSettings, paymentSettings, emailSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type HeaderNavItem = { label: string; href: string };
export type SocialLink = { label: string; url: string };
export type FooterLinkGroup = { title: string; links: HeaderNavItem[] };

export type WebsiteSettingsValue = {
  siteName: string;
  logoText: string;
  logoUrl: string;
  announcementText: string;
  announcementEnabled: boolean;
  footerDescription: string;
  footerLinkGroups: FooterLinkGroup[];
  socialLinks: SocialLink[];
  copyrightText: string;
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettingsValue = {
  siteName: "XperaOne",
  logoText: "XperaOne",
  logoUrl: "",
  announcementText: "🎉 Welcome to XperaOne — Premium digital products marketplace. Limited time launch offers!",
  announcementEnabled: true,
  footerDescription:
    "XperaOne is a premium digital marketplace offering high-quality templates, software, and digital assets crafted for creators and businesses.",
  footerLinkGroups: [
    {
      title: "Shop",
      links: [
        { label: "Store", href: "/shop" },
        { label: "What's New", href: "/whats-new" },
        { label: "Track Order", href: "/track-order" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact Us", href: "/track-order" },
        { label: "Account", href: "/account" },
        { label: "Downloads", href: "/account/downloads" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/whats-new" },
        { label: "Privacy Policy", href: "/whats-new" },
      ],
    },
  ],
  socialLinks: [
    { label: "Twitter", url: "https://twitter.com" },
    { label: "Instagram", url: "https://instagram.com" },
    { label: "Facebook", url: "https://facebook.com" },
  ],
  copyrightText: `© ${new Date().getFullYear()} XperaOne. All rights reserved.`,
};

export async function getWebsiteSettings(): Promise<WebsiteSettingsValue> {
  const rows = await db.select().from(websiteSettings).where(eq(websiteSettings.key, "main")).limit(1);
  if (rows.length === 0) return DEFAULT_WEBSITE_SETTINGS;
  return { ...DEFAULT_WEBSITE_SETTINGS, ...(rows[0].value as Partial<WebsiteSettingsValue>) };
}

export async function saveWebsiteSettings(value: WebsiteSettingsValue): Promise<void> {
  const rows = await db.select({ id: websiteSettings.id }).from(websiteSettings).where(eq(websiteSettings.key, "main")).limit(1);
  if (rows.length === 0) {
    await db.insert(websiteSettings).values({ key: "main", value });
  } else {
    await db.update(websiteSettings).set({ value, updatedAt: new Date() }).where(eq(websiteSettings.id, rows[0].id));
  }
}

export type PaymentSettingsValue = {
  id: string;
  method: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankDetails: string;
  instructions: string;
  currency: string;
  isActive: boolean;
};

export async function getPaymentSettings(): Promise<PaymentSettingsValue> {
  const rows = await db.select().from(paymentSettings).limit(1);
  if (rows.length === 0) {
    const [created] = await db
      .insert(paymentSettings)
      .values({
        method: "Bank Transfer",
        accountName: "XperaOne Digital LLC",
        accountNumber: "0123456789",
        bankName: "Global Trust Bank",
        bankDetails: "SWIFT: GTBXUS33 · IBAN: US00 0000 0000 0000 0000",
        instructions:
          "Please transfer the exact order total to the account above, then upload your payment proof with the transaction ID. Orders are verified within 24 hours.",
        currency: "USD",
        isActive: true,
      })
      .returning();
    return created as PaymentSettingsValue;
  }
  return rows[0] as PaymentSettingsValue;
}

export async function savePaymentSettings(value: Omit<PaymentSettingsValue, "id">): Promise<void> {
  const rows = await db.select({ id: paymentSettings.id }).from(paymentSettings).limit(1);
  if (rows.length === 0) {
    await db.insert(paymentSettings).values(value);
  } else {
    await db.update(paymentSettings).set({ ...value, updatedAt: new Date() }).where(eq(paymentSettings.id, rows[0].id));
  }
}

export type EmailSettingsValue = {
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
};

export async function getEmailSettings(): Promise<EmailSettingsValue> {
  const rows = await db.select().from(emailSettings).limit(1);
  if (rows.length === 0) {
    const [created] = await db
      .insert(emailSettings)
      .values({ fromEmail: "noreply@xperaone.com", fromName: "XperaOne" })
      .returning();
    return created as EmailSettingsValue;
  }
  return rows[0] as EmailSettingsValue;
}

export async function saveEmailSettings(value: EmailSettingsValue): Promise<void> {
  const rows = await db.select({ id: emailSettings.id }).from(emailSettings).limit(1);
  if (rows.length === 0) {
    await db.insert(emailSettings).values(value);
  } else {
    await db.update(emailSettings).set({ ...value, updatedAt: new Date() }).where(eq(emailSettings.id, rows[0].id));
  }
}
