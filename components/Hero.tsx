import Link from "next/link";
import type { HomepageSettings } from "@/types/database";

// Every string and link here comes from the homepage_settings singleton row,
// which the admin edits via /admin/homepage. Nothing is hardcoded.
export default function Hero({ settings }: { settings: HomepageSettings }) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy fade-up">
          <span className="hero-badge">{settings.hero_badge}</span>
          <h1 className="hero-heading">{settings.hero_heading}</h1>
          <p className="hero-description">{settings.hero_description}</p>
          <div className="hero-ctas">
            <Link href={settings.hero_primary_cta_link} className="btn btn-primary">
              {settings.hero_primary_cta_text}
            </Link>
            <Link href={settings.hero_secondary_cta_link} className="btn btn-secondary">
              {settings.hero_secondary_cta_text}
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-inner">
            {settings.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.hero_image_url} alt="" />
            ) : (
              <div className="hero-visual-placeholder" />
            )}
            <div className="floating-card fc-1 float">✓ Order Delivered</div>
            <div className="floating-card fc-2 float" style={{ animationDelay: "0.6s" }}>★ 4.9 Rating</div>
            <div className="floating-card fc-3 float" style={{ animationDelay: "1.2s" }}>⬇ Instant Download</div>
          </div>
        </div>
      </div>

      <style>{`
        .hero { padding: 64px 0 40px; background: linear-gradient(180deg, var(--bg-light) 0%, var(--white) 100%); }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 48px;
          align-items: center;
        }
        .hero-badge {
          display: inline-block;
          font-size: 13px;
          font-weight: 500;
          color: var(--blue);
          background: rgba(37,99,235,0.08);
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 20px;
        }
        .hero-heading { font-size: clamp(32px, 4.4vw, 52px); margin-bottom: 18px; }
        .hero-description { font-size: 17px; max-width: 480px; margin-bottom: 28px; }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
        .hero-visual { position: relative; }
        .hero-visual-inner {
          position: relative;
          aspect-ratio: 1/1;
          border-radius: var(--radius-lg);
          background: var(--gradient-primary);
          overflow: hidden;
        }
        .hero-visual-inner img { width: 100%; height: 100%; object-fit: cover; }
        .hero-visual-placeholder { width: 100%; height: 100%; }
        .floating-card {
          position: absolute;
          background: var(--white);
          box-shadow: var(--shadow-card-hover);
          border-radius: var(--radius-sm);
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--navy);
        }
        .fc-1 { top: 8%; left: -8%; }
        .fc-2 { bottom: 20%; right: -6%; }
        .fc-3 { bottom: -4%; left: 20%; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .floating-card { display: none; }
        }
      `}</style>
    </section>
  );
}
