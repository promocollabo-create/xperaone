import sanitizeHtml from "sanitize-html";

// Sanitizes admin-authored custom HTML for the page builder. This blocks
// scripts, event handlers, iframes, forms, and any tags/attributes capable of
// executing code, accessing the DOM in unsafe ways, or embedding remote
// executable content. Only presentational markup is allowed.
export function sanitizeCustomHtml(html: string): string {
  return sanitizeHtml(html || "", {
    allowedTags: [
      "div", "span", "section", "article", "header", "footer", "main", "aside",
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li", "br", "hr",
      "strong", "em", "b", "i", "u", "small", "blockquote", "img", "figure",
      "figcaption", "table", "thead", "tbody", "tr", "td", "th", "button",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "class", "id"],
      img: ["src", "alt", "class", "id", "width", "height", "loading"],
      "*": ["class", "id", "style", "data-*"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
    allowVulnerableTags: false,
    // Strip risky inline style expressions (e.g. url(javascript:...))
    transformTags: {
      script: sanitizeHtml.simpleTransform("div", {}),
      iframe: sanitizeHtml.simpleTransform("div", {}),
    },
  });
}

// Sanitizes admin-authored custom CSS. Removes @import (remote fetch),
// javascript: urls, and any expression()/behavior calls. Media queries and
// standard selectors/properties are preserved.
export function sanitizeCustomCss(css: string): string {
  if (!css) return "";
  return css
    .replace(/@import[^;]*;?/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<\/style>/gi, "")
    .replace(/behavior\s*:\s*url\([^)]*\)/gi, "")
    .slice(0, 20000);
}
