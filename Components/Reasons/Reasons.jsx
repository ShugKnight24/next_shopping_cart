import { useEffect, useRef, useState } from 'react';
import styles from './Reasons.module.css';

const reasons = [
  {
    id: 'charity',
    // TODO: Change to SVG of Hands Holding Heart
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    title: 'Support Local Charities',
    description:
      '10% of our profits support local charities and make a difference in our community.',
    stat: '10%',
    statLabel: 'to charity',
    accent: 'rose',
  },
  {
    id: 'shipping',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Lightning Fast Delivery',
    description: 'Free shipping on all orders over $100. Tracking included.',
    stat: 'FREE',
    statLabel: 'over $100',
    accent: 'blue',
  },
  {
    id: 'quality',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    title: 'Award-Winning Quality',
    description:
      'Premium materials + expert craftsmanship = Products built to stand the test of time.',
    stat: '5★',
    statLabel: 'rated',
    accent: 'gold',
  },
  {
    id: 'guarantee',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Money Back Guarantee',
    description:
      'Not satisfied? We will make it right or full refund within 30 days, no questions asked.',
    stat: '30',
    statLabel: 'day returns',
    accent: 'emerald',
  },
  {
    id: 'support',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    ),
    title: 'Expert Support',
    description:
      'Our dedicated team is here to help you with any questions you may have.',
    stat: '24/7',
    statLabel: 'support',
    accent: 'violet',
  },
];

function ReasonCard({ reason, index, isVisible }) {
  return (
    <div
      className={`${styles.reasonCard} ${styles[reason.accent]} ${isVisible ? styles.visible : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={styles.cardInner}>
        {/* Decorative background */}
        <div className={styles.cardBackground}>
          <div className={styles.gradientOrb} />
          <div className={styles.patternOverlay} />
        </div>

        {/* Icon */}
        <div className={styles.iconContainer}>
          <div className={styles.iconGlow} />
          <div className={styles.icon}>{reason.icon}</div>
        </div>

        {/* Content */}
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{reason.title}</h3>
          <p className={styles.cardDescription}>{reason.description}</p>
        </div>

        {/* Stat badge */}
        <div className={styles.statBadge}>
          <span className={styles.statValue}>{reason.stat}</span>
          <span className={styles.statLabel}>{reason.statLabel}</span>
        </div>

        {/* Hover decorations */}
        <div className={styles.hoverLine} />
      </div>
    </div>
  );
}

export function Reasons() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: '-50px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.reasons} ref={sectionRef}>
      {/* Background decorations */}
      <div className={styles.backgroundDecorations}>
        <div className={styles.topGradient} />
        <div className={styles.bottomGradient} />
        <div className={styles.floatingShape1} />
        <div className={styles.floatingShape2} />
      </div>

      {/* Section header */}
      <div
        className={`${styles.sectionHeader} ${isVisible ? styles.visible : ''}`}
      >
        <span className={styles.sectionLabel}>
          <span className={styles.labelLine} />
          Why Us?
          <span className={styles.labelLine} />
        </span>
        <h2 className={styles.sectionTitle}>
          The <span className={styles.highlight}>Cart Commerce</span> Difference
        </h2>
        <p className={styles.sectionSubtitle}>
          We're committed to providing an exceptional shopping experience with
          products you love and impactful benefits.
        </p>
      </div>

      {/* Reasons grid */}
      <div className={styles.reasonsGrid}>
        {reasons.map((reason, index) => (
          <ReasonCard
            key={reason.id}
            reason={reason}
            index={index}
            isVisible={isVisible}
          />
        ))}
      </div>

      {/* Trust metrics bar */}
      <div
        className={`${styles.trustMetrics} ${isVisible ? styles.visible : ''}`}
      >
        <div className={styles.metric}>
          <span className={styles.metricValue}>50K+</span>
          <span className={styles.metricLabel}>Happy Customers</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metric}>
          <span className={styles.metricValue}>4.9</span>
          <span className={styles.metricLabel}>Average Rating</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metric}>
          <span className={styles.metricValue}>99%</span>
          <span className={styles.metricLabel}>Satisfaction Rate</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metric}>
          <span className={styles.metricValue}>24h</span>
          <span className={styles.metricLabel}>Avg. Ship Time</span>
        </div>
      </div>
    </section>
  );
}
