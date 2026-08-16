// Central currency formatting so the storefront respects Admin → Settings →
// Currency instead of every page hardcoding "$". Falls back to USD if
// site_settings.currency is unset or unrecognized.

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs.",
  GBP: "£",
  EUR: "€",
  INR: "Rs.",
  AED: "AED",
  SAR: "SAR",
  CAD: "CA$",
  AUD: "A$",
};

export function formatMoney(amount: number, currencyCode?: string | null): string {
  const code = (currencyCode || "USD").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? code + " ";
  // PKR/INR conventionally show no decimals for round amounts; keep it
  // simple and consistent by always showing 2 decimals except for these.
  const noDecimals = code === "PKR" || code === "INR";
  const formatted = noDecimals
    ? Math.round(amount).toLocaleString()
    : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol} ${formatted}`.replace(/\s+/g, " ").trim();
}
