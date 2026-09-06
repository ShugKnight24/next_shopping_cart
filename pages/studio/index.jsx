import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMascot } from '../../context/MascotProvider';
import { StorybookStudio } from '../../Components/Studio/StorybookStudio';
import { PosterStudio } from '../../Components/Studio/PosterStudio';
import { ApparelStudio } from '../../Components/Studio/ApparelStudio';
import { KidsStudioVideoTour } from '../../Components/Video/KidsStudioVideoTour';
import { SparklesIcon, TruckIcon, ShieldCheckIcon, BoxIcon } from '../../Components/Icons';
import styles from '../../styles/pages/Studio.module.css';

const MODES = [
  {
    id: 'storybook',
    title: "Children's Storybooks",
    badge: 'Kids Favorite',
    desc: 'Personalized hardcover heirloom books starring your child',
  },
  {
    id: 'poster',
    title: 'Framed Art Posters',
    badge: 'Gallery Archival',
    desc: 'Custom museum-grade giclée typography & illustrations',
  },
  {
    id: 'apparel',
    title: "Kids' Apparel & Kicks",
    badge: 'Atelier Workshop',
    desc: 'Organic cotton hoodies, tees & embroidered canvas kicks',
  },
];

export default function StudioPage() {
  const router = useRouter();
  const { setMascot, speak } = useMascot();
  const [activeMode, setActiveMode] = useState('storybook');

  // Sync mode with query param ?mode=
  useEffect(() => {
    if (router.query.mode && MODES.some((m) => m.id === router.query.mode)) {
      setActiveMode(router.query.mode);
    }
  }, [router.query.mode]);

  // Set mascot companion according to mode
  useEffect(() => {
    if (activeMode === 'storybook') {
      setMascot('leo');
      speak(
        "Welcome to the Storybook Studio! I'm Leo, your creative imagination guide. Let's make an incredible book!",
        'happy'
      );
    } else {
      speak(
        `Welcome to the Custom ${
          activeMode === 'poster' ? 'Poster' : 'Apparel'
        } Studio! Let's craft something unforgettable.`,
        'idle'
      );
    }
  }, [activeMode, setMascot, speak]);

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    router.replace(`/studio?mode=${modeId}`, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Custom Web-to-Print Studio | Children's Books, Framed Posters & Apparel</title>
        <meta
          name="description"
          content="Interactive custom creation studio. Personalize children's storybooks with custom names, archival framed art posters, and customized kids' hoodies & kicks."
        />
        <meta property="og:title" content="Custom Web-to-Print Studio | Personalized Books & Art" />
        <meta
          property="og:description"
          content="Design personalized keepsake storybooks, gallery posters, and custom kids' kicks with real-time interactive canvas proofing."
        />
        <link rel="canonical" href="https://next-shopping-cart-shugknight24.vercel.app/studio" />
      </Head>

      <main className={styles.studioContainer}>
        {/* Studio Header & Storytelling Banner */}
        <section className={styles.studioHero}>
          <div className={styles.heroBadge}>
            <SparklesIcon size={14} />
            <span>Interactive Web-to-Print Workshop</span>
          </div>
          <h1 className={styles.heroTitle}>The Custom Creation Studio</h1>
          <p className={styles.heroSubtitle}>
            Create one-of-a-kind personalized keepsakes for your children and home.
            Preview each page in real time and stamp custom emblems before we print and bind your heirloom.
          </p>

          {/* Workshop Trust Pillars */}
          <div className={styles.trustPillars}>
            <div className={styles.pillar}>
              <ShieldCheckIcon size={18} />
              <span>Handcrafted & Bound in the USA</span>
            </div>
            <div className={styles.pillar}>
              <BoxIcon size={18} />
              <span>FSC-Certified Archival Papers</span>
            </div>
            <div className={styles.pillar}>
              <TruckIcon size={18} />
              <span>Free Express Shipping Over $150</span>
            </div>
          </div>
        </section>

        {/* Studio Mode Selector */}
        <section className={styles.modeSection} aria-label="Creation Mode Selection">
          <div className={styles.modeGrid}>
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`${styles.modeTab} ${
                  activeMode === m.id ? styles.modeTabActive : ''
                }`}
                onClick={() => handleModeChange(m.id)}
              >
                <div className={styles.modeTabTop}>
                  <span className={styles.modeBadge}>{m.badge}</span>
                  {activeMode === m.id && (
                    <span className={styles.activeDot} />
                  )}
                </div>
                <h2 className={styles.modeTitle}>{m.title}</h2>
                <p className={styles.modeDesc}>{m.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Active Studio Workshop */}
        <section className={styles.workshopStage}>
          {activeMode === 'storybook' && <StorybookStudio />}
          {activeMode === 'poster' && <PosterStudio />}
          {activeMode === 'apparel' && <ApparelStudio />}
        </section>

        {/* Behind The Scenes Print Atelier Video Tour */}
        <KidsStudioVideoTour />

        {/* Social Media Creation Studio Callout */}
        <Link href="/studio/social" className={styles.socialStudioBanner}>
          <div className={styles.socialBannerLeft}>
            <span className={styles.socialBannerBadge}>Creator & Store Owner Suite</span>
            <h3>Social Media Marketing Studio</h3>
            <p>
              Instantly transform catalog items into viral marketing posts for Instagram, TikTok, and Twitter/X with 1-click product import.
            </p>
          </div>
          <span className={styles.socialBannerCta}>Launch Social Studio →</span>
        </Link>
      </main>
    </>
  );
}
