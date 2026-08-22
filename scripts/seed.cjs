/* eslint-disable */
// One-off idempotent seed script for local Postgres via plain `pg`.
// Run with: node scripts/seed.cjs
require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const IMG = {
  uiKit1: "https://images.pexels.com/photos/17279854/pexels-photo-17279854.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  uiKit2: "https://images.pexels.com/photos/17279853/pexels-photo-17279853.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  code1: "https://images.pexels.com/photos/34803985/pexels-photo-34803985.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  webTemplate1: "https://images.pexels.com/photos/14553707/pexels-photo-14553707.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  webTemplate2: "https://images.pexels.com/photos/14553720/pexels-photo-14553720.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  webTemplate3: "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  ebook1: "https://images.pexels.com/photos/7129624/pexels-photo-7129624.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  ebook2: "https://images.pexels.com/photos/844734/pexels-photo-844734.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  icons1: "https://images.pexels.com/photos/5842131/pexels-photo-5842131.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  icons2: "https://images.pexels.com/photos/8386177/pexels-photo-8386177.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  deck1: "https://images.pexels.com/photos/9034728/pexels-photo-9034728.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  deck2: "https://images.pexels.com/photos/7413913/pexels-photo-7413913.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  font1: "https://images.pexels.com/photos/6935188/pexels-photo-6935188.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  font2: "https://images.pexels.com/photos/861449/pexels-photo-861449.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
};

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensurePlaceholderFile(slug) {
  const key = `product-files/${slug}.txt`;
  const fullPath = path.join(process.cwd(), "storage", key);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `XperaOne digital product placeholder file for "${slug}".\nThis represents the purchasable digital asset delivered after payment verification.\n`);
  return key;
}

async function main() {
  const client = await pool.connect();
  try {
    console.log("Seeding XperaOne database...");

    // ---------- Users ----------
    const adminHash = await bcrypt.hash("Admin@123", 10);
    const customerHash = await bcrypt.hash("Customer@123", 10);

    const adminRes = await client.query(
      `insert into profiles (email, password_hash, full_name, role)
       values ($1,$2,$3,'admin')
       on conflict (email) do update set password_hash = excluded.password_hash
       returning id`,
      ["admin@xperaone.com", adminHash, "XperaOne Admin"]
    );
    const customerRes = await client.query(
      `insert into profiles (email, password_hash, full_name, role, phone, country)
       values ($1,$2,$3,'customer',$4,$5)
       on conflict (email) do update set password_hash = excluded.password_hash
       returning id`,
      ["customer@xperaone.com", customerHash, "Jordan Customer", "+1 555 0100", "United States"]
    );
    const adminId = adminRes.rows[0].id;
    const customerId = customerRes.rows[0].id;
    console.log("Users ready:", { adminId, customerId });

    // ---------- Categories ----------
    const categoriesData = [
      { name: "UI Kits & Design", slug: "ui-kits", description: "Beautiful, ready-to-use interface kits for designers.", image: IMG.uiKit1 },
      { name: "Website Templates", slug: "website-templates", description: "Fully responsive templates to launch fast.", image: IMG.webTemplate1 },
      { name: "eBooks & Guides", slug: "ebooks", description: "In-depth digital guides written by industry experts.", image: IMG.ebook1 },
      { name: "Icon & Asset Packs", slug: "icons-assets", description: "Crisp icon sets and illustration bundles.", image: IMG.icons1 },
      { name: "Presentation Templates", slug: "presentation-templates", description: "Pitch-perfect slide decks for every occasion.", image: IMG.deck1 },
      { name: "Fonts & Typography", slug: "fonts", description: "Premium font families for branding and print.", image: IMG.font1 },
    ];

    const categoryIds = {};
    for (let i = 0; i < categoriesData.length; i++) {
      const c = categoriesData[i];
      const res = await client.query(
        `insert into categories (name, slug, description, image, sort_order)
         values ($1,$2,$3,$4,$5)
         on conflict (slug) do update set name = excluded.name, description = excluded.description, image = excluded.image
         returning id`,
        [c.name, c.slug, c.description, c.image, i]
      );
      categoryIds[c.slug] = res.rows[0].id;
    }
    console.log("Categories ready");

    // ---------- Products ----------
    const productsData = [
      {
        name: "Nova UI Kit — Figma Design System",
        category: "ui-kits",
        short: "A complete Figma design system with 400+ components.",
        description: "Nova is a comprehensive UI kit built for modern product teams. Includes a full design system, dark/light themes, and 400+ reusable components ready to drop into your Figma projects.",
        price: 59, sale: 39, isNew: true, isFeatured: true,
        features: ["400+ Figma components", "Dark & light themes", "Auto-layout ready", "Free lifetime updates"],
        license: "Standard Commercial License",
        images: [IMG.uiKit1, IMG.uiKit2],
      },
      {
        name: "Glassmorphism Dashboard Kit",
        category: "ui-kits",
        short: "Modern glassmorphism admin dashboard UI kit.",
        description: "A sleek glassmorphism-styled dashboard kit including charts, tables, forms, and settings screens — perfect for SaaS admin panels.",
        price: 49, sale: null, isNew: false, isFeatured: true,
        features: ["40+ dashboard screens", "Chart & table components", "Figma + Sketch files"],
        license: "Standard Commercial License",
        images: [IMG.uiKit2, IMG.code1],
      },
      {
        name: "Orbit — SaaS Landing Page Template",
        category: "website-templates",
        short: "High-converting SaaS landing page template.",
        description: "Orbit is a pixel-perfect, fully responsive HTML/CSS landing page template designed to convert visitors into customers for SaaS and tech startups.",
        price: 79, sale: 59, isNew: true, isFeatured: true,
        features: ["100% responsive", "SEO optimized markup", "Easy to customize", "Includes 5 page variants"],
        license: "Extended Commercial License",
        images: [IMG.webTemplate1, IMG.webTemplate2],
      },
      {
        name: "Nexus Agency HTML Template",
        category: "website-templates",
        short: "Creative agency multi-page HTML template.",
        description: "Nexus is a modern creative-agency template with portfolio, blog, and contact layouts, built with clean semantic HTML and CSS.",
        price: 65, sale: null, isNew: false, isFeatured: false,
        features: ["12 page templates", "Portfolio & blog layouts", "Cross-browser tested"],
        license: "Standard Commercial License",
        images: [IMG.webTemplate3, IMG.webTemplate2],
      },
      {
        name: "The Freelancer's Playbook (eBook)",
        category: "ebooks",
        short: "A practical guide to building a freelance career.",
        description: "160 pages of actionable strategies covering pricing, client acquisition, contracts, and scaling a freelance digital business.",
        price: 24, sale: 14, isNew: true, isFeatured: false,
        features: ["160 pages PDF", "Contract templates included", "Pricing calculators"],
        license: "Personal Use License",
        images: [IMG.ebook1, IMG.ebook2],
      },
      {
        name: "Mastering Digital Marketing 2026",
        category: "ebooks",
        short: "Up-to-date digital marketing strategy guide.",
        description: "Covers SEO, paid ads, content strategy, and analytics with real case studies from 2025-2026 campaigns.",
        price: 29, sale: null, isNew: false, isFeatured: false,
        features: ["220 pages PDF", "Case studies", "Actionable checklists"],
        license: "Personal Use License",
        images: [IMG.ebook2, IMG.ebook1],
      },
      {
        name: "Pixel Perfect Icon Pack — 500 Icons",
        category: "icons-assets",
        short: "500 pixel-perfect vector icons in multiple styles.",
        description: "A massive icon library covering UI, business, and social categories — delivered as SVG, PNG, and Figma files.",
        price: 19, sale: 9, isNew: false, isFeatured: true,
        features: ["500 SVG icons", "4 style variants", "Figma + PNG exports"],
        license: "Standard Commercial License",
        images: [IMG.icons1, IMG.icons2],
      },
      {
        name: "3D Illustration Asset Bundle",
        category: "icons-assets",
        short: "Vibrant 3D illustration pack for modern products.",
        description: "60 hand-crafted 3D illustrations perfect for landing pages, apps, and marketing decks.",
        price: 39, sale: null, isNew: false, isFeatured: false,
        features: ["60 3D illustrations", "PNG with transparency", "Editable source files"],
        license: "Standard Commercial License",
        images: [IMG.icons2, IMG.icons1],
      },
      {
        name: "Momentum Pitch Deck Template",
        category: "presentation-templates",
        short: "Investor-ready pitch deck template.",
        description: "A 30-slide investor pitch deck template with financial charts, roadmap slides, and team layouts.",
        price: 35, sale: null, isNew: true, isFeatured: false,
        features: ["30 slides", "PowerPoint & Keynote", "Editable charts"],
        license: "Personal Use License",
        images: [IMG.deck1, IMG.deck2],
      },
      {
        name: "Quarterly Report Slides Kit",
        category: "presentation-templates",
        short: "Clean quarterly business report deck.",
        description: "Professional slide kit for quarterly business reviews with data visualization layouts.",
        price: 25, sale: null, isNew: false, isFeatured: false,
        features: ["25 slides", "Data visualization layouts", "PowerPoint file"],
        license: "Personal Use License",
        images: [IMG.deck2, IMG.deck1],
      },
      {
        name: "Aurora Sans Variable Font Family",
        category: "fonts",
        short: "Modern variable sans-serif font family.",
        description: "Aurora Sans is a versatile variable font family with 9 weights, ideal for branding, UI, and editorial design.",
        price: 45, sale: null, isNew: false, isFeatured: true,
        features: ["9 weights", "Variable font technology", "Web + desktop license"],
        license: "Extended Commercial License",
        images: [IMG.font1, IMG.font2],
      },
      {
        name: "Handwritten Script Font Bundle",
        category: "fonts",
        short: "A collection of elegant handwritten script fonts.",
        description: "12 handwritten script fonts perfect for branding, invitations, and social media graphics.",
        price: 15, sale: 9, isNew: true, isFeatured: false,
        features: ["12 script fonts", "OTF + TTF formats", "Commercial use allowed"],
        license: "Standard Commercial License",
        images: [IMG.font2, IMG.font1],
      },
    ];

    const productIds = {};
    for (const p of productsData) {
      const slug = slugify(p.name);
      const fileKey = await ensurePlaceholderFile(slug);
      const res = await client.query(
        `insert into products
          (name, slug, short_description, description, price, sale_price, category_id, features, license, is_new, is_featured, status, digital_file_key, digital_file_name, seo_title, seo_description)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'published',$12,$13,$14,$15)
         on conflict (slug) do update set
           short_description = excluded.short_description,
           description = excluded.description,
           price = excluded.price,
           sale_price = excluded.sale_price,
           is_new = excluded.is_new,
           is_featured = excluded.is_featured,
           digital_file_key = excluded.digital_file_key
         returning id`,
        [
          p.name, slug, p.short, p.description, p.price, p.sale, categoryIds[p.category],
          JSON.stringify(p.features), p.license, p.isNew, p.isFeatured, fileKey, `${slug}.txt`,
          p.name, p.short,
        ]
      );
      const productId = res.rows[0].id;
      productIds[slug] = productId;

      await client.query(`delete from product_images where product_id = $1`, [productId]);
      for (let i = 0; i < p.images.length; i++) {
        await client.query(`insert into product_images (product_id, url, sort_order) values ($1,$2,$3)`, [productId, p.images[i], i]);
      }
    }
    console.log("Products ready:", Object.keys(productIds).length);

    // ---------- What's New ----------
    const whatsNewData = [
      { title: "XperaOne Marketplace Officially Launches", type: "announcement", content: "We're thrilled to launch XperaOne — your new home for premium digital products, from UI kits to eBooks and beyond." },
      { title: "New: Orbit SaaS Landing Page Template", type: "product_release", content: "Our newest template, Orbit, is now available in the Website Templates category. Perfect for SaaS and startup landing pages." },
      { title: "Platform Update: Faster Checkout Flow", type: "update", content: "We streamlined checkout to just 3 steps: details, payment, and confirmation — making purchases faster than ever." },
      { title: "Launch Week Offer: Up to 40% Off", type: "offer", content: "Celebrate our launch with up to 40% off selected UI kits and templates. Offer valid for a limited time only." },
      { title: "Community Spotlight: Customer Success Stories", type: "news", content: "Read how creators around the world are using XperaOne digital products to build their businesses faster." },
    ];
    for (let i = 0; i < whatsNewData.length; i++) {
      const w = whatsNewData[i];
      const slug = slugify(w.title);
      await client.query(
        `insert into whats_new (title, slug, content, type, status, published_at)
         values ($1,$2,$3,$4,'published', now() - ($5 || ' days')::interval)
         on conflict (slug) do update set content = excluded.content`,
        [w.title, slug, w.content, w.type, i]
      );
    }
    console.log("What's New ready");

    // ---------- Payment settings ----------
    const paymentCount = await client.query(`select count(*)::int as c from payment_settings`);
    if (paymentCount.rows[0].c === 0) {
      await client.query(
        `insert into payment_settings (method, account_name, account_number, bank_name, bank_details, instructions, currency, is_active)
         values ($1,$2,$3,$4,$5,$6,$7,true)`,
        [
          "Bank Transfer",
          "XperaOne Digital LLC",
          "0123456789",
          "Global Trust Bank",
          "SWIFT: GTBXUS33 · IBAN: US00 0000 0000 0000 0000",
          "Please transfer the exact order total to the account above, then upload your payment proof with the transaction ID. Orders are verified within 24 hours.",
          "USD",
        ]
      );
    }

    const emailCount = await client.query(`select count(*)::int as c from email_settings`);
    if (emailCount.rows[0].c === 0) {
      await client.query(`insert into email_settings (from_email, from_name) values ($1,$2)`, ["noreply@xperaone.com", "XperaOne"]);
    }

    // ---------- Website settings ----------
    const websiteCount = await client.query(`select count(*)::int as c from website_settings where key = 'main'`);
    if (websiteCount.rows[0].c === 0) {
      const value = {
        siteName: "XperaOne",
        logoText: "XperaOne",
        logoUrl: "",
        announcementText: "🎉 Launch Week: Up to 40% off premium digital products — Shop now!",
        announcementEnabled: true,
        footerDescription: "XperaOne is a premium digital marketplace offering high-quality templates, software, and digital assets crafted for creators and businesses.",
        footerLinkGroups: [
          { title: "Shop", links: [{ label: "Store", href: "/shop" }, { label: "What's New", href: "/whats-new" }, { label: "Track Order", href: "/track-order" }] },
          { title: "Support", links: [{ label: "Contact", href: "/track-order" }, { label: "Account", href: "/account" }, { label: "Downloads", href: "/account/downloads" }] },
          { title: "Legal", links: [{ label: "Terms of Service", href: "/whats-new" }, { label: "Privacy Policy", href: "/whats-new" }] },
        ],
        socialLinks: [{ label: "Twitter", url: "https://twitter.com" }, { label: "Instagram", url: "https://instagram.com" }, { label: "Facebook", url: "https://facebook.com" }],
        copyrightText: `© ${new Date().getFullYear()} XperaOne. All rights reserved.`,
      };
      await client.query(`insert into website_settings (key, value) values ('main', $1)`, [JSON.stringify(value)]);
    }

    // ---------- Home page + sections ----------
    const heroImage = "/images/hero-bg.jpg";
    const sections = [
      { id: "hero-1", type: "hero", enabled: true, data: { title: "Premium Digital Products for Modern Creators", subtitle: "Discover UI kits, templates, eBooks, and assets crafted to help you build faster.", ctaText: "Shop the Store", ctaHref: "/shop", secondaryCtaText: "What's New", secondaryCtaHref: "/whats-new", image: heroImage } },
      { id: "categories-1", type: "categories", enabled: true, data: { title: "Shop by Category", subtitle: "Find exactly what you need" } },
      { id: "featured-1", type: "featured_products", enabled: true, data: { title: "Featured Products", subtitle: "Hand-picked by our team", limit: 8 } },
      { id: "grid-bestsellers", type: "product_grid", enabled: true, data: { title: "Best Sellers", subtitle: "Our most loved digital products", mode: "featured", limit: 4 } },
      { id: "grid-newarrivals", type: "product_grid", enabled: true, data: { title: "New Arrivals", subtitle: "Fresh drops from XperaOne creators", mode: "new", limit: 4 } },
      { id: "whats-new-1", type: "whats_new_feed", enabled: true, data: { title: "What's New at XperaOne", limit: 3 } },
      { id: "banner-1", type: "banner", enabled: true, data: { title: "Launch Week Offer", subtitle: "Up to 40% off selected UI kits and templates.", ctaText: "View Offers", ctaHref: "/shop" } },
      { id: "benefits-1", type: "benefits", enabled: true, data: { title: "Why Choose XperaOne", items: [
        { icon: "⚡", title: "Instant Delivery", text: "Downloads unlock immediately after payment verification." },
        { icon: "🔒", title: "Secure Payments", text: "Manual verification keeps every transaction safe and reviewed." },
        { icon: "🎨", title: "Premium Quality", text: "Every product is curated and quality-checked by our team." },
        { icon: "💬", title: "Real Support", text: "Our team is here to help before and after your purchase." },
      ] } },
      { id: "cta-1", type: "cta", enabled: true, data: { title: "Ready to build something amazing?", subtitle: "Browse hundreds of premium digital products today.", ctaText: "Explore the Shop", ctaHref: "/shop" } },
      { id: "newsletter-1", type: "newsletter", enabled: true, data: { title: "Stay in the loop", subtitle: "Get notified about new products and exclusive offers." } },
      { id: "faq-1", type: "faq", enabled: true, data: { title: "Frequently Asked Questions", items: [
        { q: "How does payment verification work?", a: "After checkout, you'll upload proof of payment. Our team verifies it, typically within 24 hours, then unlocks your downloads." },
        { q: "Is my download link permanent?", a: "No — for security, download links are short-lived and generated only after your payment is verified." },
        { q: "Can I track my order?", a: "Yes, use the Track Order page with your order number and email at any time." },
      ] } },
    ];

    const pageRes = await client.query(
      `insert into pages (slug, title, status, published_sections, published_at)
       values ('home','Home Page','published',$1, now())
       on conflict (slug) do update set title = excluded.title
       returning id`,
      [JSON.stringify(sections)]
    );
    const homePageId = pageRes.rows[0].id;

    const existingSections = await client.query(`select count(*)::int as c from page_sections where page_id = $1`, [homePageId]);
    if (existingSections.rows[0].c === 0) {
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i];
        await client.query(
          `insert into page_sections (page_id, type, enabled, data, sort_order) values ($1,$2,$3,$4,$5)`,
          [homePageId, s.type, s.enabled, JSON.stringify(s.data), i]
        );
      }
    }
    console.log("Home page + sections ready");

    console.log("Seed complete.");
    console.log("Admin login: admin@xperaone.com / Admin@123");
    console.log("Customer login: customer@xperaone.com / Customer@123");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
