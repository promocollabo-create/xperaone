import HeroSection from "./HeroSection";
import CategoriesSection from "./CategoriesSection";
import FeaturedProductsSection from "./FeaturedProductsSection";
import ProductGridSection from "./ProductGridSection";
import WhatsNewFeedSection from "./WhatsNewFeedSection";
import BannerSection from "./BannerSection";
import BenefitsSection from "./BenefitsSection";
import CtaSection from "./CtaSection";
import NewsletterSection from "./NewsletterSection";
import FaqSection from "./FaqSection";
import CustomHtmlSection from "./CustomHtmlSection";
import { HeadingSection, TextSection, ImageSection, ButtonSection } from "./SimpleSections";
import type { SectionInstance } from "./types";

export const SECTION_TYPES = [
  { type: "hero", label: "Hero" },
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "button", label: "Button" },
  { type: "categories", label: "Categories" },
  { type: "featured_products", label: "Featured Products" },
  { type: "product_grid", label: "Product Grid" },
  { type: "whats_new_feed", label: "What's New Feed" },
  { type: "banner", label: "Banner" },
  { type: "benefits", label: "Benefits" },
  { type: "cta", label: "CTA" },
  { type: "newsletter", label: "Newsletter" },
  { type: "faq", label: "FAQ" },
  { type: "custom_html", label: "Custom HTML" },
] as const;

export default function SectionRenderer({ sections }: { sections: SectionInstance[] }) {
  return (
    <>
      {sections
        .filter((s) => s.enabled)
        .map((section) => (
          <RenderOne key={section.id} section={section} />
        ))}
    </>
  );
}

function RenderOne({ section }: { section: SectionInstance }) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} />;
    case "heading":
      return <HeadingSection section={section} />;
    case "text":
      return <TextSection section={section} />;
    case "image":
      return <ImageSection section={section} />;
    case "button":
      return <ButtonSection section={section} />;
    case "categories":
      return <CategoriesSection section={section} />;
    case "featured_products":
      return <FeaturedProductsSection section={section} />;
    case "product_grid":
      return <ProductGridSection section={section} />;
    case "whats_new_feed":
      return <WhatsNewFeedSection section={section} />;
    case "banner":
      return <BannerSection section={section} />;
    case "benefits":
      return <BenefitsSection section={section} />;
    case "cta":
      return <CtaSection section={section} />;
    case "newsletter":
      return <NewsletterSection section={section} />;
    case "faq":
      return <FaqSection section={section} />;
    case "custom_html":
      return <CustomHtmlSection section={section} />;
    default:
      return null;
  }
}
