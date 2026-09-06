import Link from 'next/link';
import { ShieldCheckIcon, TruckIcon, SparklesIcon, CheckCircleIcon } from '../Icons';
import styles from './BrandStory.module.css';

const pillars = [
  {
    icon: <ShieldCheckIcon size={24} />,
    title: 'Multi-Point Authenticity Verification',
    description:
      'Every single item—from rare sneakers to grail collectible cards—undergoes rigorous multi-point physical verification before entering our catalog.',
  },
  {
    icon: <TruckIcon size={24} />,
    title: 'Vault-Grade Insured Express Transit',
    description:
      'Dispatched in reinforced climate-buffered packaging with real-time signature courier tracking and 100% loss-protection insurance.',
  },
  {
    icon: <SparklesIcon size={24} />,
    title: 'Lifetime Guarantee of Origin',
    description:
      'We stand behind every piece with an unconditional lifetime guarantee of authenticity and a 30-day hassle-free return privilege.',
  },
];

export function BrandStory() {
  return (
    <section className={styles.section} aria-label="Our Story & Standards">
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Story & Narrative */}
          <div className={styles.narrativeCol}>
            <div className={styles.eyebrowWrapper}>
              <span className={styles.eyebrowLine} />
              <span className={styles.eyebrow}>The Cart Commerce Standard</span>
            </div>
            <h2 className={styles.heading}>
              Curated for Connoisseurs. Built on Absolute Trust.
            </h2>
            <p className={styles.leadText}>
              We founded Cart Commerce with a single unyielding conviction: luxury
              goods, iconic sneakers, and rare collectibles deserve an uncompromising
              standard of authenticity, transparency, and service.
            </p>
            <p className={styles.bodyText}>
              In an era flooded with replicas and automated marketplaces, our
              curators select only the finest specimens. We inspect stitching, materials,
              serial registrations, and packaging so that you can acquire your
              grail pieces with absolute confidence.
            </p>

            <div className={styles.quoteCard}>
              <p className={styles.quoteText}>
                "True luxury is peace of mind. Knowing that what you hold in your hands
                is genuine, pristine, and backed for a lifetime."
              </p>
              <div className={styles.quoteAuthor}>
                <span className={styles.authorName}>Curatorial Board</span>
                <span className={styles.authorTitle}>Cart Commerce Archives</span>
              </div>
            </div>

            <div className={styles.actionRow}>
              <Link href="/products" className={styles.catalogBtn}>
                <span>Explore the Collection</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column: Trust Pillars & Proof */}
          <div className={styles.pillarsCol}>
            <div className={styles.pillarsList}>
              {pillars.map((pillar, idx) => (
                <div key={idx} className={styles.pillarCard}>
                  <div className={styles.pillarIconWrapper}>
                    {pillar.icon}
                  </div>
                  <div className={styles.pillarContent}>
                    <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                    <p className={styles.pillarDesc}>{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification Stats Bar */}
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>100%</span>
                <span className={styles.statLabel}>Verified Deadstock</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>0%</span>
                <span className={styles.statLabel}>Counterfeit Tolerance</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNumber}>24h</span>
                <span className={styles.statLabel}>Insured Dispatch</span>
              </div>
            </div>

            <div className={styles.certificationBadge}>
              <CheckCircleIcon size={18} />
              <span>Certified Multi-Point Authentication Protocol Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
