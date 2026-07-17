import { SearchX } from 'lucide-react';
import RestaurantCard from './RestaurantCard';
import styles from './RestaurantList.module.css';

export default function RestaurantList({ restaurants, activeId, hoveredId, onSelect, onHover, onReset }) {
  if (restaurants.length === 0) {
    return (
      <div className={styles.empty}>
        <SearchX size={34} strokeWidth={1.5} />
        <h3>No places match your filters</h3>
        <p>Try loosening a filter or clearing your search to see more spots around Ghatkopar.</p>
        <button className={styles.resetBtn} onClick={onReset}>
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {restaurants.map((r) => (
        <RestaurantCard
          key={r.id}
          restaurant={r}
          isActive={r.id === activeId || r.id === hoveredId}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </div>
  );
}
