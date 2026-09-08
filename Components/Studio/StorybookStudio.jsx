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
  BoxIcon,
  SlidersIcon,
  LayersIcon,
  PlayIcon,
  PauseIcon,
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
  StudioWaxSealSvg,
  StudioPaletteSvg,
  StudioQuillSvg,
  StudioBookOpenSvg,
  ScenePanoramaSvg,
  SceneWindowSvg,
} from './StudioSVGs';
import {
  SCENE_ENVIRONMENTS,
  TIME_OF_DAY_OPTIONS,
  WEATHER_EFFECT_OPTIONS,
  getSceneById,
  getDefaultSceneForTheme,
} from './sceneEnvironments';
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

const DRAWER_TITLES = {
  1: { title: 'Hero & Character Studio', subtitle: 'Set hero name, age, and pet companion.' },
  2: { title: 'Adventure Theme & World', subtitle: 'Select setting and story atmosphere.' },
  3: { title: 'Front Page Dedication', subtitle: 'Craft an archival keepsake certificate.' },
  4: { title: 'Studio Customizer & Assets', subtitle: 'Edit prose, co-stars, typography, and stamps.' },
  5: { title: 'Print Binding & Pre-Flight', subtitle: 'Inspect print readiness and select heirloom binding.' },
};

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [inspectorTab, setInspectorTab] = useState('properties');

  // Jump to dedication spread when Step 3 is activated
  useEffect(() => {
    if (currentStep === 3) {
      setActivePage(1);
    }
  }, [currentStep]);

  // Fullscreen Studio & Interactive Flipbook state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlipbookOpen, setIsFlipbookOpen] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState('templates'); // 'templates' | 'scenes' | 'stamps' | 'avatar' | 'typography' | 'layers'
  const [zoomLevel, setZoomLevel] = useState(1);

  // Hyper-Realistic Scene Environments State
  const [activeSceneId, setActiveSceneId] = useState('cosmic_nebula');
  const [timeOfDay, setTimeOfDay] = useState('midnight');
  const [weatherEffect, setWeatherEffect] = useState('stars');
  const [spreadLayout, setSpreadLayout] = useState('panoramic'); // 'panoramic' | 'framed'
  const [isSceneAnimated, setIsSceneAnimated] = useState(true);
  const [sceneCategoryFilter, setSceneCategoryFilter] = useState('all');

  const handleSelectScene = (scene) => {
    setActiveSceneId(scene.id);
    setTimeOfDay(scene.defaultTimeOfDay);
    setWeatherEffect(scene.particles);
    showToast(`Applied ${scene.name} scene!`, 'info');
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    const defaultScene = getDefaultSceneForTheme(newTheme);
    setActiveSceneId(defaultScene);
    const sceneObj = getSceneById(defaultScene);
    if (sceneObj) {
      setTimeOfDay(sceneObj.defaultTimeOfDay);
      setWeatherEffect(sceneObj.particles);
    }
  };

  const filteredScenes =
    sceneCategoryFilter === 'all'
      ? SCENE_ENVIRONMENTS
      : SCENE_ENVIRONMENTS.filter((s) => s.category === sceneCategoryFilter);

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

  const handleUpdateStickers = useCallback(
    (newStickersOrFn, { commit = true } = {}) => {
      const next =
        typeof newStickersOrFn === 'function'
          ? newStickersOrFn(stickers)
          : newStickersOrFn;
      setStickers(next);
      if (commit) {
        setHistory((hPrev) => {
          const sliced = hPrev.slice(0, historyIndex + 1);
          return [...sliced, next];
        });
        setHistoryIndex((idx) => idx + 1);
      }
    },
    [stickers, historyIndex]
  );

  const activeLayer =
    stickers.find((s) => s.id === selectedLayerId) ||
    (stickers.length > 0 ? stickers[stickers.length - 1] : null);

  const handleUpdateActiveLayer = useCallback(
    (updatedProps) => {
      if (!activeLayer) return;
      handleUpdateStickers((prev) =>
        prev.map((s) => (s.id === activeLayer.id ? { ...s, ...updatedProps } : s))
      );
    },
    [activeLayer, handleUpdateStickers]
  );

  const handleDeleteActiveLayer = useCallback(
    (layerId = activeLayer?.id) => {
      if (!layerId) return;
      handleUpdateStickers((prev) => prev.filter((s) => s.id !== layerId));
      if (selectedLayerId === layerId) {
        setSelectedLayerId(null);
      }
    },
    [activeLayer, selectedLayerId, handleUpdateStickers]
  );

  const handleDuplicateActiveLayer = useCallback(() => {
    if (!activeLayer) return;
    const newId = `${activeLayer.type}-${Date.now()}`;
    const duplicate = {
      ...activeLayer,
      id: newId,
      x: Math.min(500, activeLayer.x + 20),
      y: Math.min(360, activeLayer.y + 20),
    };
    handleUpdateStickers((prev) => [...prev, duplicate]);
    setSelectedLayerId(newId);
  }, [activeLayer, handleUpdateStickers]);

  const handleReorderActiveLayer = useCallback(
    (direction) => {
      if (!activeLayer || stickers.length < 2) return;
      const index = stickers.findIndex((s) => s.id === activeLayer.id);
      if (index === -1) return;
      const targetIndex = direction === 'forward' ? index + 1 : index - 1;
      if (targetIndex < 0 || targetIndex >= stickers.length) return;
      const next = [...stickers];
      const [removed] = next.splice(index, 1);
      next.splice(targetIndex, 0, removed);
      handleUpdateStickers(next);
    },
    [activeLayer, stickers, handleUpdateStickers]
  );

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
    if (tmpl.theme) {
      handleThemeChange(tmpl.theme);
    }
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
      {/* Traditional 4-Column Creative Suite */}
      <div
        className={[
          styles.editorShell,
          !isDrawerOpen && !isInspectorOpen
            ? styles.editorShellBothCollapsed
            : !isDrawerOpen
            ? styles.editorShellDrawerCollapsed
            : !isInspectorOpen
            ? styles.editorShellInspectorCollapsed
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Left Tool Rail */}
        <aside className={styles.editorRail} aria-label="Editor Tool Rail">
          <div className={styles.railTopPill}>
            <StudioBookOpenSvg size={18} />
            <span>Studio</span>
          </div>

          <nav className={styles.railTabsList} aria-label="Storybook Creation Steps">
            {[
              { num: 1, label: 'Hero Name', Icon: MascotLeoSvg },
              { num: 2, label: 'Story Theme', Icon: StudioPaletteSvg },
              { num: 3, label: 'Dedication', Icon: StudioWaxSealSvg },
              { num: 4, label: 'Proof & Stamp', Icon: StarStampSvg },
              { num: 5, label: 'Print Binding', Icon: BoxIcon },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                className={`${styles.railTabBtn} ${
                  currentStep === s.num ? styles.railTabBtnActive : ''
                }`}
                onClick={() => {
                  setCurrentStep(s.num);
                  setIsDrawerOpen(true);
                  if (s.num === 3) setActivePage(1);
                }}
                title={s.label}
              >
                <div className={styles.railTabIconWrap}>
                  <s.Icon size={18} />
                </div>
                <span className={styles.railTabNum}>Step {s.num}</span>
                <span className={styles.railTabLabel}>{s.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className={styles.railDrawerToggleBtn}
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            title={isDrawerOpen ? 'Collapse Asset Drawer' : 'Expand Asset Drawer'}
            aria-label={isDrawerOpen ? 'Collapse Asset Drawer' : 'Expand Asset Drawer'}
          >
            {isDrawerOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </aside>

        {/* Right Column: Interactive Canvas Stage */}
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

              {/* Properties Inspector Toggle */}
              <button
                type="button"
                className={`${styles.theaterToggleBtn} ${
                  isInspectorOpen ? styles.theaterToggleActive : ''
                }`}
                onClick={() => setIsInspectorOpen((prev) => !prev)}
                title={
                  isInspectorOpen
                    ? 'Collapse Properties Inspector'
                    : 'Show Properties Inspector'
                }
                aria-label={
                  isInspectorOpen
                    ? 'Collapse properties inspector'
                    : 'Show properties inspector'
                }
              >
                <SlidersIcon size={13} />
                <span>{isInspectorOpen ? 'Hide Inspector' : 'Inspector'}</span>
              </button>

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

              {/* Motion Animation Toggle */}
              <button
                type="button"
                className={`${styles.motionToggleBtn} ${
                  isSceneAnimated ? styles.motionToggleActive : ''
                }`}
                onClick={() => setIsSceneAnimated((prev) => !prev)}
                title={
                  isSceneAnimated
                    ? 'Pause Animated Atmosphere'
                    : 'Play Animated Atmosphere'
                }
                aria-label={
                  isSceneAnimated ? 'Pause scene animation' : 'Play scene animation'
                }
              >
                {isSceneAnimated ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
                <span>{isSceneAnimated ? 'Motion' : 'Static'}</span>
              </button>

              {/* Spread Layout Switcher */}
              <button
                type="button"
                className={`${styles.layoutToggleBtn} ${
                  spreadLayout === 'panoramic' ? styles.layoutToggleActive : ''
                }`}
                onClick={() =>
                  setSpreadLayout((prev) =>
                    prev === 'panoramic' ? 'framed' : 'panoramic'
                  )
                }
                title={
                  spreadLayout === 'panoramic'
                    ? 'Panoramic Spread Active (Click for Classic Framed Vignette)'
                    : 'Classic Framed Active (Click for Seamless Panoramic Spread)'
                }
                aria-label={`Switch spread layout (currently ${spreadLayout})`}
              >
                {spreadLayout === 'panoramic' ? (
                  <ScenePanoramaSvg size={13} />
                ) : (
                  <SceneWindowSvg size={13} />
                )}
                <span>{spreadLayout === 'panoramic' ? 'Panoramic' : 'Framed'}</span>
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
            isAnimated={isSceneAnimated}
            config={{
              childName: childName || 'Adventurer',
              theme,
              sceneId: activeSceneId,
              timeOfDay,
              weatherEffect,
              spreadLayout,
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
                  aria-label={`Jump to page spread ${p + 1}: ${spread.title}`}
                  title={p === 0 ? 'Cover Spread' : `Spread ${p}: ${spread.title}`}
                />
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

        {/* Middle Column: Collapsible Asset Drawer */}
        {isDrawerOpen && (
          <aside className={styles.assetDrawer} aria-label="Asset and Customization Drawer">
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitleWrap}>
                <h3>{DRAWER_TITLES[currentStep]?.title || 'Customization Workshop'}</h3>
                <p>{DRAWER_TITLES[currentStep]?.subtitle || 'Personalize assets and layout.'}</p>
              </div>
              <button
                type="button"
                className={styles.drawerCollapseBtn}
                onClick={() => setIsDrawerOpen(false)}
                title="Collapse Drawer"
                aria-label="Collapse Drawer"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

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
                    onClick={() => handleThemeChange(t.id)}
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

              {/* Hyper-Realistic Scene Environments Section */}
              <div className={styles.sceneSectionDivider} />

              <div className={styles.sceneLibrarySection}>
                <div className={styles.sceneSectionHead}>
                  <div className={styles.sceneSectionTitleGroup}>
                    <SparklesIcon size={16} />
                    <h4>Adventure World & Scene Environments</h4>
                  </div>
                  <span className={styles.sceneSectionBadge}>
                    8 Worlds
                  </span>
                </div>
                <p className={styles.sceneSectionDesc}>
                  Hyper-realistic procedural backdrops with volumetric lighting, organic silhouettes, and physics particles.
                </p>

                {/* Category Filter Pills */}
                <div className={styles.sceneCategoryPills} role="tablist" aria-label="Scene Categories">
                  {[
                    { id: 'all', label: 'All Worlds' },
                    { id: 'space', label: 'Cosmic' },
                    { id: 'fantasy', label: 'Fantasy' },
                    { id: 'adventure', label: 'Prehistoric' },
                    { id: 'city', label: 'Skyline' },
                    { id: 'ocean', label: 'Undersea' },
                    { id: 'bedtime', label: 'Dreamland' },
                    { id: 'winter', label: 'Arctic' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={sceneCategoryFilter === cat.id}
                      className={`${styles.sceneCategoryBtn} ${
                        sceneCategoryFilter === cat.id ? styles.sceneCategoryBtnActive : ''
                      }`}
                      onClick={() => setSceneCategoryFilter(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Scene Cards Grid */}
                <div className={styles.sceneCardsGrid}>
                  {filteredScenes.map((scene) => {
                    const isActive = activeSceneId === scene.id;
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        className={`${styles.sceneCard} ${
                          isActive ? styles.sceneCardActive : ''
                        }`}
                        onClick={() => handleSelectScene(scene)}
                        aria-label={`Select ${scene.name} environment`}
                      >
                        <div className={styles.sceneCardTop}>
                          <span className={styles.sceneCardBadge}>{scene.badge}</span>
                          {isActive && (
                            <span className={styles.sceneCardActiveIndicator}>
                              <CheckCircleIcon size={14} />
                            </span>
                          )}
                        </div>
                        <h5 className={styles.sceneCardTitle}>{scene.name}</h5>
                        <p className={styles.sceneCardSub}>{scene.subtitle}</p>
                        <div className={styles.sceneCardFooter}>
                          <div className={styles.paletteSwatches} aria-label="Color Palette">
                            {scene.palette.map((color, idx) => (
                              <span
                                key={idx}
                                className={styles.paletteSwatch}
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          <span className={styles.particlePresetTag}>
                            {scene.particles}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Atmosphere & Lighting Controls */}
                <div className={styles.atmosphereControls}>
                  <div className={styles.atmosphereGroup}>
                    <label className={styles.atmosphereLabel}>Time of Day & Solar Lighting:</label>
                    <div className={styles.todButtonGroup}>
                      {TIME_OF_DAY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`${styles.todBtn} ${
                            timeOfDay === opt.id ? styles.todBtnActive : ''
                          }`}
                          onClick={() => setTimeOfDay(opt.id)}
                          aria-label={`Set time of day to ${opt.label}`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.atmosphereGroup}>
                    <label className={styles.atmosphereLabel}>Atmosphere & Weather Particles:</label>
                    <div className={styles.weatherButtonGroup}>
                      {WEATHER_EFFECT_OPTIONS.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          className={`${styles.weatherBtn} ${
                            weatherEffect === w.id ? styles.weatherBtnActive : ''
                          }`}
                          onClick={() => setWeatherEffect(w.id)}
                          aria-label={`Set weather effect to ${w.label}`}
                        >
                          <span>{w.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
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

              {/* Luxury Keepsake Certificate Proof Card */}
              <div className={styles.certificatePreviewCard}>
                <div className={styles.certificateBorderFrame}>
                  <div className={styles.certificateSealStamp}>
                    <StudioWaxSealSvg size={44} />
                  </div>
                  <div className={styles.certificateHeaderTag}>Official Keepsake • First Edition</div>
                  <h4 className={styles.certificateHeaderTitle}>Certificate of Imagination</h4>
                  <div className={styles.certificateRecipient}>
                    Dedicated to our brave hero <strong>{childName || 'Adventurer'}</strong>
                  </div>
                  <div className={styles.certificateLiveQuote}>
                    &ldquo;{dedication || 'Write a heartfelt dedication note below...'}&rdquo;
                  </div>
                  <div className={styles.certificateSignLine}>
                    <StudioQuillSvg size={14} />
                    <span>Permanent Archival Binding • Handcrafted in the USA</span>
                  </div>
                </div>
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
                  { id: 'scenes', label: 'Scene World' },
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

              {/* Sub-Pane: Scene Worlds */}
              {step4Tab === 'scenes' && (
                <div className={styles.subPane}>
                  <span className={styles.subPaneLabel}>Select Scene Environment:</span>
                  <div className={styles.sceneCardsGridCompact}>
                    {SCENE_ENVIRONMENTS.map((scene) => {
                      const isActive = activeSceneId === scene.id;
                      return (
                        <button
                          key={scene.id}
                          type="button"
                          className={`${styles.sceneCardCompact} ${
                            isActive ? styles.sceneCardActive : ''
                          }`}
                          onClick={() => handleSelectScene(scene)}
                          aria-label={`Select ${scene.name} environment`}
                        >
                          <div className={styles.sceneCardTop}>
                            <strong>{scene.name}</strong>
                            {isActive && <CheckCircleIcon size={14} />}
                          </div>
                          <p>{scene.subtitle}</p>
                          <div className={styles.paletteSwatches}>
                            {scene.palette.map((color, idx) => (
                              <span
                                key={idx}
                                className={styles.paletteSwatch}
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.atmosphereGroup} style={{ marginTop: '16px' }}>
                    <label className={styles.atmosphereLabel}>Time of Day:</label>
                    <div className={styles.todButtonGroup}>
                      {TIME_OF_DAY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`${styles.todBtn} ${
                            timeOfDay === opt.id ? styles.todBtnActive : ''
                          }`}
                          onClick={() => setTimeOfDay(opt.id)}
                          aria-label={`Set time of day to ${opt.label}`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.atmosphereGroup} style={{ marginTop: '12px' }}>
                    <label className={styles.atmosphereLabel}>Atmospheric Particles:</label>
                    <div className={styles.weatherButtonGroup}>
                      {WEATHER_EFFECT_OPTIONS.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          className={`${styles.weatherBtn} ${
                            weatherEffect === w.id ? styles.weatherBtnActive : ''
                          }`}
                          onClick={() => setWeatherEffect(w.id)}
                          aria-label={`Set weather effect to ${w.label}`}
                        >
                          <span>{w.label}</span>
                        </button>
                      ))}
                    </div>
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

              {/* Pre-Flight Print Inspection Banner */}
              <div className={styles.preflightBanner}>
                <div className={styles.preflightIcon}>
                  <CheckCircleIcon size={20} />
                </div>
                <div className={styles.preflightInfo}>
                  <strong>Pre-Flight Print Inspection Passed</strong>
                  <span>300 DPI Vector Art • Safe Bleed Margins Verified • FSC Archival Inks</span>
                </div>
              </div>

              {/* Live Proof Summary Box */}
              <div className={styles.proofSummaryBox}>
                <div className={styles.summaryItem}>
                  <span>Hero Star</span>
                  <strong>{childName || 'Adventurer'}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Story Theme</span>
                  <strong>{activeThemeObj.name}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Co-Star Guide</span>
                  <strong>{coStarNames[mascotCoStar] || 'Leo The Lion'}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Page Spreads</span>
                  <strong>{bookSpreads.length} Spreads (10 Pages)</strong>
                </div>
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
        </aside>
      )}

      {/* Right Column: Figma / Photoshop Properties Inspector */}
      {isInspectorOpen && (
        <aside className={styles.propertiesInspector} aria-label="Properties Inspector">
          <div className={styles.inspectorHeader}>
            <div className={styles.inspectorTitleWrap}>
              <h4>
                <SlidersIcon size={14} />
                <span>Inspector</span>
              </h4>
              <span className={styles.inspectorBadgeActive}>
                {activeLayer ? activeLayer.type.replace(/^(mascot_|badge_)/, '') : 'Canvas'}
              </span>
            </div>
            <button
              type="button"
              className={styles.inspectorToggleBtn}
              onClick={() => setIsInspectorOpen(false)}
              title="Collapse Inspector"
              aria-label="Collapse properties inspector"
            >
              <CloseIcon size={14} />
            </button>
          </div>

          <div className={styles.inspectorTabs} role="tablist" aria-label="Inspector Mode">
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === 'properties'}
              className={`${styles.inspectorTabBtn} ${
                inspectorTab === 'properties' ? styles.inspectorTabBtnActive : ''
              }`}
              onClick={() => setInspectorTab('properties')}
            >
              Properties
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={inspectorTab === 'layers'}
              className={`${styles.inspectorTabBtn} ${
                inspectorTab === 'layers' ? styles.inspectorTabBtnActive : ''
              }`}
              onClick={() => setInspectorTab('layers')}
            >
              Layers ({stickers.length})
            </button>
          </div>

          {inspectorTab === 'properties' && (
            <>
              {activeLayer ? (
                <>
                  <div className={styles.inspectorSection}>
                    <div className={styles.inspectorSectionTitle}>
                      <span>Transform</span>
                      <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>PX & DEG</span>
                    </div>
                    <div className={styles.inspectorGrid2}>
                      <div className={styles.propBox}>
                        <label className={styles.propLabel} htmlFor="layer-x-input">
                          X (px)
                        </label>
                        <input
                          id="layer-x-input"
                          type="number"
                          className={styles.propInput}
                          value={Math.round(activeLayer.x ?? 0)}
                          onChange={(e) =>
                            handleUpdateActiveLayer({ x: Number(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className={styles.propBox}>
                        <label className={styles.propLabel} htmlFor="layer-y-input">
                          Y (px)
                        </label>
                        <input
                          id="layer-y-input"
                          type="number"
                          className={styles.propInput}
                          value={Math.round(activeLayer.y ?? 0)}
                          onChange={(e) =>
                            handleUpdateActiveLayer({ y: Number(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.propSliderWrap}>
                      <div className={styles.propSliderHeader}>
                        <span>Scale</span>
                        <span className={styles.propSliderVal}>
                          {Math.round((activeLayer.scale ?? 1) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="2.5"
                        step="0.05"
                        className={styles.propSlider}
                        value={activeLayer.scale ?? 1}
                        onChange={(e) =>
                          handleUpdateActiveLayer({ scale: parseFloat(e.target.value) })
                        }
                        aria-label="Layer scale"
                      />
                    </div>

                    <div className={styles.propSliderWrap}>
                      <div className={styles.propSliderHeader}>
                        <span>Rotation</span>
                        <span className={styles.propSliderVal}>
                          {Math.round(activeLayer.rotation ?? 0)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        className={styles.propSlider}
                        value={activeLayer.rotation ?? 0}
                        onChange={(e) =>
                          handleUpdateActiveLayer({ rotation: parseInt(e.target.value, 10) })
                        }
                        aria-label="Layer rotation"
                      />
                    </div>

                    {activeLayer.type === 'bubble' && (
                      <div className={styles.propBox}>
                        <label className={styles.propLabel} htmlFor="layer-bubble-prose">
                          Speech Prose
                        </label>
                        <input
                          id="layer-bubble-prose"
                          type="text"
                          className={styles.propInput}
                          value={activeLayer.text || ''}
                          onChange={(e) =>
                            handleUpdateActiveLayer({ text: e.target.value })
                          }
                          placeholder="Bubble prose text..."
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.inspectorSection}>
                    <div className={styles.inspectorSectionTitle}>
                      <span>Layer Actions</span>
                    </div>
                    <div className={styles.propButtonGroup}>
                      <button
                        type="button"
                        className={styles.propActionBtn}
                        onClick={() =>
                          handleUpdateActiveLayer({ flipX: !activeLayer.flipX })
                        }
                        title="Flip sticker horizontally"
                        aria-label="Flip sticker horizontally"
                      >
                        <FlipHorizontalIcon size={13} />
                        <span>Flip</span>
                      </button>
                      <button
                        type="button"
                        className={styles.propActionBtn}
                        onClick={handleDuplicateActiveLayer}
                        title="Duplicate layer"
                        aria-label="Duplicate layer"
                      >
                        <LayersIcon size={13} />
                        <span>Clone</span>
                      </button>
                      <button
                        type="button"
                        className={styles.propActionBtn}
                        onClick={() => handleReorderActiveLayer('forward')}
                        title="Bring layer forward"
                        aria-label="Bring layer forward"
                      >
                        <LayerFrontIcon size={13} />
                        <span>Front</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.propActionBtn} ${styles.propDangerBtn}`}
                        onClick={() => handleDeleteActiveLayer(activeLayer.id)}
                        title="Remove sticker from spread"
                        aria-label="Remove sticker from spread"
                      >
                        <TrashIcon size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.propEmptyState}>
                  <LayersIcon size={28} className={styles.propEmptyIcon} />
                  <p>No active layer selected.</p>
                  <small>
                    Stamp assets from the bar or select a template to inspect and transform.
                  </small>
                </div>
              )}
            </>
          )}

          {inspectorTab === 'layers' && (
            <div className={styles.inspectorLayersStack} role="list" aria-label="Canvas Layers">
              {stickers.map((stk, idx) => (
                <div
                  key={stk.id}
                  role="listitem"
                  className={`${styles.inspectorLayerItem} ${
                    activeLayer?.id === stk.id ? styles.inspectorLayerItemActive : ''
                  }`}
                  onClick={() => setSelectedLayerId(stk.id)}
                >
                  <span>#{idx + 1} {stk.type.replace(/^(mascot_|badge_)/, '')}</span>
                  <button
                    type="button"
                    className={styles.layerDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteActiveLayer(stk.id);
                    }}
                    aria-label={`Remove layer ${idx + 1}`}
                  >
                    <TrashIcon size={12} />
                  </button>
                </div>
              ))}
              {stickers.length === 0 && (
                <div className={styles.propEmptyState}>
                  <LayersIcon size={24} className={styles.propEmptyIcon} />
                  <p>No layers on this spread.</p>
                  <small>Stamp assets to build multi-layer illustrations.</small>
                </div>
              )}
            </div>
          )}
        </aside>
      )}
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
                  { id: 'scenes', label: 'Scenes', Icon: ScenePanoramaSvg },
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

                {activeToolTab === 'scenes' && (
                  <div className={styles.fsDrawerSection}>
                    <h4>Scene Environments</h4>
                    <p className={styles.fsDrawerMuted}>Choose procedural world backdrops & lighting.</p>
                    <div className={styles.fsSceneCards}>
                      {SCENE_ENVIRONMENTS.map((scene) => (
                        <button
                          key={scene.id}
                          type="button"
                          className={`${styles.fsSceneCard} ${
                            activeSceneId === scene.id ? styles.fsSceneCardActive : ''
                          }`}
                          onClick={() => handleSelectScene(scene)}
                        >
                          <strong>{scene.name}</strong>
                          <div className={styles.paletteSwatches}>
                            {scene.palette.map((c, i) => (
                              <span
                                key={i}
                                className={styles.paletteSwatch}
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <span className={styles.subPaneLabel}>Time of Day:</span>
                      <div className={styles.todButtonGroup}>
                        {TIME_OF_DAY_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            className={`${styles.todBtn} ${
                              timeOfDay === opt.id ? styles.todBtnActive : ''
                            }`}
                            onClick={() => setTimeOfDay(opt.id)}
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
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
                  isAnimated={isSceneAnimated}
                  config={{
                    childName: childName || 'Adventurer',
                    theme,
                    sceneId: activeSceneId,
                    timeOfDay,
                    weatherEffect,
                    spreadLayout,
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
                isAnimated={isSceneAnimated}
                config={{
                  childName: childName || 'Adventurer',
                  theme,
                  sceneId: activeSceneId,
                  timeOfDay,
                  weatherEffect,
                  spreadLayout,
                  activePage,
                  dedication,
                  chapterProse,
                  avatar,
                  companion,
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
