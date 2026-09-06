import { useCallback, useContext, useEffect, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { useMascot } from '../../context/MascotProvider';
import { useToast } from '../UI/Toast';
import { trackAddToCart } from '../../analytics/google';
import { CanvasEngine } from './CanvasEngine';
import { StickerBar } from './StickerBar';
import { CharacterCreator } from './CharacterCreator';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircleIcon,
  SparklesIcon,
  CloseIcon,
  TrashIcon,
} from '../Icons';
import {
  FullscreenIcon,
  ExitFullscreenIcon,
  UndoIcon,
  RedoIcon,
  FlipHorizontalIcon,
  BookOpenIcon,
  TemplateToolIcon,
  TextToolIcon,
  EyePreviewIcon,
  AddPageIcon,
  LayerFrontIcon,
  MascotLeoSvg,
  StarStampSvg,
} from './StudioSVGs';
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

// Pre-Designed Story Spread Templates & Blank Canvas Engine
const SPREAD_TEMPLATES = [
  {
    id: 'space_quest',
    name: 'Cosmic Starlight Quest',
    desc: 'Nebula backdrop, Luna companion, cosmic speech bubble & ringed planet',
    theme: 'space',
    stickers: [
      { id: 'tmpl-luna', type: 'mascot_luna', x: 280, y: 220, scale: 1.3, rotation: 0, flipX: false },
      { id: 'tmpl-bubble', type: 'bubble', x: 380, y: 120, scale: 1.1, rotation: 0, flipX: false, text: 'Into the cosmos!' },
      { id: 'tmpl-planet', type: 'planet', x: 440, y: 280, scale: 1.2, rotation: -10, flipX: false },
      { id: 'tmpl-star', type: 'star', x: 180, y: 80, scale: 1, rotation: 15, flipX: false },
    ],
  },
  {
    id: 'magic_forest',
    name: 'Enchanted Whispering Woods',
    desc: 'Deep fantasy forest, Princess Penny & Finley, enchanted rose & starlight wand',
    theme: 'magic',
    stickers: [
      { id: 'tmpl-penny', type: 'mascot_penny', x: 290, y: 230, scale: 1.3, rotation: 0, flipX: false },
      { id: 'tmpl-finley', type: 'mascot_finley', x: 420, y: 240, scale: 1.1, rotation: 0, flipX: true },
      { id: 'tmpl-bubble', type: 'bubble', x: 360, y: 110, scale: 1.1, rotation: 0, flipX: false, text: 'A secret awaits us...' },
      { id: 'tmpl-rose', type: 'rose', x: 200, y: 300, scale: 1.1, rotation: 0, flipX: false },
      { id: 'tmpl-wand', type: 'magic_wand', x: 450, y: 100, scale: 1.2, rotation: 25, flipX: false },
    ],
  },
  {
    id: 'dino_safari',
    name: 'Prehistoric Dino Expedition',
    desc: 'Tropical jungle valley, Professor Dexter Dino, explorer compass & scout patch',
    theme: 'dino',
    stickers: [
      { id: 'tmpl-dexter', type: 'mascot_dexter', x: 310, y: 220, scale: 1.3, rotation: 0, flipX: false },
      { id: 'tmpl-bubble', type: 'bubble', x: 400, y: 120, scale: 1.1, rotation: 0, flipX: false, text: 'Fossils and giant footprints!' },
      { id: 'tmpl-compass', type: 'compass', x: 210, y: 280, scale: 1.2, rotation: 0, flipX: false },
      { id: 'tmpl-badge', type: 'badge_dino_scout', x: 440, y: 270, scale: 1.2, rotation: 5, flipX: false },
    ],
  },
  {
    id: 'bedtime_voyage',
    name: 'Bedtime Dreamland',
    desc: 'Starlight bedroom, Leo Story Lion, courage heart medal & twinkling star',
    theme: 'space',
    stickers: [
      { id: 'tmpl-leo', type: 'mascot_leo', x: 300, y: 220, scale: 1.3, rotation: 0, flipX: false },
      { id: 'tmpl-bubble', type: 'bubble', x: 380, y: 120, scale: 1.1, rotation: 0, flipX: false, text: 'Sweet dreams Noah!' },
      { id: 'tmpl-badge', type: 'badge_brave', x: 430, y: 260, scale: 1.2, rotation: 0, flipX: false },
      { id: 'tmpl-star', type: 'star', x: 190, y: 90, scale: 1.2, rotation: 0, flipX: false },
    ],
  },
  {
    id: 'sneaker_metropolis',
    name: 'Sneakerhead Skyline',
    desc: 'Futuristic sneaker city, Carty & Sparky, sneaker crest & hero badge',
    theme: 'sneaker',
    stickers: [
      { id: 'tmpl-carty', type: 'mascot_carty', x: 280, y: 240, scale: 1.2, rotation: 0, flipX: false },
      { id: 'tmpl-sparky', type: 'mascot_sparky', x: 410, y: 230, scale: 1.2, rotation: 0, flipX: true },
      { id: 'tmpl-bubble', type: 'bubble', x: 340, y: 120, scale: 1.1, rotation: 0, flipX: false, text: 'Fresh kicks, legendary style!' },
      { id: 'tmpl-sneaker', type: 'sneaker', x: 190, y: 290, scale: 1.2, rotation: 0, flipX: false },
      { id: 'tmpl-hero', type: 'badge_hero', x: 440, y: 100, scale: 1.1, rotation: 0, flipX: false },
    ],
  },
  {
    id: 'blank_canvas',
    name: 'Blank Canvas (Clean Slate)',
    desc: 'Pure clean page with zero presets, ready for you to create your own scene from scratch',
    theme: null,
    stickers: [],
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
  const [isWidescreen, setIsWidescreen] = useState(false);
  const [bubbleText, setBubbleText] = useState('Adventure time!');

  // Fullscreen Studio & Interactive Flipbook state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState('templates'); // 'templates' | 'stamps' | 'avatar' | 'typography' | 'layers'
  const [zoomLevel, setZoomLevel] = useState(1);

  // Multi-Page Story Reel
  const [bookSpreads, setBookSpreads] = useState([
    { id: 'cover-front', title: 'Cover Spread', type: 'cover', pageNumber: 0 },
    { id: 'spread-1', title: 'Dedication Spread', type: 'dedication', pageNumber: 1 },
    { id: 'spread-2', title: 'Noah’s Journey Begins', type: 'chapter', chapterNum: 1, pageNumber: 2 },
    { id: 'spread-3', title: 'Starlight Compass', type: 'chapter', chapterNum: 2, pageNumber: 3 },
    { id: 'spread-4', title: 'Grand Victory Celebration', type: 'chapter', chapterNum: 3, pageNumber: 4 },
  ]);

  // History stack for Undo / Redo
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleUpdateStickers = (newStickersOrFn) => {
    setStickers((prev) => {
      const next =
        typeof newStickersOrFn === 'function'
          ? newStickersOrFn(prev)
          : newStickersOrFn;
      setHistory((hPrev) => {
        const sliced = hPrev.slice(0, historyIndex + 1);
        return [...sliced, next];
      });
      setHistoryIndex((idx) => idx + 1);
      return next;
    });
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex((idx) => idx - 1);
      setStickers(prev);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex((idx) => idx + 1);
      setStickers(next);
    }
  }, [historyIndex, history]);

  // Keyboard shortcut listener for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Drop sticker directly onto page center
  const handleDropStickerToCenter = (type) => {
    const width = isWidescreen || isFullscreen ? 760 : 540;
    const height = isWidescreen || isFullscreen ? 520 : 400;
    const dropX = activePage >= 1 ? (3 * width) / 4 : width / 2;
    const dropY = height / 2;
    const newSticker = {
      id: `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      x: dropX,
      y: dropY,
      scale: 1.2,
      rotation: 0,
      flipX: false,
      text: type === 'bubble' ? bubbleText : undefined,
    };
    handleUpdateStickers([...stickers, newSticker]);
  };

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
    hairColor: '#4a2c11',
    hairstyle: 'curls',
    hairStyle: 'curls',
    outfit: '#2563eb',
    outfitColor: '#2563eb',
    accessory: 'cape',
    eyeColor: '#2563eb',
  });

  const [companion, setCompanion] = useState({
    species: 'leo',
    name: 'Leo',
    furColor: '#ea580c',
    collar: 'star_bandana',
    badge: 'badge_hero',
  });

  const [mascotCoStar, setMascotCoStar] = useState('leo');

  const handleCompanionChange = (newComp) => {
    setCompanion(newComp);
    if (newComp.species) {
      setMascotCoStar(newComp.species);
      setMascot(newComp.species);
    }
  };
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

  // Template / Blank Canvas Applier
  const handleApplyTemplate = (tmpl) => {
    if (tmpl.theme) setTheme(tmpl.theme);
    handleUpdateStickers(tmpl.stickers || []);
    showToast(`Applied "${tmpl.name}" template!`, 'success');
  };

  // Spread Manager Handlers
  const handleAddSpread = () => {
    const newSpreadNum = bookSpreads.length;
    const newSpread = {
      id: `spread-${Date.now()}`,
      title: `Page ${newSpreadNum}: New Adventure`,
      type: 'chapter',
      chapterNum: newSpreadNum - 1,
      pageNumber: newSpreadNum,
    };
    setBookSpreads((prev) => [...prev, newSpread]);
    setActivePage(newSpreadNum);
    showToast('New story spread added to book!', 'success');
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
    finley: 'Finley The Starlight Fox',
    luna: 'Luna The Shepherd',
    leo: 'Leo The Story Lion',
    penny: 'Princess Penny',
    dexter: 'Dexter The Dino',
    carty: 'Carty The Courier',
    sparky: 'Sparky Hound',
  };

  const handleAddToCart = () => {
    const customItemId = `CUSTOM-BOOK-${Date.now()}`;
    const customBookSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#0f172a" rx="12"/>
      <rect x="12" y="12" width="136" height="136" rx="8" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/>
      <rect x="78" y="12" width="4" height="136" fill="#f59e0b" opacity="0.4"/>
      <circle cx="80" cy="65" r="28" fill="#f59e0b"/>
      <polygon points="80,52 83.5,61 93,62 85.5,68.5 88,78 80,73 72,78 74.5,68.5 67,62 76.5,61" fill="#1e1b4b"/>
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
              {currentStep > s.num ? <CheckCircleIcon size={12} /> : s.num}
            </span>
            <span className={styles.stepLabel}>{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Two-Column Stage */}
      <div className={`${styles.stageGrid} ${isWidescreen ? styles.theaterGrid : ''}`}>
        {/* Left Column: Interactive Canvas Stage */}
        <div className={`${styles.canvasStage} ${isWidescreen ? styles.theaterCanvasStage : ''}`}>
          <div className={styles.canvasHeader}>
            <div className={styles.proofBadge}>
              <SparklesIcon size={14} />
              <span>Live Print-Ready Proof Preview</span>
            </div>

            <div className={styles.headerRightControls}>
              <div className={styles.pageIndicator}>
                {activePage === 0
                  ? 'Hardcover Front'
                  : activePage === 1
                  ? 'Page 1 & Dedication'
                  : `Pages ${activePage * 2 - 1} & ${activePage * 2}`}
              </div>

              {/* Fullscreen Studio Launcher */}
              <button
                type="button"
                className={styles.fullscreenStudioBtn}
                onClick={() => setIsFullscreen(true)}
                title="Open Immersive Fullscreen Custom Builder"
                aria-label="Expand to fullscreen studio"
              >
                <FullscreenIcon size={13} />
                <span>Fullscreen</span>
              </button>

              {/* Flipbook Preview Launcher */}
              <button
                type="button"
                className={styles.flipbookPreviewBtn}
                onClick={() => setIsFlipbookOpen(true)}
                title="Preview physical flipbook reader"
                aria-label="Preview physical book reader"
              >
                <EyePreviewIcon size={13} />
                <span>Reader</span>
              </button>

              <button
                type="button"
                className={`${styles.theaterToggleBtn} ${
                  isWidescreen ? styles.theaterToggleActive : ''
                }`}
                onClick={() => setIsWidescreen((prev) => !prev)}
                title={
                  isWidescreen
                    ? 'Switch to Standard Split View'
                    : 'Expand to Spacious Widescreen Studio Mode'
                }
                aria-label={
                  isWidescreen
                    ? 'Switch to standard studio view'
                    : 'Expand to widescreen studio view'
                }
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  {isWidescreen ? (
                    <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
                  ) : (
                    <path d="M15 3h6v6m0-6l-7 7M9 21H3v-6m0 6l7-7M21 9v6m0 0l-7-7M3 15v-6m0 0l7 7" />
                  )}
                </svg>
                <span>{isWidescreen ? 'Compact' : 'Widescreen'}</span>
              </button>
            </div>
          </div>

          <CanvasEngine
            width={isWidescreen ? 760 : 540}
            height={isWidescreen ? 520 : 400}
            mode="storybook"
            config={{
              childName: childName || 'Adventurer',
              theme,
              activePage,
              dedication,
              chapterProse,
              avatar,
              companion,
              mascotCoStar,
              fontFamily,
              textColor,
              showBleed,
            }}
            selectedSticker={selectedSticker}
            stickers={stickers}
            onUpdateStickers={handleUpdateStickers}
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
              {bookSpreads.map((spread, p) => (
                <button
                  key={spread.id}
                  type="button"
                  className={`${styles.pageDot} ${
                    activePage === p ? styles.pageDotActive : ''
                  }`}
                  onClick={() => setActivePage(p)}
                  aria-label={`Jump to page spread ${p + 1}`}
                >
                  {p === 0 ? 'Cover' : p}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.flipBtn}
              disabled={activePage === bookSpreads.length - 1}
              onClick={() => setActivePage((prev) => Math.min(bookSpreads.length - 1, prev + 1))}
              aria-label="Next book spread"
            >
              <span>Next Page</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Bottom Storyboard Reel Strip */}
          <div className={styles.storyReelStrip} aria-label="Storybook page spreads reel">
            <div className={styles.reelTopRow}>
              <span className={styles.reelHeading}>Book Page Spreads ({bookSpreads.length})</span>
              <button
                type="button"
                className={styles.addSpreadQuickBtn}
                onClick={handleAddSpread}
                title="Add new story spread"
                aria-label="Add new story spread"
              >
                <AddPageIcon size={12} />
                <span>+ Add Page</span>
              </button>
            </div>
            <div className={styles.reelThumbnails}>
              {bookSpreads.map((spread, idx) => (
                <button
                  key={spread.id}
                  type="button"
                  className={`${styles.reelThumb} ${activePage === idx ? styles.reelThumbActive : ''}`}
                  onClick={() => setActivePage(idx)}
                  title={`Open ${spread.title}`}
                >
                  <div className={styles.thumbMiniBook}>
                    <span className={styles.thumbNum}>#{idx + 1}</span>
                    <BookOpenIcon size={12} />
                  </div>
                  <span className={styles.thumbLabel}>{spread.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Story Assets & Stamps Drawer */}
          <StickerBar
            selectedSticker={selectedSticker}
            onSelectSticker={setSelectedSticker}
            onClearStickers={() => handleUpdateStickers([])}
            stickersCount={stickers.length}
            onAddStickerToCenter={handleDropStickerToCenter}
            bubbleText={bubbleText}
            onChangeBubbleText={setBubbleText}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        </div>

        {/* Right Column: Interactive Configuration Workshop */}
        <div className={styles.configWorkshop}>
          {currentStep === 1 && (
            <div className={styles.stepPane}>
              <div className={styles.paneHeader}>
                <span className={styles.paneTag}>Step 1 of 5</span>
                <h3>Who is Starring in this Story?</h3>
                <p>We weave your child’s name directly into every chapter illustration and title.</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="childNameInput">Child’s First Name:</label>
                <input
                  id="childNameInput"
                  type="text"
                  className={styles.textInput}
                  value={childName}
                  maxLength={18}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Noah, Maya, Liam..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ageGroupSelect">Target Age Range:</label>
                <select
                  id="ageGroupSelect"
                  className={styles.selectInput}
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                >
                  <option value="2-4 Years">Toddler (Ages 2-4)</option>
                  <option value="4-6 Years">Early Reader (Ages 4-6)</option>
                  <option value="6-8 Years">Young Explorer (Ages 6-8)</option>
                  <option value="8-10 Years">Chapter Book (Ages 8-10)</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles.stepPane}>
              <div className={styles.paneHeader}>
                <span className={styles.paneTag}>Step 2 of 5</span>
                <h3>Choose an Adventure Theme</h3>
                <p>Select the overarching imaginative world your child will explore.</p>
              </div>

              <div className={styles.themeGrid}>
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
                      {theme === t.id && (
                        <span className={styles.themeActiveCheck}>
                          <CheckCircleIcon size={16} />
                        </span>
                      )}
                    </div>
                    <h4 className={styles.themeName}>{t.name}</h4>
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
                <p>A personal message permanently printed on the official opening certificate spread.</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dedicationInput">Dedication Note:</label>
                <textarea
                  id="dedicationInput"
                  rows={4}
                  className={styles.textAreaInput}
                  value={dedication}
                  maxLength={180}
                  onChange={(e) => setDedication(e.target.value)}
                  placeholder="Write from the heart..."
                />
                <span className={styles.charCounter}>{dedication.length}/180 characters</span>
              </div>

              <div className={styles.dedicationPresets}>
                <span className={styles.presetsLabel}>Quick Inspiration Presets:</span>
                {[
                  {
                    label: '"Stay curious and conquer the stars..."',
                    text: `For our adventurous ${childName} — Stay curious and conquer the stars. Love always, Mom & Dad.`,
                  },
                  {
                    label: '"To our brave hero — adventure awaits!"',
                    text: `To our brave hero ${childName} — Every great dream begins in your heart.`,
                  },
                  {
                    label: '"Never stop exploring and dreaming big."',
                    text: `For ${childName}, our greatest treasure. Never stop exploring!`,
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={styles.presetBtn}
                    onClick={() => setDedication(preset.text)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className={styles.stepPane}>
              <div className={styles.paneHeader}>
                <span className={styles.paneTag}>Step 4 of 5</span>
                <h3>Deep Customization Workshop</h3>
                <p>Personalize story prose, character appearance, and fine-tune placement.</p>
              </div>

              {/* Step 4 Sub-Tabs */}
              <div className={styles.subTabs} role="tablist" aria-label="Deep Customization Tabs">
                {[
                  { id: 'templates', label: 'Templates' },
                  { id: 'prose', label: 'Prose Editor' },
                  { id: 'avatar', label: 'Avatar & Co-Star' },
                  { id: 'typography', label: 'Typography & Bleed' },
                  { id: 'stamps', label: 'Stamps & Badges' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={step4Tab === t.id}
                    className={`${styles.subTabBtn} ${
                      step4Tab === t.id ? styles.subTabBtnActive : ''
                    }`}
                    onClick={() => setStep4Tab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Sub-Pane 0: Templates & Blank Canvas */}
              {step4Tab === 'templates' && (
                <div className={styles.subPane}>
                  <span className={styles.subPaneLabel}>Story Spread Templates:</span>
                  <div className={styles.templateListInline}>
                    {SPREAD_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        className={styles.inlineTemplateCard}
                        onClick={() => handleApplyTemplate(tmpl)}
                      >
                        <div className={styles.inlineTemplateTop}>
                          <strong>{tmpl.name}</strong>
                          {tmpl.theme && <span className={styles.inlineThemePill}>{tmpl.theme}</span>}
                        </div>
                        <p>{tmpl.desc}</p>
                        <span className={styles.applyBtnText}>Apply Template</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Pane 1: Prose Editor */}
              {step4Tab === 'prose' && (
                <div className={styles.subPane}>
                  <div className={styles.chapterSelectorRow}>
                    <span className={styles.subPaneLabel}>Select Chapter:</span>
                    <div className={styles.chapterPills}>
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`${styles.chapterPill} ${
                            selectedChapterEdit === num ? styles.chapterPillActive : ''
                          }`}
                          onClick={() => {
                            setSelectedChapterEdit(num);
                            setActivePage(num + 1);
                          }}
                        >
                          Chapter {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="chapterTitleInput">{`Chapter ${selectedChapterEdit} Title:`}</label>
                    <input
                      id="chapterTitleInput"
                      type="text"
                      className={styles.textInput}
                      value={chapterProse[selectedChapterEdit]?.title || ''}
                      onChange={(e) =>
                        handleUpdateChapterTitle(selectedChapterEdit, e.target.value)
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="chapterProseInput">Story Lines (one per paragraph):</label>
                    <textarea
                      id="chapterProseInput"
                      rows={5}
                      className={styles.textAreaInput}
                      value={chapterProse[selectedChapterEdit]?.lines.join('\n') || ''}
                      onChange={(e) =>
                        handleUpdateChapterLines(selectedChapterEdit, e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Sub-Pane 2: Avatar & Co-Star Character Studio */}
              {step4Tab === 'avatar' && (
                <div className={styles.subPane}>
                  <CharacterCreator
                    heroName={childName}
                    avatar={avatar}
                    onChangeAvatar={setAvatar}
                    companion={companion}
                    onChangeCompanion={handleCompanionChange}
                    initialTab="companion"
                  />
                </div>
              )}

              {/* Sub-Pane 3: Typography & Bleed */}
              {step4Tab === 'typography' && (
                <div className={styles.subPane}>
                  <div className={styles.formGroup}>
                    <span className={styles.subPaneLabel}>Storybook Font Style:</span>
                    <div className={styles.fontOptions}>
                      {[
                        { id: 'serif', label: 'Classic Keepsake Serif' },
                        { id: 'sans', label: 'Clean Modern Sans' },
                        { id: 'cursive', label: 'Storybook Cursive' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className={`${styles.fontBtn} ${
                            fontFamily === f.id ? styles.fontBtnActive : ''
                          }`}
                          onClick={() => setFontFamily(f.id)}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="textColorInput">Story Text Color:</label>
                    <div className={styles.colorPickRow}>
                      <input
                        id="textColorInput"
                        type="color"
                        className={styles.colorPicker}
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                      <span className={styles.colorHexCode}>{textColor}</span>
                    </div>
                  </div>

                  <div className={styles.bleedToggleSection}>
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

              {/* Sub-Pane 4: Stamps & Badges Layer Manager */}
              {step4Tab === 'stamps' && (
                <div className={styles.subPane}>
                  <div className={styles.formGroup}>
                    <label htmlFor="step4BubbleText">Speech Bubble Dialogue:</label>
                    <div className={styles.bubbleInputGroup}>
                      <input
                        id="step4BubbleText"
                        type="text"
                        className={styles.textInput}
                        value={bubbleText}
                        maxLength={32}
                        onChange={(e) => setBubbleText(e.target.value)}
                        placeholder="e.g. Look at that star!"
                      />
                      <button
                        type="button"
                        className={styles.addBubbleBtn}
                        onClick={() => handleDropStickerToCenter('bubble')}
                        title="Add speech bubble to page"
                        aria-label="Add speech bubble"
                      >
                        + Add Bubble
                      </button>
                    </div>
                  </div>

                  {/* Active Placed Stamps Layer List */}
                  {stickers.length > 0 && (
                    <div className={styles.placedStampsSection}>
                      <div className={styles.placedStampsHeader}>
                        <span className={styles.subPaneLabel}>Placed Stamps on Page ({stickers.length}):</span>
                        <button
                          type="button"
                          className={styles.clearAllSmallBtn}
                          onClick={() => handleUpdateStickers([])}
                          aria-label="Clear all page stamps"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className={styles.placedStampsList}>
                        {stickers.map((stk, idx) => (
                          <div key={stk.id} className={styles.placedStampItem}>
                            <div className={styles.stampItemInfo}>
                              <span className={styles.stampItemIndex}>#{idx + 1}</span>
                              <span className={styles.stampItemName}>
                                {stk.type === 'bubble'
                                  ? `Bubble: "${stk.text || bubbleText}"`
                                  : stk.type.replace(/^(mascot_|badge_)/, '').replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className={styles.stampItemActions}>
                              <button
                                type="button"
                                className={styles.miniActionBtn}
                                onClick={() =>
                                  handleUpdateStickers(
                                    stickers.map((s) =>
                                      s.id === stk.id ? { ...s, flipX: !s.flipX } : s
                                    )
                                  )
                                }
                                title="Flip Horizontally"
                                aria-label={`Flip stamp ${idx + 1}`}
                              >
                                <FlipHorizontalIcon size={12} />
                              </button>
                              <button
                                type="button"
                                className={`${styles.miniActionBtn} ${styles.miniDeleteBtn}`}
                                onClick={() =>
                                  handleUpdateStickers(
                                    stickers.filter((s) => s.id !== stk.id)
                                  )
                                }
                                title="Delete stamp"
                                aria-label={`Delete stamp ${idx + 1}`}
                              >
                                <TrashIcon size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className={styles.paneTip}>
                    Tip: Click any stamp on the canvas to rotate, resize, flip, or reposition it! Use Cmd+Z to undo.
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

      {/* FULLSCREEN DEDICATED STUDIO MODAL WORKSTATION */}
      {isFullscreen && (
        <div
          className={styles.fullscreenOverlay}
          role="dialog"
          aria-label="Immersive Storybook Builder Studio"
        >
          {/* Top Control Bar */}
          <header className={styles.fsHeader}>
            <div className={styles.fsHeaderLeft}>
              <div className={styles.fsBrandPill}>
                <BookOpenIcon size={16} />
                <span>Studio Pro</span>
              </div>
              <input
                type="text"
                className={styles.fsHeroTitleInput}
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                aria-label="Book child hero name in fullscreen"
                placeholder="Hero Name"
              />
              <span className={styles.fsTitleTheme}>'s {activeThemeObj.name}</span>
            </div>

            <div className={styles.fsHeaderCenter}>
              <div className={styles.fsHistoryControls}>
                <button
                  type="button"
                  className={styles.fsBarBtn}
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo (Cmd+Z)"
                  aria-label="Undo canvas change in fullscreen"
                >
                  <UndoIcon size={14} />
                  <span>Undo</span>
                </button>
                <button
                  type="button"
                  className={styles.fsBarBtn}
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo (Cmd+Shift+Z)"
                  aria-label="Redo canvas change in fullscreen"
                >
                  <RedoIcon size={14} />
                  <span>Redo</span>
                </button>
              </div>

              <div className={styles.fsZoomControls}>
                <button
                  type="button"
                  className={styles.fsZoomBtn}
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                  title="Zoom Out"
                >
                  -
                </button>
                <span className={styles.fsZoomIndicator}>{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  className={styles.fsZoomBtn}
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  className={styles.fsZoomReset}
                  onClick={() => setZoomLevel(1)}
                  title="Reset Zoom"
                >
                  Fit
                </button>
              </div>

              <button
                type="button"
                className={`${styles.fsGuideBtn} ${showBleed ? styles.fsGuideBtnActive : ''}`}
                onClick={() => setShowBleed((b) => !b)}
                title="Toggle Print Bleed & Margin Guides"
              >
                <span>Bleed Margin</span>
              </button>

              <button
                type="button"
                className={styles.fsReaderBtn}
                onClick={() => setIsFlipbookOpen(true)}
                title="Preview physical book reader"
                aria-label="Preview physical book in fullscreen"
              >
                <EyePreviewIcon size={14} />
                <span>Reader Proof</span>
              </button>
            </div>

            <div className={styles.fsHeaderRight}>
              <button
                type="button"
                className={styles.fsExitButton}
                onClick={() => setIsFullscreen(false)}
                title="Exit Fullscreen Mode (Esc)"
                aria-label="Exit fullscreen studio"
              >
                <ExitFullscreenIcon size={16} />
                <span>Exit</span>
              </button>

              <button
                type="button"
                className={styles.fsOrderBtn}
                onClick={handleAddToCart}
                aria-label="Add Personalized Storybook to Bag in Fullscreen"
              >
                <SparklesIcon size={14} />
                <span>Add to Bag • ${activeEditionObj.price.toFixed(2)}</span>
              </button>
            </div>
          </header>

          {/* Fullscreen 3-Column Studio Body */}
          <div className={styles.fsBody}>
            {/* Left Tool Rail & Flyout */}
            <aside className={styles.fsToolRail}>
              <div className={styles.fsRailIcons}>
                {[
                  { id: 'templates', label: 'Templates', Icon: TemplateToolIcon },
                  { id: 'stamps', label: 'Stamps', Icon: StarStampSvg },
                  { id: 'avatar', label: 'Avatar', Icon: MascotLeoSvg },
                  { id: 'typography', label: 'Typography', Icon: TextToolIcon },
                  { id: 'layers', label: 'Layers', Icon: LayerFrontIcon },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    className={`${styles.fsRailBtn} ${
                      activeToolTab === tool.id ? styles.fsRailBtnActive : ''
                    }`}
                    onClick={() => setActiveToolTab(tool.id)}
                    title={tool.label}
                  >
                    <tool.Icon size={18} />
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>

              <div className={styles.fsDrawerContent}>
                {activeToolTab === 'templates' && (
                  <div className={styles.fsDrawerSection}>
                    <h4>Story Spread Templates</h4>
                    <p className={styles.fsDrawerMuted}>Apply complete scenes or build blank.</p>
                    <div className={styles.fsTemplateCards}>
                      {SPREAD_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          className={styles.fsTemplateCard}
                          onClick={() => handleApplyTemplate(tmpl)}
                        >
                          <div className={styles.fsTemplateCardHead}>
                            <strong>{tmpl.name}</strong>
                            {tmpl.theme && <span className={styles.fsThemeTag}>{tmpl.theme}</span>}
                          </div>
                          <p>{tmpl.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeToolTab === 'stamps' && (
                  <div className={styles.fsDrawerSection}>
                    <h4>Story Assets & Stamps</h4>
                    <StickerBar
                      selectedSticker={selectedSticker}
                      onSelectSticker={setSelectedSticker}
                      onClearStickers={() => handleUpdateStickers([])}
                      stickersCount={stickers.length}
                      onAddStickerToCenter={handleDropStickerToCenter}
                      bubbleText={bubbleText}
                      onChangeBubbleText={setBubbleText}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      canUndo={historyIndex > 0}
                      canRedo={historyIndex < history.length - 1}
                    />
                  </div>
                )}

                {activeToolTab === 'avatar' && (
                  <div className={styles.fsDrawerSection}>
                    <h4>Hero & Co-Star Character Studio</h4>
                    <p className={styles.fsDrawerMuted}>Customize hero appearance and trusty companion pet.</p>
                    <CharacterCreator
                      heroName={childName}
                      avatar={avatar}
                      onChangeAvatar={setAvatar}
                      companion={companion}
                      onChangeCompanion={handleCompanionChange}
                      initialTab="hero"
                    />
                  </div>
                )}

                {activeToolTab === 'typography' && (
                  <div className={styles.fsDrawerSection}>
                    <h4>Story Prose & Fonts</h4>
                    <div className={styles.formGroup}>
                      <label htmlFor="fsChapterTitleInput">Chapter Title:</label>
                      <input
                        id="fsChapterTitleInput"
                        type="text"
                        className={styles.textInput}
                        value={chapterProse[selectedChapterEdit]?.title || ''}
                        onChange={(e) =>
                          handleUpdateChapterTitle(selectedChapterEdit, e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="fsChapterProseInput">Story Lines:</label>
                      <textarea
                        id="fsChapterProseInput"
                        rows={4}
                        className={styles.textAreaInput}
                        value={chapterProse[selectedChapterEdit]?.lines.join('\n') || ''}
                        onChange={(e) =>
                          handleUpdateChapterLines(selectedChapterEdit, e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {activeToolTab === 'layers' && (
                  <div className={styles.fsDrawerSection}>
                    <div className={styles.fsLayerTop}>
                      <h4>Page Layers ({stickers.length})</h4>
                      {stickers.length > 0 && (
                        <button
                          type="button"
                          className={styles.fsClearLayers}
                          onClick={() => handleUpdateStickers([])}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className={styles.fsLayerList}>
                      {stickers.map((stk, idx) => (
                        <div key={stk.id} className={styles.fsLayerRow}>
                          <span>#{idx + 1} {stk.type.replace(/^(mascot_|badge_)/, '')}</span>
                          <button
                            type="button"
                            className={styles.fsLayerDeleteBtn}
                            onClick={() =>
                              handleUpdateStickers(stickers.filter((s) => s.id !== stk.id))
                            }
                            aria-label={`Delete layer ${idx + 1}`}
                          >
                            <TrashIcon size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Center Canvas Stage in Fullscreen */}
            <main className={styles.fsStageCenter}>
              <div
                className={styles.fsCanvasTransform}
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <CanvasEngine
                  width={760}
                  height={520}
                  mode="storybook"
                  config={{
                    childName: childName || 'Adventurer',
                    theme,
                    activePage,
                    dedication,
                    chapterProse,
                    avatar,
                    companion,
                    mascotCoStar,
                    fontFamily,
                    textColor,
                    showBleed,
                  }}
                  selectedSticker={selectedSticker}
                  stickers={stickers}
                  onUpdateStickers={handleUpdateStickers}
                />
              </div>
            </main>
          </div>

          {/* Bottom Storyboard Filmstrip in Fullscreen */}
          <footer className={styles.fsFilmstrip}>
            <div className={styles.fsFilmstripHead}>
              <span>Story Reel Spreads ({bookSpreads.length})</span>
              <button
                type="button"
                className={styles.fsAddSpreadBtn}
                onClick={handleAddSpread}
                aria-label="Add new story spread in fullscreen"
              >
                <AddPageIcon size={13} />
                <span>+ Add Spread</span>
              </button>
            </div>
            <div className={styles.fsFilmstripCards}>
              {bookSpreads.map((spread, idx) => (
                <button
                  key={spread.id}
                  type="button"
                  className={`${styles.fsFilmCard} ${activePage === idx ? styles.fsFilmCardActive : ''}`}
                  onClick={() => setActivePage(idx)}
                >
                  <span className={styles.fsFilmNum}>#{idx + 1}</span>
                  <span className={styles.fsFilmTitle}>{spread.title}</span>
                </button>
              ))}
            </div>
          </footer>
        </div>
      )}

      {/* INTERACTIVE FLIPBOOK PREVIEW READER MODAL */}
      {isFlipbookOpen && (
        <div
          className={styles.flipbookOverlay}
          role="dialog"
          aria-label="Physical Flipbook Preview Reader"
        >
          <div className={styles.flipbookModal}>
            <div className={styles.flipbookHeader}>
              <div className={styles.flipbookTitleWrap}>
                <BookOpenIcon size={20} />
                <h3>{childName}'s {activeThemeObj.name} — Keepsake Flipbook Reader</h3>
              </div>
              <button
                type="button"
                className={styles.flipbookClose}
                onClick={() => setIsFlipbookOpen(false)}
                aria-label="Close flipbook reader"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className={styles.flipbookStage}>
              <CanvasEngine
                width={760}
                height={520}
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
                  showBleed: false,
                }}
                selectedSticker={null}
                stickers={stickers}
                onUpdateStickers={() => {}}
              />
            </div>

            <div className={styles.flipbookFooter}>
              <button
                type="button"
                className={styles.flipbookNavButton}
                disabled={activePage === 0}
                onClick={() => setActivePage((p) => Math.max(0, p - 1))}
                aria-label="Flip to previous page"
              >
                <ChevronLeft size={16} />
                <span>Previous Page</span>
              </button>
              <span className={styles.flipbookCounter}>
                Spread {activePage + 1} of {bookSpreads.length}
              </span>
              <button
                type="button"
                className={styles.flipbookNavButton}
                disabled={activePage === bookSpreads.length - 1}
                onClick={() => setActivePage((p) => Math.min(bookSpreads.length - 1, p + 1))}
                aria-label="Flip to next page"
              >
                <span>Next Page</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
