import { Star } from 'lucide-react';
import styles from './RatingStars.module.css';

export default function RatingStars({ rating, size = 13 }) {
  if (!rating) return null;
  const full = Math.round(rating * 2) / 2;

  return (
    <span className={styles.stars} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => {
        const fillPct = Math.max(0, Math.min(1, full - (i - 1))) * 100;
        return (
          <span key={i} className={styles.starWrap} style={{ width: size, height: size }}>
            <Star size={size} className={styles.starBase} strokeWidth={1.75} />
            <span className={styles.starFillClip} style={{ width: `${fillPct}%` }}>
              <Star size={size} className={styles.starFill} strokeWidth={1.75} fill="currentColor" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
