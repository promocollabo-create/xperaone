import Link from "next/link";
import { getWebsiteSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getWebsiteSettings();

  return (
    <footer className="bg-[#150f28] text-slate-300 mt-16">
      <div className="xp-container py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <span className="text-2xl font-extrabold text-white">{settings.logoText}</span>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-sm">{settings.footerDescription}</p>
          <div className="flex gap-3 mt-5">
            {settings.socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
                title={s.label}
              >
                {s.label.charAt(0)}
              </a>
            ))}
          </div>
        </div>

        {settings.footerLinkGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-white font-semibold text-sm mb-4">{group.title}</h4>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="xp-container py-5 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>{settings.copyrightText}</span>
          <span>Manual payment verification · Secure digital downloads</span>
        </div>
      </div>
    </footer>
  );
}
