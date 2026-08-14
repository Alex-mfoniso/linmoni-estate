export function apiQuery(values = {}) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function propertyQuery({ page = 1, limit = 12, search, filters = {}, sort = "newest" } = {}) {
  return {
    page,
    limit,
    search: search?.trim() || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    minBedrooms: filters.bedrooms || undefined,
    minBathrooms: filters.bathrooms || undefined,
    propertyType: filters.propertyType && filters.propertyType !== "all" ? filters.propertyType.toLowerCase() : undefined,
    sort,
  };
}

export function toggleId(ids, target) {
  const next = new Set(ids);
  next.has(target) ? next.delete(target) : next.add(target);
  return next;
}

export function bookingDate(date, time, offset = "+01:00") {
  if (!date?.trim() || !time?.trim()) return null;
  const parsed = new Date(`${date.trim()}T${time.trim()}:00${offset}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function canBookProperty(status) {
  return status === "active";
}

export function canCancelBooking(status, scheduledAt, now = Date.now()) {
  return ["pending", "confirmed", "reschedule_requested"].includes(status)
    && new Date(scheduledAt).getTime() - Number(now) >= 12 * 60 * 60 * 1000;
}
