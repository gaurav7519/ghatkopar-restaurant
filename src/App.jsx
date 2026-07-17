import { useMemo, useState } from 'react';
import { Map as MapIcon, LayoutGrid } from 'lucide-react';
import Header from './components/Header';
import FilterPanel from './components/FilterPanel';
import RestaurantList from './components/RestaurantList';
import MapView from './components/MapView';
import MapErrorBoundary from './components/MapErrorBoundary';
import RestaurantDetail from './components/RestaurantDetail';
import rawRestaurants from './data/restaurants.json';
import { buildFacets } from './utils/facets';
import { DEFAULT_FILTERS, countActiveFilters, useFilteredRestaurants } from './hooks/useFilteredRestaurants';
import styles from './App.module.css';

function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState('list');
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const facets = useMemo(() => buildFacets(rawRestaurants), []);
  const filtered = useFilteredRestaurants(rawRestaurants, filters);
  const detailRestaurant = useMemo(() => rawRestaurants.find((r) => r.id === detailId) || null, [detailId]);

  const handleSelect = (id) => {
    setActiveId(id);
    setDetailId(id);
  };

  return (
    <div className={styles.app}>
      <Header
        search={filters.search}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search }))}
        sortBy={filters.sortBy}
        onSortChange={(sortBy) => setFilters((f) => ({ ...f, sortBy }))}
        resultCount={filtered.length}
        totalCount={rawRestaurants.length}
        onOpenFilters={() => setFilterOpen(true)}
        activeFilterCount={countActiveFilters(filters)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <FilterPanel filters={filters} setFilters={setFilters} facets={facets} resultCount={filtered.length} />
        </aside>

        <div className={styles.content} data-view={viewMode}>
          <div className={styles.listPane}>
            <RestaurantList
              restaurants={filtered}
              activeId={activeId}
              hoveredId={hoveredId}
              onSelect={handleSelect}
              onHover={setHoveredId}
              onReset={() => setFilters(DEFAULT_FILTERS)}
            />
          </div>
          <div className={styles.mapPane}>
            <MapErrorBoundary resetKey={filters}>
              <MapView
                restaurants={filtered}
                activeId={activeId ?? hoveredId}
                hoveredId={hoveredId}
                onSelect={handleSelect}
                onHover={setHoveredId}
              />
            </MapErrorBoundary>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className={styles.filterOverlay}>
          <div className={styles.filterOverlayBackdrop} onClick={() => setFilterOpen(false)} />
          <div className={styles.filterOverlayPanel}>
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              facets={facets}
              resultCount={filtered.length}
              onClose={() => setFilterOpen(false)}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.floatingToggle}
        onClick={() => setViewMode((v) => (v === 'list' ? 'map' : 'list'))}
      >
        {viewMode === 'list' ? (
          <>
            <MapIcon size={16} /> View map
          </>
        ) : (
          <>
            <LayoutGrid size={16} /> View list
          </>
        )}
      </button>

      <RestaurantDetail restaurant={detailRestaurant} onClose={() => setDetailId(null)} />
    </div>
  );
}

export default App;
