export const PRICE_LEVEL_LABEL = {
  1: '₹',
  2: '₹₹',
  3: '₹₹₹',
  4: '₹₹₹₹',
};

export const PRICE_LEVEL_DESCRIPTION = {
  1: 'Budget (under ₹200)',
  2: 'Moderate (₹200–500)',
  3: 'Upscale (₹500–1,000)',
  4: 'Premium (₹1,000+)',
};

export function formatReviews(count) {
  if (!count) return 'No reviews yet';
  if (count === 1) return '1 review';
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k reviews`;
  return `${count} reviews`;
}

export function shortAddress(restaurant) {
  return restaurant.neighborhood || restaurant.area || restaurant.address;
}
