import { useMemo } from 'react';
import { isOpenNow } from '../utils/hours';

export const DEFAULT_FILTERS = {
  search: '',
  categories: [],
  areas: [],
  priceLevels: [],
  minRating: 0,
  minReviews: 0,
  serviceOptions: [],
  popularFor: [],
  vegOnly: false,
  openNow: false,
  hideClosed: true,
  sortBy: 'rating',
};

export function countActiveFilters(filters) {
  let count = 0;
  count += filters.categories.length;
  count += filters.areas.length;
  count += filters.priceLevels.length;
  count += filters.serviceOptions.length;
  count += filters.popularFor.length;
  if (filters.minRating > 0) count += 1;
  if (filters.minReviews > 0) count += 1;
  if (filters.vegOnly) count += 1;
  if (filters.openNow) count += 1;
  return count;
}

function sortRestaurants(list, sortBy) {
  const sorted = [...list];
  switch (sortBy) {
    case 'rating':
      sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || b.reviewsCount - a.reviewsCount);
      break;
    case 'reviews':
      sorted.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
    case 'priceLow':
      sorted.sort((a, b) => (a.priceLevel ?? 99) - (b.priceLevel ?? 99));
      break;
    case 'priceHigh':
      sorted.sort((a, b) => (b.priceLevel ?? -1) - (a.priceLevel ?? -1));
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return sorted;
}

export function useFilteredRestaurants(restaurants, filters) {
  return useMemo(() => {
    const now = new Date();
    const search = filters.search.trim().toLowerCase();

    const filtered = restaurants.filter((r) => {
      if (filters.hideClosed && r.temporarilyClosed) return false;

      if (search) {
        const haystack = `${r.name} ${r.localName ?? ''} ${r.categories.join(' ')} ${r.neighborhood ?? ''}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      if (filters.categories.length && !filters.categories.some((c) => r.categories.includes(c))) return false;
      if (filters.areas.length && !filters.areas.includes(r.area)) return false;
      if (filters.priceLevels.length && !filters.priceLevels.includes(r.priceLevel)) return false;
      if (filters.minRating > 0 && (r.rating ?? 0) < filters.minRating) return false;
      if (filters.minReviews > 0 && r.reviewsCount < filters.minReviews) return false;
      if (filters.serviceOptions.length && !filters.serviceOptions.every((s) => r.serviceOptions.includes(s))) return false;
      if (filters.popularFor.length && !filters.popularFor.some((p) => r.popularFor.includes(p))) return false;
      if (filters.vegOnly && !r.isVeg) return false;
      if (filters.openNow && isOpenNow(r.openingHours, now) !== true) return false;

      return true;
    });

    return sortRestaurants(filtered, filters.sortBy);
  }, [restaurants, filters]);
}
