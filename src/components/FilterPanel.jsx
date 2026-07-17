import { X, Leaf, Clock3, Star, MessageSquare } from 'lucide-react';
import { PRICE_LEVEL_LABEL, PRICE_LEVEL_DESCRIPTION } from '../utils/format';
import { countActiveFilters } from '../hooks/useFilteredRestaurants';
import styles from './FilterPanel.module.css';

const RATING_STEPS = [4.5, 4, 3.5, 3];
const REVIEW_STEPS = [10, 25, 50, 100];

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button type="button" className={`${styles.chip} ${active ? styles.chipActive : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default function FilterPanel({ filters, setFilters, facets, resultCount, onClose }) {
  const activeCount = countActiveFilters(filters);

  const update = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  const reset = () =>
    setFilters((prev) => ({
      ...prev,
      categories: [],
      areas: [],
      priceLevels: [],
      minRating: 0,
      minReviews: 0,
      serviceOptions: [],
      popularFor: [],
      vegOnly: false,
      openNow: false,
    }));

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.headerTitle}>Filters</h3>
          <span className={styles.headerCount}>{resultCount} places</span>
        </div>
        <div className={styles.headerActions}>
          {activeCount > 0 && (
            <button className={styles.clearBtn} onClick={reset}>
              Clear ({activeCount})
            </button>
          )}
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close filters">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.scrollArea}>
        <Section title="Quick picks">
          <div className={styles.quickRow}>
            <button
              className={`${styles.quickBtn} ${filters.openNow ? styles.quickBtnActive : ''}`}
              onClick={() => update({ openNow: !filters.openNow })}
            >
              <Clock3 size={14} />
              Open now
            </button>
            <button
              className={`${styles.quickBtn} ${filters.vegOnly ? styles.quickBtnActive : ''}`}
              onClick={() => update({ vegOnly: !filters.vegOnly })}
            >
              <Leaf size={14} />
              Pure veg
            </button>
          </div>
        </Section>

        <Section title="Rating">
          <div className={styles.ratingRow}>
            {RATING_STEPS.map((r) => (
              <button
                key={r}
                className={`${styles.ratingBtn} ${filters.minRating === r ? styles.ratingBtnActive : ''}`}
                onClick={() => update({ minRating: filters.minRating === r ? 0 : r })}
              >
                <Star size={12} fill="currentColor" />
                {r}+
              </button>
            ))}
          </div>
        </Section>

        <Section title="Reviews">
          <div className={styles.ratingRow}>
            {REVIEW_STEPS.map((n) => (
              <button
                key={n}
                className={`${styles.ratingBtn} ${filters.minReviews === n ? styles.ratingBtnActive : ''}`}
                onClick={() => update({ minReviews: filters.minReviews === n ? 0 : n })}
              >
                <MessageSquare size={12} />
                {n}+
              </button>
            ))}
          </div>
        </Section>

        <Section title="Price">
          <div className={styles.priceRow}>
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                title={PRICE_LEVEL_DESCRIPTION[level]}
                className={`${styles.priceBtn} ${filters.priceLevels.includes(level) ? styles.priceBtnActive : ''}`}
                onClick={() => update({ priceLevels: toggleInArray(filters.priceLevels, level) })}
              >
                {PRICE_LEVEL_LABEL[level]}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Cuisine & type">
          <div className={styles.chipWrap}>
            {facets.categories.map(({ value, count }) => (
              <Chip
                key={value}
                active={filters.categories.includes(value)}
                onClick={() => update({ categories: toggleInArray(filters.categories, value) })}
              >
                {value}
                <span className={styles.chipCount}>{count}</span>
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Area">
          <div className={styles.chipWrap}>
            {facets.areas.map(({ value, count }) => (
              <Chip key={value} active={filters.areas.includes(value)} onClick={() => update({ areas: toggleInArray(filters.areas, value) })}>
                {value}
                <span className={styles.chipCount}>{count}</span>
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Good for">
          <div className={styles.chipWrap}>
            {facets.popularFor.map(({ value, count }) => (
              <Chip
                key={value}
                active={filters.popularFor.includes(value)}
                onClick={() => update({ popularFor: toggleInArray(filters.popularFor, value) })}
              >
                {value}
                <span className={styles.chipCount}>{count}</span>
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="Service">
          <div className={styles.chipWrap}>
            {facets.serviceOptions.map(({ value, count }) => (
              <Chip
                key={value}
                active={filters.serviceOptions.includes(value)}
                onClick={() => update({ serviceOptions: toggleInArray(filters.serviceOptions, value) })}
              >
                {value}
                <span className={styles.chipCount}>{count}</span>
              </Chip>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
