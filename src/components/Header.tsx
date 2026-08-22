import { getWebsiteSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth/session";
import { getCart } from "@/lib/cart/cart";
import AnnouncementBar from "@/components/AnnouncementBar";
import HeaderClient from "@/components/HeaderClient";

// Primary navigation is intentionally fixed and does NOT include the
// "XperaOne Panel" — customers reach it via Account → XperaOne Panel.
const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Store / Shop", href: "/shop" },
  { label: "What's New", href: "/whats-new" },
  { label: "Track Order", href: "/track-order" },
];

export default async function Header() {
  const [settings, user] = await Promise.all([getWebsiteSettings(), getCurrentUser()]);
  const cart = await getCart(user);

  return (
    <>
      <AnnouncementBar text={settings.announcementText} enabled={settings.announcementEnabled} />
      <HeaderClient
        logoText={settings.logoText}
        logoUrl={settings.logoUrl}
        navItems={NAV_ITEMS}
        cartCount={cart.count}
        user={user ? { fullName: user.fullName, email: user.email, role: user.role } : null}
      />
    </>
  );
}
