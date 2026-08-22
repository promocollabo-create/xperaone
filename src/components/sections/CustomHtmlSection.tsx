import { sanitizeCustomHtml, sanitizeCustomCss } from "@/lib/sanitize";
import { str, type SectionInstance } from "./types";

// Renders admin-authored custom HTML/CSS. Defense in depth: content is
// sanitized again at render time even though it is also sanitized on save.
// No script execution, no server access, no secrets are ever reachable from
// this markup — sanitizeHtml strips <script>, event handlers, iframes, and
// any executable content.
export default function CustomHtmlSection({ section }: { section: SectionInstance }) {
  const html = sanitizeCustomHtml(str(section.data, "html"));
  const css = sanitizeCustomCss(str(section.data, "css"));

  return (
    <section className="xp-custom-section-wrapper">
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
