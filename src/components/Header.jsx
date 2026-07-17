import { Search, SlidersHorizontal, LayoutGrid, Map as MapIcon, UtensilsCrossed, X } from 'lucide-react';
import styles from './Header.module.css';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'priceLow', label: 'Price: Low to high' },
  { value: 'priceHigh', label: 'Price: High to low' },
  { value: 'name', label: 'Name (A–Z)' },
];

export default function Header({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
  totalCount,
  onOpenFilters,
  activeFilterCount,
  viewMode,
  onViewModeChange,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <UtensilsCrossed size={18} />
          </span>
          <div className={styles.brandText}>
            <h1 className={styles.brandTitle}>Ghatkopar Eats</h1>
            <span className={styles.brandSub}>{totalCount} places · Ghatkopar &amp; nearby, Mumbai</span>
          </div>
        </div>

        <div className={styles.viewToggle}>
          <button
            className={viewMode === 'list' ? styles.viewBtnActive : styles.viewBtn}
            onClick={() => onViewModeChange('list')}
          >
            <LayoutGrid size={14} /> List
          </button>
          <button
            className={viewMode === 'map' ? styles.viewBtnActive : styles.viewBtn}
            onClick={() => onViewModeChange('map')}
          >
            <MapIcon size={14} /> Map
          </button>
        </div>
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search restaurants, cuisines, areas…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => onSearchChange('')} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        <select className={styles.sortSelect} value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button className={styles.filterBtn} onClick={onOpenFilters}>
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
        </button>
      </div>

      <div className={styles.resultLine}>
        Showing <strong>{resultCount}</strong> of {totalCount} places
      </div>
    </header>
  );
}
