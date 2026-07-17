import { AnimatePresence, motion } from 'framer-motion';
import { X, Phone, MapPin, ExternalLink, MessageSquare, Leaf, Wine } from 'lucide-react';
import RatingStars from './RatingStars';
import OpenStatus from './OpenStatus';
import SmartImage from './SmartImage';
import { PRICE_LEVEL_LABEL, formatReviews } from '../utils/format';
import styles from './RestaurantDetail.module.css';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RestaurantDetail({ restaurant, onClose }) {
  return (
    <AnimatePresence>
      {restaurant && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
          >
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>

            <div className={styles.heroWrap}>
              <SmartImage
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className={styles.hero}
                fallbackClassName={styles.heroFallback}
                fallbackText={restaurant.name.charAt(0)}
              />
              <div className={styles.heroGradient} />
            </div>

            <div className={styles.content}>
              <div className={styles.titleBlock}>
                <h2 className={styles.name}>{restaurant.name}</h2>
                {restaurant.localName && <p className={styles.localName}>{restaurant.localName}</p>}
                <p className={styles.category}>{restaurant.categories.join(' · ') || restaurant.primaryCategory}</p>
              </div>

              <div className={styles.statRow}>
                {restaurant.rating ? (
                  <div className={styles.statBlock}>
                    <span className={styles.statValue}>{restaurant.rating.toFixed(1)}</span>
                    <RatingStars rating={restaurant.rating} size={13} />
                    <span className={styles.statLabel}>{formatReviews(restaurant.reviewsCount)}</span>
                  </div>
                ) : (
                  <div className={styles.statBlock}>
                    <span className={styles.statLabel}>No ratings yet</span>
                  </div>
                )}
                {restaurant.priceLevel && (
                  <div className={styles.statBlock}>
                    <span className={styles.statValue}>{PRICE_LEVEL_LABEL[restaurant.priceLevel]}</span>
                    <span className={styles.statLabel}>{restaurant.price}</span>
                  </div>
                )}
                <div className={styles.statBlock}>
                  <OpenStatus restaurant={restaurant} showHours />
                </div>
              </div>

              <div className={styles.actionRow}>
                {restaurant.phone && (
                  <a className={styles.actionBtnPrimary} href={`tel:${restaurant.phoneUnformatted || restaurant.phone}`}>
                    <Phone size={15} /> Call
                  </a>
                )}
                <a className={styles.actionBtn} href={restaurant.mapsUrl} target="_blank" rel="noreferrer">
                  <MapPin size={15} /> Directions
                </a>
                <a
                  className={styles.actionBtn}
                  href={`https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={15} /> View on Maps
                </a>
              </div>

              <Section title="Address">
                <p className={styles.address}>{restaurant.address}</p>
              </Section>

              {(restaurant.isVeg || restaurant.hasVeganOptions || restaurant.hasHalal || restaurant.servesAlcohol) && (
                <Section title="Dietary & bar">
                  <div className={styles.tagWrap}>
                    {restaurant.isVeg && (
                      <span className={styles.tagGood}>
                        <Leaf size={12} /> Pure veg
                      </span>
                    )}
                    {restaurant.hasVeganOptions && (
                      <span className={styles.tagGood}>
                        <Leaf size={12} /> Vegan options
                      </span>
                    )}
                    {restaurant.hasHalal && <span className={styles.tag}>Halal food</span>}
                    {restaurant.servesAlcohol && (
                      <span className={styles.tag}>
                        <Wine size={12} /> Serves alcohol
                      </span>
                    )}
                  </div>
                </Section>
              )}

              {restaurant.serviceOptions.length > 0 && (
                <Section title="Service options">
                  <div className={styles.tagWrap}>
                    {restaurant.serviceOptions.map((s) => (
                      <span key={s} className={styles.tag}>
                        {s}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {restaurant.atmosphere.length > 0 && (
                <Section title="Atmosphere">
                  <div className={styles.tagWrap}>
                    {restaurant.atmosphere.map((s) => (
                      <span key={s} className={styles.tag}>
                        {s}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {restaurant.highlights.length > 0 && (
                <Section title="Highlights">
                  <div className={styles.tagWrap}>
                    {restaurant.highlights.map((s) => (
                      <span key={s} className={styles.tagGood}>
                        {s}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {restaurant.openingHours.length > 0 && (
                <Section title="Hours">
                  <ul className={styles.hoursList}>
                    {DAY_ORDER.map((day) => {
                      const entry = restaurant.openingHours.find((h) => h.day === day);
                      return (
                        <li key={day} className={styles.hoursRow}>
                          <span>{day}</span>
                          <span className={entry?.hours === 'Closed' ? styles.hoursClosed : ''}>{entry?.hours || '—'}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              )}

              {restaurant.reviewsCount > 0 && (
                <a
                  className={styles.reviewsLink}
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageSquare size={14} /> Read {formatReviews(restaurant.reviewsCount)} on Google Maps
                </a>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>{title}</h4>
      {children}
    </div>
  );
}
