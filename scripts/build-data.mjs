// Transforms the raw Apify Google-Places scrape into a lean dataset for the app.
// Run with: node scripts/build-data.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const raw = JSON.parse(
  readFileSync(join(root, 'dataset_crawler-google-places_2026-07-17_10-51-29-761.json'), 'utf8')
);

// Categories that indicate the scrape mis-tagged a non-food business; drop these entirely.
const NON_FOOD_CATEGORIES = new Set([
  'Fabrication engineer',
  'Building materials supplier',
  'Metal fabricator',
  'Safety equipment supplier',
  'Shed builder',
  'Steel fabricator',
  'Welder',
  'Window installation service',
]);

function flattenGroup(group) {
  if (!group) return [];
  return group.flatMap((obj) =>
    Object.entries(obj)
      .filter(([, v]) => v === true)
      .map(([k]) => k)
  );
}

function parsePrice(priceStr) {
  if (!priceStr) return { min: null, max: null, level: null };
  const nums = priceStr.replace(/,/g, '').match(/\d+/g);
  if (!nums) return { min: null, max: null, level: null };
  const min = parseInt(nums[0], 10);
  const max = nums[1] ? parseInt(nums[1], 10) : min;
  let level;
  if (max <= 200) level = 1;
  else if (max <= 500) level = 2;
  else if (max <= 1000) level = 3;
  else level = 4;
  return { min, max, level };
}

const AREA_PATTERNS = [
  ['Ghatkopar West', /ghatkopar\s*west|ghatkopar\s*\[?w\b/i],
  ['Ghatkopar East', /ghatkopar\s*east|ghatkopar\s*\(?e\b/i],
  ['Chembur', /chembur/i],
  ['Kurla', /kurla/i],
  ['Vidyavihar', /vidya\s*vihar|vidyavihar/i],
  ['Sakinaka', /sakinaka/i],
  ['Asalpha', /asalpha/i],
  ['Andheri', /andheri/i],
  ['Ghatkopar', /ghatkopar/i],
];

function inferArea(d) {
  const hay = `${d.neighborhood || ''} ${d.address || ''}`;
  for (const [label, re] of AREA_PATTERNS) {
    if (re.test(hay)) return label;
  }
  return 'Nearby';
}

// Keep only the categories that are actually cuisine/venue-type descriptors people filter by.
const CATEGORY_ALLOW = new Set([
  'Restaurant', 'Bar', 'Non vegetarian restaurant', 'South Indian restaurant',
  'Breakfast restaurant', 'Chinese restaurant', 'Family restaurant', 'Punjabi restaurant',
  'Vegetarian restaurant', 'North Indian restaurant', 'Takeout Restaurant',
  'Fast food restaurant', 'Sandwich shop', 'Indian restaurant', 'Candy store',
  'Dessert restaurant', 'Dessert shop', 'Gourmet grocery store', 'Indian sweets shop',
  'Snack bar', 'Seafood restaurant', 'Asian restaurant', 'Cocktail bar',
  'Fine dining restaurant', 'Marathi restaurant', 'Banquet hall', 'Pizza restaurant',
  'Italian restaurant', 'Pizza delivery', 'Pizza Takeout', 'Cafe', 'Indian takeaway',
  'Juice shop', 'Mughlai restaurant', 'Country food restaurant', 'Momo restaurant',
  'Food court', 'Panipuri shop', 'Caterer', 'Tiffin center', 'Bar & grill',
  'Cafeteria', 'Chicken restaurant', 'American restaurant', 'Chicken shop',
  'Fusion restaurant', 'Patisserie', 'Bakery', 'Catering food and drink supplier',
  'Frozen dessert supplier', 'Gluten-free restaurant', 'Health food store',
  'Vegan restaurant', 'Coffee shop', 'Coffee store', 'Continental restaurant',
]);

const cleaned = raw
  .filter((d) => !(d.categories || []).some((c) => NON_FOOD_CATEGORIES.has(c)))
  .filter((d) => d.location && typeof d.location.lat === 'number')
  .map((d) => {
    const ai = d.additionalInfo || {};
    const serviceOptions = flattenGroup(ai['Service options']);
    const offerings = flattenGroup(ai['Offerings']);
    const popularFor = flattenGroup(ai['Popular for']);
    const atmosphere = flattenGroup(ai['Atmosphere']);
    const highlights = flattenGroup(ai['Highlights']);
    const diningOptions = flattenGroup(ai['Dining options']);
    const planning = flattenGroup(ai['Planning']);
    const { min, max, level } = parsePrice(d.price);
    const categories = (d.categories || []).filter((c) => CATEGORY_ALLOW.has(c));

    const isVeg = offerings.includes('Vegetarian options only') || d.categories?.includes('Vegetarian restaurant');
    const hasVeganOptions = offerings.includes('Vegan options') || d.categories?.includes('Vegan restaurant');
    const hasHalal = offerings.includes('Halal food');
    const servesAlcohol = offerings.some((o) => ['Alcohol', 'Beer', 'Wine', 'Hard liquor', 'Cocktails'].includes(o));

    return {
      id: d.placeId,
      name: d.title,
      localName: d.subTitle && d.subTitle !== d.title ? d.subTitle : null,
      rating: d.totalScore ?? null,
      reviewsCount: d.reviewsCount ?? 0,
      price: d.price ?? null,
      priceMin: min,
      priceMax: max,
      priceLevel: level, // 1=budget..4=premium
      categories: categories.length ? categories : (d.categoryName ? [d.categoryName] : []),
      primaryCategory: d.categoryName || categories[0] || 'Restaurant',
      address: d.address,
      neighborhood: d.neighborhood,
      area: inferArea(d),
      lat: d.location.lat,
      lng: d.location.lng,
      phone: d.phone,
      imageUrl: d.imageUrl || null,
      mapsUrl: d.url,
      openingHours: d.openingHours || [],
      temporarilyClosed: !!d.temporarilyClosed,
      serviceOptions,
      offerings,
      popularFor: popularFor.length ? popularFor : diningOptions,
      atmosphere,
      highlights,
      isVeg,
      hasVeganOptions,
      hasHalal,
      servesAlcohol,
      outdoorSeating: serviceOptions.includes('Outdoor seating'),
      acceptsReservations: planning.includes('Accepts reservations') || planning.some((p) => p.includes('reservation')),
    };
  });

mkdirSync(join(root, 'src', 'data'), { recursive: true });
writeFileSync(join(root, 'src', 'data', 'restaurants.json'), JSON.stringify(cleaned));

console.log(`Wrote ${cleaned.length} restaurants to src/data/restaurants.json`);
