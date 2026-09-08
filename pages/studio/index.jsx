import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useMascot } from '../../context/MascotProvider';
import { StorybookStudio } from '../../Components/Studio/StorybookStudio';
import { PosterStudio } from '../../Components/Studio/PosterStudio';
import { ApparelStudio } from '../../Components/Studio/ApparelStudio';
import { KidsStudioVideoTour } from '../../Components/Video/KidsStudioVideoTour';
import { StudioHeroAnimated } from '../../Components/Studio/StudioHeroAnimated';
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
    badge: 'Craft Workshop',
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
        <meta property="og:image" content="/static/img/og-preview.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/static/img/og-preview.svg" />
        <link rel="canonical" href="https://next-shopping-cart-shugknight24.vercel.app/studio" />
      </Head>

      <main className={styles.studioContainer}>
        {/* Animated Mascot Hero Scene */}
        <StudioHeroAnimated
          onExploreWorkstations={() => {
            const el = document.getElementById('studio-workstations');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onWatchTour={() => {
            const el = document.getElementById('video-tour');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4-Step Creation Journey Ribbon */}
        <section className={styles.journeySection} aria-label="Creation Process">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>How It Works</span>
            <h2 className={styles.sectionTitle}>Crafting Your Keepsake in 4 Simple Steps</h2>
            <p className={styles.sectionSubtitle}>
              From custom story elements to museum-grade binding, our interactive workshop makes heirloom creation effortless.
            </p>
          </div>

          <div className={styles.journeyGrid}>
            <div className={styles.journeyCard}>
              <span className={styles.journeyStepNum}>1</span>
              <h3 className={styles.journeyCardTitle}>Choose Your Medium</h3>
              <p className={styles.journeyCardDesc}>
                Select hardcover storybooks, archival gallery posters, or customized organic kicks and apparel.
              </p>
            </div>
            <div className={styles.journeyCard}>
              <span className={styles.journeyStepNum}>2</span>
              <h3 className={styles.journeyCardTitle}>Star Your Child</h3>
              <p className={styles.journeyCardDesc}>
                Customize character avatars, hairstyles, skin tones, and pick faithful companion mascots like Leo or Finley.
              </p>
            </div>
            <div className={styles.journeyCard}>
              <span className={styles.journeyStepNum}>3</span>
              <h3 className={styles.journeyCardTitle}>Proof in Real-Time</h3>
              <p className={styles.journeyCardDesc}>
                Move stamps, write heartfelt front-page dedications, and preview bleed margins in the 60 FPS live canvas engine.
              </p>
            </div>
            <div className={styles.journeyCard}>
              <span className={styles.journeyStepNum}>4</span>
              <h3 className={styles.journeyCardTitle}>Artisan Binding</h3>
              <p className={styles.journeyCardDesc}>
                Each piece is individually printed with archival giclée pigment inks and hand-bound right here in the USA.
              </p>
            </div>
          </div>
        </section>

        {/* Studio Mode Selector */}
        <section id="studio-workstations" className={styles.modeSection} aria-label="Creation Mode Selection">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Choose Your Workstation</span>
            <h2 className={styles.sectionTitle}>Curated Custom Creation Suites</h2>
            <p className={styles.sectionSubtitle}>
              Select your product medium to enter the dedicated interactive builder with real-time canvas proofing.
            </p>
          </div>

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

        {/* Heirloom Craftsmanship & Quality Standards Grid */}
        <section className={styles.standardsSection} aria-label="Craftsmanship Standards">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Artisan Standards</span>
            <h2 className={styles.sectionTitle}>Heirloom Quality in Every Print</h2>
            <p className={styles.sectionSubtitle}>
              Built to be read, worn, and cherished for generations.
            </p>
          </div>

          <div className={styles.standardsGrid}>
            <div className={styles.standardCard}>
              <div className={styles.standardCardIcon}>
                <SparklesIcon size={22} />
              </div>
              <h3 className={styles.standardCardTitle}>12-Color Giclée Pigments</h3>
              <p className={styles.standardCardDesc}>
                Ultra-vivid museum inks tested for 200+ years of colorfastness without fading or yellowing.
              </p>
            </div>

            <div className={styles.standardCard}>
              <div className={styles.standardCardIcon}>
                <BoxIcon size={22} />
              </div>
              <h3 className={styles.standardCardTitle}>Lay-Flat Smyth Binding</h3>
              <p className={styles.standardCardDesc}>
                Stitched library-grade cloth spine lets your storybook open completely flat across double-page spreads.
              </p>
            </div>

            <div className={styles.standardCard}>
              <div className={styles.standardCardIcon}>
                <ShieldCheckIcon size={22} />
              </div>
              <h3 className={styles.standardCardTitle}>Velvet Touch FSC Paper</h3>
              <p className={styles.standardCardDesc}>
                Heavyweight 200 GSM glare-free archival stock that resists fingerprints and spills.
              </p>
            </div>

            <div className={styles.standardCard}>
              <div className={styles.standardCardIcon}>
                <TruckIcon size={22} />
              </div>
              <h3 className={styles.standardCardTitle}>100% Happiness Guarantee</h3>
              <p className={styles.standardCardDesc}>
                Pre-flight print proof verification before press. Free reprints if your keepsake isn&apos;t 100% perfect.
              </p>
            </div>
          </div>
        </section>

        {/* Behind The Scenes Print Studio Video Tour */}
        <div id="video-tour">
          <KidsStudioVideoTour />
        </div>

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
