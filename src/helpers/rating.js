// Star-rating display helpers.
//
// `rating` on Challenge/Recipe is a stored AVERAGE (sum of review scores /
// review count), so it is usually fractional — 4.5, 4.33, 3.875. Building a
// star row with `new Array(rating)` throws "RangeError: Invalid array length"
// and, with no error boundary above these cards, takes the whole page down.
// Always go through these helpers.

export const MAX_STARS = 5;

/** Whole number of filled stars, clamped to 0..MAX_STARS. */
export const filledStars = (rating) => {
  const n = Math.round(Number(rating) || 0);
  return Math.min(MAX_STARS, Math.max(0, n));
};

/** Remaining empty stars, so filled + empty always === MAX_STARS. */
export const emptyStars = (rating) => MAX_STARS - filledStars(rating);
