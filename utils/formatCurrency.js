export function formatCurrency(value, currency = "NGN", locale = "en-NG", { compact = false } = {}) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price on request";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: compact ? "compact" : "standard",
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatListingPrice(property, options) {
  const price = formatCurrency(property?.price, property?.currency || "NGN", "en-NG", options);
  return property?.listingType === "rent" ? `${price} / year` : price;
}
