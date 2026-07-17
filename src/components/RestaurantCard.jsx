import { MapPin, MessageSquare, Leaf } from 'lucide-react';
import RatingStars from './RatingStars';
import OpenStatus from './OpenStatus';
import SmartImage from './SmartImage';
import { PRICE_LEVEL_LABEL, formatReviews, shortAddress } from '../utils/format';
import styles from './RestaurantCard.module.css';

export default function RestaurantCard({ restaurant, isActive, onSelect, onHover }) {
  return (
    <article
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onSelect(restaurant.id)}
      onMouseEnter={() => onHover?.(restaurant.id)}
      onMouseLeave={() => onHover?.(null)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => (e.key === 'Enter' ? onSelect(restaurant.id) : null)}
    >
      <div className={styles.imageWrap}>
        <SmartImage
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className={styles.image}
          fallbackClassName={styles.imageFallback}
          fallbackText={restaurant.name.charAt(0)}
        />
        {restaurant.priceLevel && <span className={styles.priceTag}>{PRICE_LEVEL_LABEL[restaurant.priceLevel]}</span>}
        {restaurant.isVeg && (
          <span className={styles.vegTag} title="Pure vegetarian">
            <Leaf size={12} />
          </span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{restaurant.name}</h3>
          {restaurant.rating ? (
            <span className={styles.ratingPill}>
              {restaurant.rating.toFixed(1)}
              <RatingStars rating={restaurant.rating} size={10} />
            </span>
          ) : null}
        </div>

        <p className={styles.category}>{restaurant.primaryCategory}</p>

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <MapPin size={12} />
            {shortAddress(restaurant)?.split(',')[0]}
          </span>
          <span className={styles.metaItem}>
            <MessageSquare size={12} />
            {formatReviews(restaurant.reviewsCount)}
          </span>
        </div>

        <div className={styles.footerRow}>
          <OpenStatus restaurant={restaurant} />
          {restaurant.serviceOptions.slice(0, 2).map((s) => (
            <span key={s} className={styles.tag}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
