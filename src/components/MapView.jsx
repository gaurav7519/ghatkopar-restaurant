import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { formatReviews } from '../utils/format';
import styles from './MapView.module.css';

const GHATKOPAR_CENTER = [19.0863, 72.9081];

// Approximate on-screen footprint of a label card, used for collision detection.
const LABEL_WIDTH = 158;
const LABEL_HEIGHT = 52;
const LABEL_GAP = 6;

function buildIcon({ id, active, rating, hovered }) {
  const size = active ? 40 : hovered ? 36 : 30;
  const bg = active || hovered ? '#f3b859' : '#1c1916';
  const border = active || hovered ? '#f3b859' : 'rgba(255,255,255,0.35)';
  const textColor = active || hovered ? '#241a08' : '#f6efe4';
  const label = rating ? rating.toFixed(1) : '•';

  const html = `
    <div class="${styles.pin}" data-marker-id="${id}" style="width:${size}px;height:${size}px;background:${bg};border-color:${border};">
      <span style="color:${textColor}">${label}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: `map-marker-pin ${active ? 'is-active' : ''}`,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    tooltipAnchor: [0, -(size + 2)],
  });
}

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  const size = count < 10 ? 38 : count < 30 ? 46 : 56;
  return L.divIcon({
    html: `<div class="${styles.cluster}" style="width:${size}px;height:${size}px;">${count}</div>`,
    className: 'map-cluster-icon',
    iconSize: [size, size],
  });
}

function MapController({ activeRestaurant }) {
  const map = useMap();
  useEffect(() => {
    if (activeRestaurant) {
      map.flyTo([activeRestaurant.lat, activeRestaurant.lng], Math.max(map.getZoom(), 15), {
        duration: 0.6,
      });
    }
  }, [activeRestaurant, map]);
  return null;
}

// Decides which currently-visible (unclustered) pins get a text label, so labels
// never overlap: higher-rated places win ties, everyone else keeps just the pin.
function LabelDeclutter({ restaurants, onVisibleChange }) {
  const map = useMap();
  const timeoutRef = useRef(null);
  const byId = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), [restaurants]);

  const recompute = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const container = map.getContainer();
      const pinEls = container.querySelectorAll('[data-marker-id]');
      const containerRect = container.getBoundingClientRect();

      const candidates = [];
      pinEls.forEach((el) => {
        const id = el.getAttribute('data-marker-id');
        const r = byId.get(id);
        if (!r) return;
        const rect = el.getBoundingClientRect();
        candidates.push({
          id,
          rating: r.rating ?? 0,
          reviewsCount: r.reviewsCount ?? 0,
          cx: rect.left + rect.width / 2 - containerRect.left,
          top: rect.top - containerRect.top,
        });
      });

      candidates.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);

      const accepted = [];
      const visible = new Set();
      for (const c of candidates) {
        const box = {
          left: c.cx - LABEL_WIDTH / 2,
          right: c.cx + LABEL_WIDTH / 2,
          top: c.top - LABEL_HEIGHT,
          bottom: c.top,
        };
        const collides = accepted.some(
          (b) =>
            box.left < b.right + LABEL_GAP &&
            box.right > b.left - LABEL_GAP &&
            box.top < b.bottom + LABEL_GAP &&
            box.bottom > b.top - LABEL_GAP
        );
        if (!collides) {
          accepted.push(box);
          visible.add(c.id);
        }
      }

      onVisibleChange(visible);
    }, 160);
  }, [map, byId, onVisibleChange]);

  useMapEvents({ moveend: recompute, zoomend: recompute, resize: recompute });

  useEffect(() => {
    recompute();
    return () => clearTimeout(timeoutRef.current);
  }, [recompute]);

  return null;
}

function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function MapView({ restaurants, activeId, hoveredId, onSelect, onHover }) {
  const [visibleLabelIds, setVisibleLabelIds] = useState(() => new Set(restaurants.map((r) => r.id)));
  const activeRestaurant = useMemo(() => restaurants.find((r) => r.id === activeId) || null, [restaurants, activeId]);

  return (
    <MapContainer center={GHATKOPAR_CENTER} zoom={14} className={styles.map} zoomControl={true} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />

      <MapController activeRestaurant={activeRestaurant} />
      <MapResizeHandler />
      <LabelDeclutter restaurants={restaurants} onVisibleChange={setVisibleLabelIds} />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={50}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
      >
        {restaurants.map((r) => {
          const isFocused = r.id === activeId || r.id === hoveredId;
          const showLabel = isFocused || visibleLabelIds.has(r.id);

          return (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={buildIcon({ id: r.id, active: r.id === activeId, hovered: r.id === hoveredId, rating: r.rating })}
              eventHandlers={{
                click: () => onSelect(r.id),
                mouseover: () => onHover?.(r.id),
                mouseout: () => onHover?.(null),
              }}
            >
              {showLabel && (
                <Tooltip permanent direction="top" opacity={1} className={`${styles.markerLabel} map-label-tooltip`}>
                  <div className={`${styles.labelCard} ${isFocused ? styles.labelCardActive : ''}`}>
                    <div className={styles.labelName}>{r.name}</div>
                    <div className={styles.labelCategory}>{r.primaryCategory}</div>
                    <div className={styles.labelMeta}>
                      {r.rating ? `★ ${r.rating.toFixed(1)}` : 'New'} · {formatReviews(r.reviewsCount)}
                    </div>
                  </div>
                </Tooltip>
              )}
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
