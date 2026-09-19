import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import {
  BoxIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
} from '../../Components/Icons';
import { PREVIEWS } from '../../Components/Studio/preview/previewConfigs';
import { StudioPreview } from '../../Components/Studio/preview/StudioPreview';
import { StudioHeroAnimated } from '../../Components/Studio/StudioHeroAnimated';
import { KidsStudioVideoTour } from '../../Components/Video/KidsStudioVideoTour';
import { useMascot } from '../../context/MascotProvider';
import styles from '../../styles/pages/Studio.module.css';

const BESPOKE_CAPABILITIES = [
  {
    step: '01',
    title: 'Start from a layout, or a blank artboard',
    desc: 'Thirty templates across the three products, grouped by category. Swap between them freely — the words you have already typed carry across.',
  },
  {
    step: '02',
    title: 'Restyle without relaying out',
    desc: 'Twenty-one style presets change palette, typeface and ink across the whole piece at once, leaving every element exactly where you put it.',
  },
  {
    step: '03',
    title: 'Move, resize and stack anything',
    desc: 'Text, shapes and artwork are real layers. Drag them, rotate them, reorder them, lock the ones you are happy with.',
  },
  {
    step: '04',
    title: 'Proof it like a printer would',
    desc: 'Zoom to the stitch, snap to the centre line, read the live 300 DPI spec, and export the proof before anything goes to press.',
  },
];

const WORKBENCHES = [
  {
    href: '/studio/book',
    badge: 'Kids Favorite',
    title: 'Storybook Designer',
    desc: 'Personalized hardcover heirloom books starring your child.',
    features: [
      '8 cover and spread templates',
      'Scene environments',
      'Character creator',
    ],
  },
  {
    href: '/studio/poster',
    badge: 'Gallery Archival',
    title: 'Poster Designer',
    desc: 'Museum-grade giclee prints, framed and ready to hang.',
    features: [
      '12 layouts, 7 styles',
      'Frames, mats and paper stocks',
      'Live 300 DPI proof',
    ],
  },
  {
    href: '/studio/apparel',
    badge: 'Craft Workshop',
    title: 'Apparel Designer',
    desc: 'Hoodies, tees, varsity jackets and canvas kicks.',
    features: [
      '10 layouts, 7 styles',
      'Colourways and accent trim',
      'Embroidery finishes',
    ],
  },
];

/** Legacy deep links from before the workbenches existed. */
const LEGACY_MODE_ROUTES = {
  storybook: '/studio/book',
  poster: '/studio/poster',
  apparel: '/studio/apparel',
};

export default function StudioPage() {
  const router = useRouter();
  const { setMascot, speak } = useMascot();

  // `?mode=` and `?panel=character` used to select an in-page workstation.
  // Those editors are previews now, so the old links forward to the designer
  // they were really asking for rather than silently doing nothing.
  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.panel === 'character') {
      router.replace('/studio/book');
      return;
    }

    const route = LEGACY_MODE_ROUTES[router.query.mode];
    if (route) router.replace(route);
  }, [router]);

  useEffect(() => {
    setMascot('leo');
    speak(
      "Welcome to the Custom Creation Studio! I'm Leo. Try a preview below, then open the full designer when you are ready.",
      'happy'
    );
  }, [setMascot, speak]);

  return (
    <>
      <Head>
        <title>
          Custom Web-to-Print Studio | Children's Books, Framed Posters &
          Apparel
        </title>
        <meta
          name="description"
          content="Interactive custom creation studio. Personalize children's storybooks with custom names, archival framed art posters, and customized kids' hoodies & kicks."
        />
        <meta
          property="og:title"
          content="Custom Web-to-Print Studio | Personalized Books & Art"
        />
        <meta
          property="og:description"
          content="Design personalized keepsake storybooks, gallery posters, and custom kids' kicks with real-time interactive canvas proofing."
        />
        <meta property="og:image" content="/static/img/og-preview.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/static/img/og-preview.svg" />
        <link
          rel="canonical"
          href="https://next-shopping-cart-shugknight24.vercel.app/studio"
        />
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
        <section
          className={styles.journeySection}
          aria-label="Creation Process"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>How It Works</span>
            <h2 className={styles.sectionTitle}>
              Crafting Your Keepsake in 4 Simple Steps
            </h2>
            <p className={styles.sectionSubtitle}>
              From custom story elements to museum-grade binding, our
              interactive workshop makes heirloom creation effortless.
            </p>
          </div>

          <div className={styles.journeyGrid}>
            <div className={styles.journeyCard}>
              <span className={styles.journeyStepNum}>1</span>
              <h3 className={styles.journeyCardTitle}>Choose Your Medium</h3>
              <p className={styles.journeyCardDesc}>
                Select hardcover storybooks, archival gallery posters, or
                customized organic kicks and apparel.
              </p>
            </div>
            <div className={styles.journeyCard}>
              <span className={styles.journeyStepNum}>2</span>
              <h3 className={styles.journeyCardTitle}>Star Your Child</h3>
              <p className={styles.journeyCardDesc}>
                Customize character avatars, hairstyles, skin tones, and pick
                faithful companion mascots like Leo or Finley.
              </p>
            </div>
            <div className={styles.journeyCard}>
              <span className={styles.journeyStepNum}>3</span>
              <h3 className={styles.journeyCardTitle}>Proof in Real-Time</h3>
              <p className={styles.journeyCardDesc}>
                Move stamps, write heartfelt front-page dedications, and preview
                bleed margins in the 60 FPS live canvas engine.
              </p>
            </div>
            <div className={styles.journeyCard}>
              <span className={styles.journeyStepNum}>4</span>
              <h3 className={styles.journeyCardTitle}>Artisan Binding</h3>
              <p className={styles.journeyCardDesc}>
                Each piece is individually printed with archival giclée pigment
                inks and hand-bound right here in the USA.
              </p>
            </div>
          </div>
        </section>

        {/* Full-screen workbench launcher. These are the real editors; the
            in-page workstations below are the previous generation and are kept
            only until their tests are migrated. */}
        <section
          className={styles.launcherSection}
          aria-label="Design workbenches"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Design Workbenches</span>
            <h2 className={styles.sectionTitle}>Open a Full Design Studio</h2>
            <p className={styles.sectionSubtitle}>
              Layers, templates, styles and live print proofing on a full-screen
              canvas. Your work autosaves and every design gets a share link.
            </p>
          </div>

          <div className={styles.launcherGrid}>
            {WORKBENCHES.map((bench) => (
              <Link
                key={bench.href}
                href={bench.href}
                className={styles.launcherCard}
              >
                <span className={styles.launcherBadge}>{bench.badge}</span>
                <h3 className={styles.launcherTitle}>{bench.title}</h3>
                <p className={styles.launcherDesc}>{bench.desc}</p>
                <ul className={styles.launcherFeatures}>
                  {bench.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <span className={styles.launcherCta}>Open designer</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Try-it previews. Deliberately shallow: enough to prove the product
            is customizable, with the full designer one click away carrying the
            visitor's work with it. */}
        <section
          id="studio-workstations"
          className={styles.previewSection}
          aria-label="Try the studios"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Try It Here</span>
            <h2 className={styles.sectionTitle}>
              A Taste of Each Creation Suite
            </h2>
            <p className={styles.sectionSubtitle}>
              Change a few things and watch the proof update. When you want
              layers, templates and full print control, open the bespoke
              designer — whatever you have made comes with you.
            </p>
          </div>

          <div className={styles.previewStack}>
            {PREVIEWS.map((preview) => (
              <StudioPreview
                key={preview.id}
                product={preview.product}
                templateMode={preview.templateMode}
                drawSubstrate={preview.drawSubstrate}
                starterTemplateId={preview.starterTemplateId}
                fields={preview.fields}
                eyebrow={preview.eyebrow}
                headline={preview.headline}
                blurb={preview.blurb}
                upsell={preview.upsell}
              />
            ))}
          </div>
        </section>

        {/* What the bespoke experience adds over the preview. */}
        <section
          className={styles.bespokeSection}
          aria-label="The bespoke designer"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>The Bespoke Studio</span>
            <h2 className={styles.sectionTitle}>
              Where a Keepsake Becomes Yours
            </h2>
            <p className={styles.sectionSubtitle}>
              The previews above change a handful of options. The full designer
              is a real canvas — every element is yours to move, restyle and
              stack.
            </p>
          </div>

          <div className={styles.bespokeGrid}>
            {BESPOKE_CAPABILITIES.map((capability) => (
              <article key={capability.title} className={styles.bespokeCard}>
                <span className={styles.bespokeStep}>{capability.step}</span>
                <h3 className={styles.bespokeTitle}>{capability.title}</h3>
                <p className={styles.bespokeDesc}>{capability.desc}</p>
              </article>
            ))}
          </div>

          <div className={styles.bespokeActions}>
            {WORKBENCHES.map((bench) => (
              <Link
                key={bench.href}
                href={bench.href}
                className={styles.bespokeAction}
              >
                {bench.title}
              </Link>
            ))}
          </div>
        </section>

        {/* Heirloom Craftsmanship & Quality Standards Grid */}
        <section
          className={styles.standardsSection}
          aria-label="Craftsmanship Standards"
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Artisan Standards</span>
            <h2 className={styles.sectionTitle}>
              Heirloom Quality in Every Print
            </h2>
            <p className={styles.sectionSubtitle}>
              Built to be read, worn, and cherished for generations.
            </p>
          </div>

          <div className={styles.standardsGrid}>
            <div className={styles.standardCard}>
              <div className={styles.standardCardIcon}>
                <SparklesIcon size={22} />
              </div>
              <h3 className={styles.standardCardTitle}>
                12-Color Giclée Pigments
              </h3>
              <p className={styles.standardCardDesc}>
                Ultra-vivid museum inks tested for 200+ years of colorfastness
                without fading or yellowing.
              </p>
            </div>

            <div className={styles.standardCard}>
              <div className={styles.standardCardIcon}>
                <BoxIcon size={22} />
              </div>
              <h3 className={styles.standardCardTitle}>
                Lay-Flat Smyth Binding
              </h3>
              <p className={styles.standardCardDesc}>
                Stitched library-grade cloth spine lets your storybook open
                completely flat across double-page spreads.
              </p>
            </div>

            <div className={styles.standardCard}>
              <div className={styles.standardCardIcon}>
                <ShieldCheckIcon size={22} />
              </div>
              <h3 className={styles.standardCardTitle}>
                Velvet Touch FSC Paper
              </h3>
              <p className={styles.standardCardDesc}>
                Heavyweight 200 GSM glare-free archival stock that resists
                fingerprints and spills.
              </p>
            </div>

            <div className={styles.standardCard}>
              <div className={styles.standardCardIcon}>
                <TruckIcon size={22} />
              </div>
              <h3 className={styles.standardCardTitle}>
                100% Happiness Guarantee
              </h3>
              <p className={styles.standardCardDesc}>
                Pre-flight print proof verification before press. Free reprints
                if your keepsake isn&apos;t 100% perfect.
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
            <span className={styles.socialBannerBadge}>
              Creator & Store Owner Suite
            </span>
            <h3>Social Media Marketing Studio</h3>
            <p>
              Instantly transform catalog items into viral marketing posts for
              Instagram, TikTok, and Twitter/X with 1-click product import.
            </p>
          </div>
          <span className={styles.socialBannerCta}>Launch Social Studio →</span>
        </Link>
      </main>
    </>
  );
}
