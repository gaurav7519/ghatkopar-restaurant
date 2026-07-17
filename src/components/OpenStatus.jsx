import { useMemo } from 'react';
import { isOpenNow, todayHoursLabel } from '../utils/hours';
import styles from './OpenStatus.module.css';

export default function OpenStatus({ restaurant, showHours = false }) {
  const open = useMemo(() => isOpenNow(restaurant.openingHours), [restaurant.openingHours]);
  const hoursLabel = useMemo(() => todayHoursLabel(restaurant.openingHours), [restaurant.openingHours]);

  if (restaurant.temporarilyClosed) {
    return <span className={`${styles.badge} ${styles.closed}`}>Temporarily closed</span>;
  }
  if (open === null) return null;

  return (
    <span className={`${styles.badge} ${open ? styles.open : styles.closed}`}>
      <span className={styles.dot} />
      {open ? 'Open now' : 'Closed now'}
      {showHours && hoursLabel ? <span className={styles.hours}>· {hoursLabel}</span> : null}
    </span>
  );
}
