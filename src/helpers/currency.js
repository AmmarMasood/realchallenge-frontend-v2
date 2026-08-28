// Challenge.currency is stored inconsistently: the admin challenge form writes
// the symbol "€", while seeded/imported challenges carry the ISO code "EUR".
// Checkout used to test `currency === "€"` and fall back to "USD", so every
// EUR-coded challenge was sent to Mollie priced in dollars. Normalise here.

// Must stay in step with the backend's services/pricing.js. If the two lists
// disagree, a price can render in one currency and be charged in another.
const ISO_BY_SYMBOL = { "€": "EUR", $: "USD", "د.إ": "AED" };
const SYMBOL_BY_ISO = { EUR: "€", USD: "$", AED: "د.إ" };

export const SUPPORTED_CURRENCIES = ["EUR", "USD", "AED"];

const DEFAULT_ISO = "EUR";

/** ISO 4217 code for Mollie, from either a symbol or a code. Defaults to EUR. */
export function toCurrencyCode(currency) {
  if (!currency) return DEFAULT_ISO;
  const raw = String(currency).trim();
  if (ISO_BY_SYMBOL[raw]) return ISO_BY_SYMBOL[raw];
  const upper = raw.toUpperCase();
  return SYMBOL_BY_ISO[upper] ? upper : DEFAULT_ISO;
}

/** Display symbol, from either a symbol or a code. Defaults to €. */
export function toCurrencySymbol(currency) {
  return SYMBOL_BY_ISO[toCurrencyCode(currency)] || "€";
}
