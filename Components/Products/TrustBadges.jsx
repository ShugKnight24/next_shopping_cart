import { ShieldCheckIcon, TruckIcon, RotateCcwIcon, LockIcon } from '../Icons';
import styles from './TrustBadges.module.css';

export function TrustBadges() {
  const badges = [
    {
      id: 'authentic',
      icon: ShieldCheckIcon,
      title: '100% Guaranteed Authentic',
      subtitle: 'Verified by our certified specialists',
    },
    {
      id: 'shipping',
      icon: TruckIcon,
      title: 'Fast Insured Courier',
      subtitle: 'Free express shipping on orders $50+',
    },
    {
      id: 'returns',
      icon: RotateCcwIcon,
      title: '30-Day Hassle-Free Returns',
      subtitle: 'Simple prepaid labels & full refunds',
    },
    {
      id: 'security',
      icon: LockIcon,
      title: '256-Bit Encrypted Checkout',
      subtitle: 'Bank-grade security & buyer protection',
    },
  ];

  return (
    <div className={styles.trustContainer} data-testid="trust-badges">
      {badges.map((b) => {
        const IconComponent = b.icon;
        return (
          <div key={b.id} className={styles.trustCard}>
            <div className={styles.trustIconWrapper}>
              <IconComponent size={20} />
            </div>
            <div className={styles.trustText}>
              <span className={styles.trustTitle}>{b.title}</span>
              <span className={styles.trustSubtitle}>{b.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
