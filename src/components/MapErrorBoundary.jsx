import { Component } from 'react';
import { MapPin } from 'lucide-react';
import styles from './MapErrorBoundary.module.css';

export default class MapErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Map failed to render:', error);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback}>
          <MapPin size={28} strokeWidth={1.5} />
          <p>The map couldn't load right now.</p>
          <span>The list still works normally — try switching views again.</span>
        </div>
      );
    }
    return this.props.children;
  }
}
