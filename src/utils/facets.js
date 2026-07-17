const GENERIC_CATEGORIES = new Set(['Restaurant', 'Takeout Restaurant']);

function countBy(items, getValues) {
  const counts = new Map();
  for (const item of items) {
    for (const value of getValues(item)) {
      if (!value) continue;
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  }
  return counts;
}

function toSortedList(counts, { limit } = {}) {
  const list = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  return limit ? list.slice(0, limit) : list;
}

export function buildFacets(restaurants) {
  const categoryCounts = countBy(restaurants, (r) => r.categories.filter((c) => !GENERIC_CATEGORIES.has(c)));
  const areaCounts = countBy(restaurants, (r) => [r.area]);
  const serviceCounts = countBy(restaurants, (r) => r.serviceOptions);
  const popularForCounts = countBy(restaurants, (r) => r.popularFor);
  const atmosphereCounts = countBy(restaurants, (r) => r.atmosphere);

  return {
    categories: toSortedList(categoryCounts, { limit: 16 }),
    areas: toSortedList(areaCounts),
    serviceOptions: toSortedList(serviceCounts),
    popularFor: toSortedList(popularForCounts),
    atmosphere: toSortedList(atmosphereCounts, { limit: 8 }),
  };
}
