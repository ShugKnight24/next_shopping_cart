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

  // Deep Customization States
  const [step4Tab, setStep4Tab] = useState('prose'); // 'prose' | 'avatar' | 'typography' | 'stamps'
  const [selectedChapterEdit, setSelectedChapterEdit] = useState(1);
  const [chapterProse, setChapterProse] = useState({
    1: {
      title: "Noah's Journey Begins",
      lines: [
        "The morning sun peered into Noah's window.",
        "Today wasn't an ordinary morning in the neighborhood.",
        "A tiny brass courier bot rolled up with a golden parcel.",
        '"Wake up, Noah!" chimed Leo The Story Lion.',
        '"The galaxy needs someone bold enough to lead the expedition!"',
      ],
    },
    2: {
      title: 'The Secret of the Starlight Compass',
      lines: [
        'Higher and higher they climbed above the velvet clouds.',
        'Noah reached out a steady hand to hold the compass.',
        'The glowing constellation aligned directly with their path.',
        '"I knew you had it in you!" cheered Leo with a joyful roar.',
        'Together, there was no mystery they could not conquer.',
      ],
    },
    3: {
      title: 'The Grand Victory Celebration',
      lines: [
        "The entire kingdom gathered to celebrate Noah's triumph.",
        'A crown of starlight was placed gently upon their head.',
        '"Never forget this moment," whispered Carty and Leo warmly.',
        'Because in every heart that dares to dream,',
        'a magnificent adventure is always waiting to be written.',
      ],
    },
  });

  const [avatar, setAvatar] = useState({
    skin: '#fbd38d',
    hair: '#4a2c11',
    outfit: '#2563eb',
    accessory: 'cape',
  });

  const [mascotCoStar, setMascotCoStar] = useState('leo');
  const [fontFamily, setFontFamily] = useState('serif');
  const [textColor, setTextColor] = useState('#0f172a');
  const [showBleed, setShowBleed] = useState(false);

  // Auto-switch companion to Leo for storybook creation
  useEffect(() => {
    setMascot('leo');
  }, [setMascot]);

  // Sync default chapter titles/names when childName changes if unmodified
  const handleUpdateChapterTitle = (chapNum, newTitle) => {
    setChapterProse((prev) => ({
      ...prev,
      [chapNum]: {
        ...prev[chapNum],
        title: newTitle,
      },
    }));
  };

  const handleUpdateChapterLines = (chapNum, textBlock) => {
    const splitLines = textBlock.split('\n').filter((l) => l.trim().length > 0);
    setChapterProse((prev) => ({
      ...prev,
      [chapNum]: {
        ...prev[chapNum],
        lines: splitLines,
      },
    }));
  };

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
          'Step 4: Personalize your chapter prose, customize the hero avatar, and check print bleed margins!',
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

  const coStarNames = {
    leo: 'Leo The Story Lion',
    penny: 'Princess Penny',
    dexter: 'Dexter The Dino',
    carty: 'Carty The Courier',
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
        CoStar: coStarNames[mascotCoStar] || 'Leo The Lion',
        Font: fontFamily.toUpperCase(),
        Avatar: `${avatar.accessory !== 'none' ? avatar.accessory : 'Classic'} (${avatar.outfit})`,
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
      `Hooray! "${childName}'s ${activeThemeObj.name}" starring with ${coStarNames[mascotCoStar]} is now in your bag!`,
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
              chapterProse,
              avatar,
              mascotCoStar,
              fontFamily,
              textColor,
              showBleed,
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
                <h3>Deep Customization Workshop</h3>
                <p>
                  Craft your custom story prose, customize the avatar, choose co-star mascots, and adjust print bleed.
                </p>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className={styles.subTabsRow} role="tablist">
                {[
                  { id: 'prose', label: 'Prose Editor' },
                  { id: 'avatar', label: 'Avatar & Co-Star' },
                  { id: 'typography', label: 'Typography & Bleed' },
                  { id: 'stamps', label: 'Stamps & Badges' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={step4Tab === tab.id}
                    className={`${styles.subTabBtn} ${
                      step4Tab === tab.id ? styles.subTabBtnActive : ''
                    }`}
                    onClick={() => setStep4Tab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Prose Editor */}
              {step4Tab === 'prose' && (
                <div className={styles.customSubPane}>
                  <div className={styles.chapterSelectorRow}>
                    <span className={styles.subPaneLabel}>Select Chapter:</span>
                    {[1, 2, 3].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        className={`${styles.chapSelectBtn} ${
                          selectedChapterEdit === ch ? styles.chapSelectBtnActive : ''
                        }`}
                        onClick={() => {
                          setSelectedChapterEdit(ch);
                          setActivePage(ch + 1); // automatically jump to that page spread!
                        }}
                      >
                        Chapter {ch}
                      </button>
                    ))}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor={`chapterTitle-${selectedChapterEdit}`}>
                      Chapter {selectedChapterEdit} Title:
                    </label>
                    <input
                      id={`chapterTitle-${selectedChapterEdit}`}
                      type="text"
                      className={styles.textInput}
                      value={chapterProse[selectedChapterEdit]?.title || ''}
                      onChange={(e) =>
                        handleUpdateChapterTitle(selectedChapterEdit, e.target.value)
                      }
                      placeholder="e.g. The Secret Constellation"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor={`chapterLines-${selectedChapterEdit}`}>
                      Story Narrative Sentences (one per paragraph):
                    </label>
                    <textarea
                      id={`chapterLines-${selectedChapterEdit}`}
                      rows={5}
                      className={styles.textArea}
                      value={(chapterProse[selectedChapterEdit]?.lines || []).join('\n')}
                      onChange={(e) =>
                        handleUpdateChapterLines(selectedChapterEdit, e.target.value)
                      }
                      placeholder="Type your custom story sentences here..."
                    />
                    <span className={styles.charCount}>
                      Prose lines are rendered live on the open page spread!
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Hero Avatar & Co-Star Mascot */}
              {step4Tab === 'avatar' && (
                <div className={styles.customSubPane}>
                  <div className={styles.fieldGroup}>
                    <label>Story Co-Star Companion:</label>
                    <div className={styles.mascotCoStarGrid}>
                      {[
                        { id: 'leo', name: 'Leo The Lion', tag: 'Courage & Roar' },
                        { id: 'penny', name: 'Princess Penny', tag: 'Magic & Grace' },
                        { id: 'dexter', name: 'Dexter Dino', tag: 'Explorer & Dino' },
                        { id: 'carty', name: 'Carty Courier', tag: 'Tech & Speed' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`${styles.coStarCard} ${
                            mascotCoStar === m.id ? styles.coStarCardActive : ''
                          }`}
                          onClick={() => {
                            setMascotCoStar(m.id);
                            speak(`Excited to co-star with ${childName} in the adventure!`, 'happy');
                          }}
                        >
                          <strong>{m.name}</strong>
                          <span>{m.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.avatarPaletteGroup}>
                    <label>Hero Hair Tone:</label>
                    <div className={styles.colorSwatches}>
                      {[
                        { hex: '#1e293b', label: 'Obsidian Black' },
                        { hex: '#4a2c11', label: 'Chestnut Brown' },
                        { hex: '#fde047', label: 'Sunlit Blonde' },
                        { hex: '#b91c1c', label: 'Crimson Red' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`${styles.swatchBtn} ${
                            avatar.hair === c.hex ? styles.swatchBtnActive : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => setAvatar((prev) => ({ ...prev, hair: c.hex }))}
                          title={c.label}
                          aria-label={`Select ${c.label} hair`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={styles.avatarPaletteGroup}>
                    <label>Hero Outfit Tone:</label>
                    <div className={styles.colorSwatches}>
                      {[
                        { hex: '#2563eb', label: 'Royal Blue' },
                        { hex: '#059669', label: 'Emerald Green' },
                        { hex: '#dc2626', label: 'Coral Red' },
                        { hex: '#7c3aed', label: 'Amethyst Violet' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`${styles.swatchBtn} ${
                            avatar.outfit === c.hex ? styles.swatchBtnActive : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => setAvatar((prev) => ({ ...prev, outfit: c.hex }))}
                          title={c.label}
                          aria-label={`Select ${c.label} outfit`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Hero Accessory:</label>
                    <div className={styles.pillOptions}>
                      {[
                        { id: 'cape', label: 'Star Cape' },
                        { id: 'glasses', label: 'Explorer Specs' },
                        { id: 'astronaut_helmet', label: 'Cosmo Helmet' },
                        { id: 'crown', label: 'Royal Tiara' },
                        { id: 'none', label: 'Classic' },
                      ].map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          className={`${styles.pillBtn} ${
                            avatar.accessory === acc.id ? styles.pillBtnActive : ''
                          }`}
                          onClick={() => setAvatar((prev) => ({ ...prev, accessory: acc.id }))}
                        >
                          {acc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Typography & Print Bleed Margins */}
              {step4Tab === 'typography' && (
                <div className={styles.customSubPane}>
                  <div className={styles.fieldGroup}>
                    <label>Interior Book Typography:</label>
                    <div className={styles.pillOptions}>
                      {[
                        { id: 'serif', label: 'Classic Serif' },
                        { id: 'sans', label: 'Modern Sans' },
                        { id: 'display', label: 'Bold Display' },
                        { id: 'cursive', label: 'Storybook Cursive' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className={`${styles.pillBtn} ${
                            fontFamily === f.id ? styles.pillBtnActive : ''
                          }`}
                          onClick={() => setFontFamily(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>Storybook Ink Tone:</label>
                    <div className={styles.colorSwatches}>
                      {[
                        { hex: '#0f172a', label: 'Archival Charcoal' },
                        { hex: '#1e1b4b', label: 'Deep Starlight Navy' },
                        { hex: '#450a0a', label: 'Imperial Crimson' },
                        { hex: '#022c22', label: 'Forest Evergreen' },
                      ].map((ink) => (
                        <button
                          key={ink.hex}
                          type="button"
                          className={`${styles.swatchBtn} ${
                            textColor === ink.hex ? styles.swatchBtnActive : ''
                          }`}
                          style={{ backgroundColor: ink.hex }}
                          onClick={() => setTextColor(ink.hex)}
                          title={ink.label}
                          aria-label={`Select ${ink.label}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className={styles.toggleRow}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={showBleed}
                        onChange={(e) => setShowBleed(e.target.checked)}
                      />
                      <span>Show 3mm Print Bleed Guides & Safe Art Zones</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 4: Stamps & Summary */}
              {step4Tab === 'stamps' && (
                <div className={styles.customSubPane}>
                  <div className={styles.proofSummaryBox}>
                    <div className={styles.summaryItem}>
                      <span>Hero Star:</span>
                      <strong>{childName}</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Adventure Theme:</span>
                      <strong>{activeThemeObj.name}</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Story Co-Star:</span>
                      <strong>{coStarNames[mascotCoStar]}</strong>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Placed Stamps:</span>
                      <strong>{stickers.length} Custom Badges</strong>
                    </div>
                  </div>

                  <p className={styles.paneTip}>
                    Tip: Click any stamp directly on the canvas to rotate (↺/↻), resize (A-/A+), or reposition it!
                  </p>
                </div>
              )}
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
