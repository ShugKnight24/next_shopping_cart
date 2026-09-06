import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { useMascot } from '../../context/MascotProvider';
import { useToast } from '../UI/Toast';
import { trackAddToCart } from '../../analytics/google';
import { CanvasEngine } from './CanvasEngine';
import { StickerBar } from './StickerBar';
import { ChevronLeft, ChevronRight, CheckCircleIcon, SparklesIcon } from '../Icons';
import styles from './StorybookStudio.module.css';

const THEMES = [
  {
    id: 'space',
    name: 'Cosmic Galaxy Quest',
    desc: 'Explore uncharted constellations and glowing nebulae with Carty & Leo.',
    badge: 'Space Explorer',
  },
  {
    id: 'magic',
    name: 'Enchanted Kingdom',
    desc: 'Unlock the ancient Whispering Woods and discover legendary starlight gems.',
    badge: 'Fantasy Adventure',
  },
  {
    id: 'sneaker',
    name: 'Sneakerhead Odyssey',
    desc: 'Design iconic kicks and run through the futuristic sneaker city skyline.',
    badge: 'Street Style',
  },
  {
    id: 'dino',
    name: 'Dinosaur Wonder',
    desc: 'Travel through prehistoric valleys and rescue a friendly baby triceratops.',
    badge: 'Time Travel',
  },
];

const EDITIONS = [
  {
    id: 'hardcover',
    name: 'Hardcover Keepsake Edition',
    price: 34.99,
    desc: 'Casebound luxury matte cover, 32 archival full-color pages, lay-flat binding.',
  },
  {
    id: 'deluxe',
    name: 'Deluxe Gold Foil Collector Edition',
    price: 44.99,
    desc: 'Gold foil stamped typography, slipcase box, embossed certificate page.',
  },
  {
    id: 'softcover',
    name: 'Softcover Storybook',
    price: 24.99,
    desc: 'Durable gloss cover, lightweight for everyday bedtime reading.',
  },
];

export function StorybookStudio() {
  const { dispatch, setIsCartOpen } = useContext(CartContext);
  const { speak, setMascot } = useMascot();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [childName, setChildName] = useState('Noah');
  const [ageGroup, setAgeGroup] = useState('6-8 Years');
  const [theme, setTheme] = useState('space');
  const [dedication, setDedication] = useState(
    'For our adventurous Noah — May your imagination always soar higher than the stars. With all our love, Mom & Dad.'
  );
  const [activePage, setActivePage] = useState(0);
  const [selectedEdition, setSelectedEdition] = useState('hardcover');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickers, setStickers] = useState([]);

  // Auto-switch companion to Leo for storybook creation
  useEffect(() => {
    setMascot('leo');
  }, [setMascot]);

  // Mascot step guidance
  useEffect(() => {
    switch (currentStep) {
      case 1:
        speak(
          "Step 1: Who is our hero today? Enter your child's name so they star in the adventure!",
          'guiding'
        );
        break;
      case 2:
        speak(
          'Step 2: Choose your adventure theme! Space explorers, magic kingdoms, or sneakers?',
          'guiding'
        );
        break;
      case 3:
        speak(
          'Step 3: Write a special dedication note printed inside the front page forever!',
          'guiding'
        );
        break;
      case 4:
        speak(
          'Step 4: Flip through the interactive pages and stamp fun decorative stickers!',
          'happy'
        );
        break;
      case 5:
        speak(
          'Step 5: Your keepsake looks fantastic! Choose your heirloom binding and order your copy!',
          'celebrating'
        );
        break;
      default:
        break;
    }
  }, [currentStep, speak]);

  const activeEditionObj = EDITIONS.find((e) => e.id === selectedEdition) || EDITIONS[0];
  const activeThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

  const handleNextStep = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    const customItemId = `CUSTOM-BOOK-${Date.now()}`;
    const customBookSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#0f172a" rx="12"/>
      <rect x="12" y="12" width="136" height="136" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/>
      <rect x="78" y="12" width="4" height="136" fill="#f59e0b" opacity="0.4"/>
      <circle cx="80" cy="65" r="28" fill="#f59e0b"/>
      <text x="80" y="73" font-size="20" text-anchor="middle" fill="#1e1b4b">★</text>
      <text x="80" y="112" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff">${(childName || 'HERO').slice(0, 10).toUpperCase()}'S</text>
      <text x="80" y="128" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="#fbbf24">${activeThemeObj.name.slice(0, 16).toUpperCase()}</text>
    </svg>`;
    const thumbnailDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(customBookSvg)}`;

    const customBookItem = {
      itemid: customItemId,
      productName: `Custom Storybook: "${childName}'s ${activeThemeObj.name}"`,
      manufacturer: 'Cart Studio Press',
      price: activeEditionObj.price,
      image: thumbnailDataUrl,
      isCustom: true,
      customMode: 'storybook',
      quantity: 1,
      available: 99,
      customAttributes: {
        Hero: childName,
        Theme: activeThemeObj.name,
        Age: ageGroup,
        Binding: activeEditionObj.name,
        Stickers: `${stickers.length} Custom Stamps`,
      },
    };

    dispatch({
      type: 'ADD_CUSTOM_ITEM',
      payload: { customItem: customBookItem },
    });

    trackAddToCart(customBookItem, 1);
    showToast(`Personalized storybook for ${childName} added to your bag!`, 'success');
    setIsCartOpen(true);
    speak(
      `Hooray! "${childName}'s ${activeThemeObj.name}" is now in your bag!`,
      'celebrating'
    );
  };

  return (
    <div className={styles.studioRoot}>
      {/* Step Navigation Tabs */}
      <nav className={styles.stepperNav} aria-label="Storybook Creation Steps">
        {[
          { num: 1, label: 'Hero Name' },
          { num: 2, label: 'Story Theme' },
          { num: 3, label: 'Dedication' },
          { num: 4, label: 'Proof & Stamp' },
          { num: 5, label: 'Print Binding' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            className={`${styles.stepTab} ${
              currentStep === s.num
                ? styles.stepTabActive
                : currentStep > s.num
                ? styles.stepTabComplete
                : ''
            }`}
            onClick={() => setCurrentStep(s.num)}
          >
            <span className={styles.stepNum}>
              {currentStep > s.num ? '✓' : s.num}
            </span>
            <span className={styles.stepLabel}>{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Two-Column Stage */}
      <div className={styles.stageGrid}>
        {/* Left Column: Interactive Canvas Stage */}
        <div className={styles.canvasStage}>
          <div className={styles.canvasHeader}>
            <div className={styles.proofBadge}>
              <SparklesIcon size={14} />
              <span>Live Print-Ready Proof Preview</span>
            </div>
            <div className={styles.pageIndicator}>
              {activePage === 0
                ? 'Hardcover Front'
                : activePage === 1
                ? 'Page 1 & Dedication'
                : `Pages ${activePage * 2 - 1} & ${activePage * 2}`}
            </div>
          </div>

          <CanvasEngine
            width={520}
            height={400}
            mode="storybook"
            config={{
              childName: childName || 'Adventurer',
              theme,
              activePage,
              dedication,
            }}
            selectedSticker={selectedSticker}
            stickers={stickers}
            onUpdateStickers={setStickers}
          />

          {/* Book Page Flip Bar */}
          <div className={styles.flipControls}>
            <button
              type="button"
              className={styles.flipBtn}
              disabled={activePage === 0}
              onClick={() => setActivePage((prev) => Math.max(0, prev - 1))}
              aria-label="Previous book spread"
            >
              <ChevronLeft size={16} />
              <span>Previous Page</span>
            </button>
            <div className={styles.pageDots}>
              {[0, 1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageDot} ${
                    activePage === p ? styles.pageDotActive : ''
                  }`}
                  onClick={() => setActivePage(p)}
                  aria-label={`Go to book page ${p + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              className={styles.flipBtn}
              disabled={activePage === 4}
              onClick={() => setActivePage((prev) => Math.min(4, prev + 1))}
              aria-label="Next book spread"
            >
              <span>Next Page</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Sticker Bar */}
          <StickerBar
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
            onClearStickers={() => setStickers([])}
            stickersCount={stickers.length}
          />
        </div>

        {/* Right Column: Step Controls Form */}
        <div className={styles.controlsStage}>
          {currentStep === 1 && (
            <div className={styles.stepPane}>
              <div className={styles.paneHeader}>
                <span className={styles.paneTag}>Step 1 of 5</span>
                <h3>Who is the Hero of our Story?</h3>
                <p>Personalize the main character name and reading level.</p>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="childNameInput">Child’s First Name:</label>
                <input
                  id="childNameInput"
                  type="text"
                  value={childName}
                  maxLength={24}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Noah, Sophia, Liam..."
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Reading Level & Age:</label>
                <div className={styles.pillOptions}>
                  {['3-5 Years', '6-8 Years', '9-12 Years'].map((age) => (
                    <button
                      key={age}
                      type="button"
                      className={`${styles.pillBtn} ${
                        ageGroup === age ? styles.pillBtnActive : ''
                      }`}
                      onClick={() => setAgeGroup(age)}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles.stepPane}>
              <div className={styles.paneHeader}>
                <span className={styles.paneTag}>Step 2 of 5</span>
                <h3>Choose an Adventure Theme</h3>
                <p>Pick a storyline tailored to your child’s passions.</p>
              </div>

              <div className={styles.themeList}>
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.themeCard} ${
                      theme === t.id ? styles.themeCardActive : ''
                    }`}
                    onClick={() => setTheme(t.id)}
                  >
                    <div className={styles.themeCardTop}>
                      <span className={styles.themeBadge}>{t.badge}</span>
                      <span className={styles.themeName}>{t.name}</span>
                    </div>
                    <p className={styles.themeDesc}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={styles.stepPane}>
              <div className={styles.paneHeader}>
                <span className={styles.paneTag}>Step 3 of 5</span>
                <h3>Special Front Page Dedication</h3>
                <p>A message from your heart, printed in letterpress on Page 1.</p>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="dedicationInput">Dedication Note:</label>
                <textarea
                  id="dedicationInput"
                  rows={4}
                  value={dedication}
                  maxLength={180}
                  onChange={(e) => setDedication(e.target.value)}
                  className={styles.textArea}
                />
                <span className={styles.charCount}>
                  {dedication.length}/180 characters
                </span>
              </div>

              <div className={styles.presetSuggestions}>
                <span className={styles.presetLabel}>Quick Presets:</span>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() =>
                    setDedication(
                      `For our adventurous ${childName || 'hero'} — May your imagination always soar higher than the stars. With all our love, Mom & Dad.`
                    )
                  }
                >
                  "Stay curious and conquer the stars..."
                </button>
                <button
                  type="button"
                  className={styles.presetBtn}
                  onClick={() =>
                    setDedication(
                      `To ${childName || 'our star'}: Never stop exploring, questioning, and shining brightly. Dream big!`
                    )
                  }
                >
                  "Never stop exploring, dream big..."
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className={styles.stepPane}>
              <div className={styles.paneHeader}>
                <span className={styles.paneTag}>Step 4 of 5</span>
                <h3>Review Proof & Stamp Stickers</h3>
                <p>
                  Flip through your story pages and place personalized stickers on
                  the illustration stage!
                </p>
              </div>

              <div className={styles.proofSummaryBox}>
                <div className={styles.summaryItem}>
                  <span>Hero Star:</span>
                  <strong>{childName}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Story Theme:</span>
                  <strong>{activeThemeObj.name}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Reading Level:</span>
                  <strong>{ageGroup}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Total Pages:</span>
                  <strong>32 Pages Full Color</strong>
                </div>
              </div>

              <p className={styles.paneTip}>
                Use the page controls and sticker bar on the left to review each
                spread and add decorative stamps!
              </p>
            </div>
          )}

          {currentStep === 5 && (
            <div className={styles.stepPane}>
              <div className={styles.paneHeader}>
                <span className={styles.paneTag}>Step 5 of 5</span>
                <h3>Select Heirloom Binding & Order</h3>
                <p>Crafted with sustainably sourced archival FSC paper.</p>
              </div>

              <div className={styles.editionList}>
                {EDITIONS.map((ed) => (
                  <button
                    key={ed.id}
                    type="button"
                    className={`${styles.editionCard} ${
                      selectedEdition === ed.id ? styles.editionCardActive : ''
                    }`}
                    onClick={() => setSelectedEdition(ed.id)}
                  >
                    <div className={styles.editionTop}>
                      <span className={styles.editionName}>{ed.name}</span>
                      <span className={styles.editionPrice}>${ed.price.toFixed(2)}</span>
                    </div>
                    <p className={styles.editionDesc}>{ed.desc}</p>
                  </button>
                ))}
              </div>

              <div className={styles.guaranteeBox}>
                <CheckCircleIcon size={18} />
                <span>100% Happiness Proof Guarantee • Hand-bound in the USA</span>
              </div>

              <button
                type="button"
                className={styles.addToCartBtn}
                onClick={handleAddToCart}
                aria-label="Add Personalized Storybook to Bag"
              >
                <span>Add Heirloom Storybook to Bag • ${activeEditionObj.price.toFixed(2)}</span>
              </button>
            </div>
          )}

          {/* Stepper Navigation Footer */}
          <div className={styles.stepperFooter}>
            <button
              type="button"
              className={styles.navBackBtn}
              disabled={currentStep === 1}
              onClick={handlePrevStep}
            >
              Back
            </button>

            {currentStep < 5 && (
              <button
                type="button"
                className={styles.navNextBtn}
                onClick={handleNextStep}
              >
                Continue to Next Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
