import { useState } from 'react';

export default function SmartImage({ src, alt, className, fallbackClassName, fallbackText }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={fallbackClassName}>{fallbackText}</div>;
  }

  return <img src={src} alt={alt} loading="lazy" className={className} onError={() => setFailed(true)} />;
}
