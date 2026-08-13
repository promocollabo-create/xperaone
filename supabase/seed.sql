-- ============================================================================
-- DEMO SEED DATA
-- Original fictional XperaOne content — no copied names, images, or claims.
-- Run last, after schema.sql, rls.sql, and storage.sql.
-- Run this with the service role (SQL editor already runs as postgres, so
-- RLS doesn't block it).
-- ============================================================================

insert into categories (name, slug, description, display_order) values
  ('AI Tools', 'ai-tools', 'AI-powered productivity and content tools', 1),
  ('Automation', 'automation', 'Workflow and task automation kits', 2),
  ('WordPress', 'wordpress', 'Themes, plugins and site kits for WordPress', 3),
  ('Shopify', 'shopify', 'Apps and themes for Shopify stores', 4),
  ('YouTube Tools', 'youtube-tools', 'Tools for creators growing on YouTube', 5),
  ('Social Media', 'social-media', 'Scheduling, design and growth kits', 6),
  ('Developer Tools', 'developer-tools', 'Boilerplates, scripts and dev utilities', 7),
  ('Marketing', 'marketing', 'Funnels, email kits and ad templates', 8);

insert into products (
  name, slug, short_description, description, category_id, price, compare_price,
  discount_percent, featured, best_seller, new_arrival, flash_deal, status,
  rating, review_count
)
select
  p.name, p.slug, p.short_desc, p.long_desc, c.id, p.price, p.compare_price,
  p.discount, p.featured, p.best_seller, p.new_arrival, p.flash_deal, 'published',
  p.rating, p.review_count
from (values
  ('PromptForge Studio', 'promptforge-studio', 'Prompt engineering workspace for AI teams.',
   'PromptForge Studio helps teams design, version, and test prompts across multiple AI models from one workspace.',
   'ai-tools', 49.00, 79.00, 38, true, true, false, true, 4.8, 214),
  ('FlowPilot Automation Kit', 'flowpilot-automation-kit', 'No-code automation recipes for busy teams.',
   'A library of ready-made automation recipes that connect your everyday tools without writing code.',
   'automation', 39.00, 59.00, 34, true, false, false, true, 4.6, 132),
  ('NovaPress Pro Theme', 'novapress-pro-theme', 'Fast, accessible WordPress theme for creators.',
   'NovaPress Pro is a lightweight, SEO-friendly WordPress theme built for content creators and small businesses.',
   'wordpress', 29.00, 45.00, 36, false, true, false, false, 4.7, 301),
  ('ShopBoost Conversion Suite', 'shopboost-conversion-suite', 'Cart recovery and upsell app for Shopify.',
   'ShopBoost bundles cart recovery, upsells, and review widgets into a single lightweight Shopify app.',
   'shopify', 59.00, 89.00, 34, true, false, true, false, 4.5, 98),
  ('ClipCraft Thumbnail Pack', 'clipcraft-thumbnail-pack', '200 editable thumbnail templates for creators.',
   'A set of 200 fully editable thumbnail templates optimized for click-through on video platforms.',
   'youtube-tools', 19.00, 29.00, 34, false, false, true, false, 4.4, 76),
  ('SocialGrid Content Calendar', 'socialgrid-content-calendar', 'Plan and schedule a month of content in a day.',
   'SocialGrid is a content calendar and caption library that helps small teams plan a month of posts quickly.',
   'social-media', 15.00, 25.00, 40, false, false, true, true, 4.3, 54),
  ('DevKit Starter Boilerplate', 'devkit-starter-boilerplate', 'Production-ready Next.js + auth starter.',
   'A batteries-included Next.js boilerplate with authentication, billing hooks, and a component library.',
   'developer-tools', 69.00, 99.00, 30, true, true, false, false, 4.9, 187),
  ('FunnelForge Email Kit', 'funnelforge-email-kit', '40 done-for-you email sequences.',
   'FunnelForge gives you 40 proven email sequences for launches, onboarding, and re-engagement.',
   'marketing', 25.00, 40.00, 38, false, true, false, false, 4.6, 143)
) as p(name, slug, short_desc, long_desc, cat_slug, price, compare_price, discount, featured, best_seller, new_arrival, flash_deal, rating, review_count)
join categories c on c.slug = p.cat_slug;

insert into faqs (question, answer, display_order) values
  ('How do I receive my product after purchase?', 'Most products are delivered instantly to your Downloads page as soon as payment is confirmed.', 1),
  ('Do you offer refunds?', 'Yes — see our Refund Policy page for the full window and conditions.', 2),
  ('Can I use products on multiple projects?', 'Each product listing states its license terms; check the product page for details.', 3),
  ('Do you offer support after purchase?', 'Yes, our support team is available for setup questions on every product you buy.', 4);

insert into testimonials (customer_name, rating, quote, product_name, display_order) values
  ('Amara K.', 5, 'Cut our automation setup time from days to an afternoon.', 'FlowPilot Automation Kit', 1),
  ('Daniyal R.', 5, 'The theme is genuinely fast — our load times dropped noticeably.', 'NovaPress Pro Theme', 2),
  ('Priya S.', 4, 'Solid boilerplate, saved us a couple of weeks of setup.', 'DevKit Starter Boilerplate', 3);

insert into homepage_sections (key, label, is_enabled, display_order) values
  ('announcement', 'Announcement Bar', true, 1),
  ('hero', 'Hero', true, 2),
  ('stats', 'Trust Statistics', true, 3),
  ('flash_deals', 'Flash Deals', true, 4),
  ('categories', 'Shop by Category', true, 5),
  ('featured', 'Trending Products', true, 6),
  ('promo_banner', 'Promotional Banner', true, 7),
  ('why_xperaone', 'Why XperaOne', true, 8),
  ('best_sellers', 'Best Sellers', true, 9),
  ('how_it_works', 'How It Works', true, 10),
  ('new_arrivals', 'New Arrivals', true, 11),
  ('testimonials', 'Reviews', true, 12),
  ('faq', 'FAQ', true, 13),
  ('final_cta', 'Final CTA', true, 14);

update homepage_settings set hero_image_url = null where id = 1;
