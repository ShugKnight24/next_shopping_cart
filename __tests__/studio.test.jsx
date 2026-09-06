import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartProvider } from '../context/CartProvider';
import { MascotProvider } from '../context/MascotProvider';
import { ToastProvider } from '../Components/UI/Toast';
import StudioPage from '../pages/studio/index';

// Mock Next.js useRouter
const mockReplace = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/studio',
    query: {},
    replace: mockReplace,
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

// Mock Google Analytics tracking
vi.mock('../analytics/google', () => ({
  trackAddToCart: vi.fn(),
  trackPageView: vi.fn(),
  trackWebVitals: vi.fn(),
}));

// Mock HTML5 Canvas 2D context for jsdom
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    roundRect: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    setLineDash: vi.fn(),
    toDataURL: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
  }));
});

function renderStudio() {
  return render(
    <ToastProvider>
      <CartProvider>
        <MascotProvider>
          <StudioPage />
        </MascotProvider>
      </CartProvider>
    </ToastProvider>
  );
}

describe('Web-to-Print Studio Platform', () => {
  it('renders studio header, trust pillars, and 3 creation modes', () => {
    renderStudio();

    expect(screen.getByText('The Custom Creation Studio')).toBeInTheDocument();
    expect(screen.getByText('Handcrafted & Bound in the USA')).toBeInTheDocument();
    expect(screen.getByText('FSC-Certified Archival Papers')).toBeInTheDocument();

    // 3 Mode Tabs
    expect(
      screen.getByRole('button', { name: /Children's Storybooks/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Framed Art Posters/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Kids' Apparel & Kicks/i })
    ).toBeInTheDocument();
  });

  it('allows personalizing child hero name and stepping through wizard', () => {
    renderStudio();

    // Step 1 input
    const nameInput = screen.getByLabelText(/Child’s First Name:/i);
    expect(nameInput).toHaveValue('Noah');

    fireEvent.change(nameInput, { target: { value: 'Maya' } });
    expect(nameInput).toHaveValue('Maya');

    // Go to Step 2
    const nextBtn = screen.getByRole('button', { name: /Continue to Next Step/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByText('Choose an Adventure Theme')).toBeInTheDocument();

    // Select Sneakerhead Odyssey
    const sneakerTheme = screen.getByRole('button', { name: /Sneakerhead Odyssey/i });
    fireEvent.click(sneakerTheme);

    // Go to Step 3
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    expect(screen.getByText('Special Front Page Dedication')).toBeInTheDocument();

    // Click a preset dedication
    const presetBtn = screen.getByRole('button', {
      name: /"Stay curious and conquer the stars..."/i,
    });
    fireEvent.click(presetBtn);
    expect(screen.getByLabelText(/Dedication Note:/i).value).toContain('Maya');
  });

  it('allows page flipping and stamping decorative stickers in storybook mode', () => {
    renderStudio();

    // Check page indicator
    expect(screen.getByText('Hardcover Front')).toBeInTheDocument();

    // Flip to next page
    const nextSpreadBtn = screen.getByRole('button', { name: /Next book spread/i });
    fireEvent.click(nextSpreadBtn);
    expect(screen.getByText('Page 1 & Dedication')).toBeInTheDocument();

    // Select a sticker
    const starSticker = screen.getByRole('button', {
      name: /Select Golden Star sticker to stamp/i,
    });
    fireEvent.click(starSticker);
    expect(
      screen.getByText(/Tap anywhere on the illustration stage to stamp!/i)
    ).toBeInTheDocument();
  });

  it('allows adding customized storybook to cart in Step 5', () => {
    renderStudio();

    // Directly click step 5 tab
    const step5Tab = screen.getByRole('button', { name: /Print Binding/i });
    fireEvent.click(step5Tab);

    expect(screen.getByText('Step 5 of 5')).toBeInTheDocument();
    const addToCartBtn = screen.getByRole('button', {
      name: /Add Personalized Storybook to Bag/i,
    });
    expect(addToCartBtn).toBeInTheDocument();

    fireEvent.click(addToCartBtn);

    // Local storage should reflect the updated cart
    const savedCartData = JSON.parse(
      localStorage.getItem('shopping_cart.cart') || '{}'
    );
    expect(savedCartData.cart).toBeDefined();
    expect(savedCartData.cart.length).toBeGreaterThan(0);
    expect(savedCartData.cart[0].isCustom).toBe(true);
    expect(savedCartData.cart[0].customAttributes.Hero).toBe('Noah');
  });

  it('allows switching to Framed Poster Studio and adding to cart', () => {
    renderStudio();

    const posterTab = screen.getByRole('button', { name: /Framed Art Posters/i });
    fireEvent.click(posterTab);

    expect(screen.getByText('Design Custom Wall Art Poster')).toBeInTheDocument();
    const headlineInput = screen.getByLabelText(/Poster Headline:/i);
    fireEvent.change(headlineInput, { target: { value: 'MAYA’S ROOM' } });

    const addPosterBtn = screen.getByRole('button', {
      name: /Add Framed Poster to Bag/i,
    });
    fireEvent.click(addPosterBtn);

    const savedCartData = JSON.parse(
      localStorage.getItem('shopping_cart.cart') || '{}'
    );
    expect(savedCartData.cart.some((i) => i.customMode === 'poster')).toBe(true);
  });

  it('allows switching to Kids Apparel Studio and adding to cart', () => {
    renderStudio();

    const apparelTab = screen.getByRole('button', { name: /Kids' Apparel & Kicks/i });
    fireEvent.click(apparelTab);

    expect(screen.getByText("Customize Kids' Apparel & Kicks")).toBeInTheDocument();
    const monogramInput = screen.getByLabelText(/Monogram or Child Name:/i);
    fireEvent.change(monogramInput, { target: { value: 'LEO' } });

    const addApparelBtn = screen.getByRole('button', {
      name: /Add Custom Apparel to Bag/i,
    });
    fireEvent.click(addApparelBtn);

    const savedCartData = JSON.parse(
      localStorage.getItem('shopping_cart.cart') || '{}'
    );
    expect(savedCartData.cart.some((i) => i.customMode === 'apparel')).toBe(true);
  });

  it('supports deep studio customization with prose editing, co-star mascots, and print bleed guides', () => {
    renderStudio();

    // Navigate to Step 4
    const step4Tab = screen.getByRole('button', { name: /Proof & Stamp/i });
    fireEvent.click(step4Tab);

    expect(screen.getByText('Deep Customization Workshop')).toBeInTheDocument();

    // Verify sub-tabs exist
    expect(screen.getByRole('tab', { name: /Prose Editor/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Avatar & Co-Star/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Typography & Bleed/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Stamps & Badges/i })).toBeInTheDocument();

    // Edit Chapter 1 Title in Prose Editor
    const titleInput = screen.getByLabelText(/Chapter 1 Title:/i);
    fireEvent.change(titleInput, { target: { value: 'The Starlight Expedition' } });
    expect(titleInput).toHaveValue('The Starlight Expedition');

    // Switch to Avatar & Co-Star subtab
    const avatarTab = screen.getByRole('tab', { name: /Avatar & Co-Star/i });
    fireEvent.click(avatarTab);
    expect(screen.getByText('Princess Penny')).toBeInTheDocument();
    expect(screen.getByText('Dexter Dino')).toBeInTheDocument();

    // Click Princess Penny co-star
    const pennyCard = screen.getByRole('button', { name: /Princess Penny/i });
    fireEvent.click(pennyCard);

    // Switch to Typography & Bleed subtab
    const typoTab = screen.getByRole('tab', { name: /Typography & Bleed/i });
    fireEvent.click(typoTab);
    expect(screen.getByRole('button', { name: /Storybook Cursive/i })).toBeInTheDocument();

    // Toggle Print Bleed checkbox
    const bleedCheckbox = screen.getByLabelText(
      /Show 3mm Print Bleed Guides & Safe Art Zones/i
    );
    expect(bleedCheckbox).not.toBeChecked();
    fireEvent.click(bleedCheckbox);
    expect(bleedCheckbox).toBeChecked();

    // Check high-res proof export button exists
    expect(
      screen.getByRole('button', { name: /Download print-ready proof/i })
    ).toBeInTheDocument();
  });

  it('empowers custom builders with cute companion stickers, speech bubbles, and categorized asset trays', () => {
    renderStudio();

    // Verify Asset Categories exist
    expect(screen.getByRole('tab', { name: /Cute Companions/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Story Badges/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Props & Wonders/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Classic Stamps/i })).toBeInTheDocument();

    // Switch to Cute Companions Category
    const companionsTab = screen.getByRole('tab', { name: /Cute Companions/i });
    fireEvent.click(companionsTab);

    expect(
      screen.getByRole('button', { name: /Select Luna Cosmic Companion sticker to stamp/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Select Finley Starlight Companion sticker to stamp/i })
    ).toBeInTheDocument();

    // Quick-drop Luna into page center
    const addLunaBtn = screen.getByRole('button', {
      name: /Place Luna Cosmic Companion at center/i,
    });
    fireEvent.click(addLunaBtn);

    // Verify sticker counter in clear button
    expect(screen.getByRole('button', { name: /Clear \(1\)/i })).toBeInTheDocument();

    // Switch to Props & Wonders
    const propsTab = screen.getByRole('tab', { name: /Props & Wonders/i });
    fireEvent.click(propsTab);

    // Customize Speech Bubble text
    const bubbleInput = screen.getByLabelText(/Speech Bubble Text:/i);
    fireEvent.change(bubbleInput, { target: { value: 'Follow the northern stars!' } });
    expect(bubbleInput).toHaveValue('Follow the northern stars!');

    // Add speech bubble to center
    const addBubbleBtn = screen.getByRole('button', {
      name: /Place Story Speech Bubble at center/i,
    });
    fireEvent.click(addBubbleBtn);

    // Now 2 stickers on canvas
    expect(screen.getByRole('button', { name: /Clear \(2\)/i })).toBeInTheDocument();

    // Test Undo Button
    const undoBtn = screen.getByRole('button', { name: /Undo stamp action/i });
    expect(undoBtn).not.toBeDisabled();
    fireEvent.click(undoBtn);
    expect(screen.getByRole('button', { name: /Clear \(1\)/i })).toBeInTheDocument();

    // Test Redo Button
    const redoBtn = screen.getByRole('button', { name: /Redo stamp action/i });
    expect(redoBtn).not.toBeDisabled();
    fireEvent.click(redoBtn);
    expect(screen.getByRole('button', { name: /Clear \(2\)/i })).toBeInTheDocument();
  });

  it('toggles widescreen studio theater mode and manipulates active sticker layer', () => {
    renderStudio();

    // Toggle Widescreen Mode
    const widescreenBtn = screen.getByRole('button', {
      name: /Expand to widescreen studio view/i,
    });
    expect(widescreenBtn).toBeInTheDocument();
    fireEvent.click(widescreenBtn);

    // Verifies button state toggles to compact
    expect(
      screen.getByRole('button', { name: /Switch to standard studio view/i })
    ).toBeInTheDocument();

    // Toggle back to standard
    fireEvent.click(
      screen.getByRole('button', { name: /Switch to standard studio view/i })
    );
    expect(
      screen.getByRole('button', { name: /Expand to widescreen studio view/i })
    ).toBeInTheDocument();

    // Select Golden Star and click canvas to stamp
    const starSticker = screen.getByRole('button', {
      name: /Select Golden Star sticker to stamp/i,
    });
    fireEvent.click(starSticker);

    const canvas = document.querySelector('canvas');
    fireEvent.mouseDown(canvas, { clientX: 200, clientY: 200 });

    // Floating layer transformation toolbar should appear
    expect(screen.getByRole('toolbar', { name: /Stamp layer controls/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Flip stamp horizontally/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Duplicate stamp/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete selected stamp/i })).toBeInTheDocument();

    // Test Flip
    const flipBtn = screen.getByRole('button', { name: /Flip stamp horizontally/i });
    fireEvent.click(flipBtn);

    // Test Clone / Duplicate
    const cloneBtn = screen.getByRole('button', { name: /Duplicate stamp/i });
    fireEvent.click(cloneBtn);
    expect(screen.getByRole('button', { name: /Clear \(2\)/i })).toBeInTheDocument();

    // Test Delete
    const deleteBtn = screen.getByRole('button', { name: /Delete selected stamp/i });
    fireEvent.click(deleteBtn);
    expect(screen.getByRole('button', { name: /Clear \(1\)/i })).toBeInTheDocument();
  });

  it('launches immersive fullscreen custom builder workstation and physical flipbook reader proof', () => {
    renderStudio();

    // 1. Launch Fullscreen Studio Workstation
    const fsBtn = screen.getByRole('button', { name: /Expand to fullscreen studio/i });
    expect(fsBtn).toBeInTheDocument();
    fireEvent.click(fsBtn);

    // Verify fullscreen modal is active
    const fsModal = screen.getByRole('dialog', {
      name: /Immersive Storybook Builder Studio/i,
    });
    expect(fsModal).toBeInTheDocument();

    // Verify fullscreen controls
    expect(screen.getByLabelText(/Book child hero name in fullscreen/i)).toHaveValue('Noah');
    expect(screen.getByRole('button', { name: /Undo canvas change in fullscreen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Redo canvas change in fullscreen/i })).toBeInTheDocument();

    // 2. Open Flipbook Reader Proof from fullscreen
    const readerBtn = screen.getByRole('button', {
      name: /Preview physical book in fullscreen/i,
    });
    fireEvent.click(readerBtn);

    const readerModal = screen.getByRole('dialog', {
      name: /Physical Flipbook Preview Reader/i,
    });
    expect(readerModal).toBeInTheDocument();
    expect(screen.getByText(/Spread 1 of 5/i)).toBeInTheDocument();

    // Close reader proof
    const closeReaderBtn = screen.getByRole('button', {
      name: /Close flipbook reader/i,
    });
    fireEvent.click(closeReaderBtn);
    expect(
      screen.queryByRole('dialog', { name: /Physical Flipbook Preview Reader/i })
    ).not.toBeInTheDocument();

    // Exit Fullscreen Mode
    const exitFsBtn = screen.getByRole('button', {
      name: /Exit fullscreen studio/i,
    });
    fireEvent.click(exitFsBtn);
    expect(
      screen.queryByRole('dialog', { name: /Immersive Storybook Builder Studio/i })
    ).not.toBeInTheDocument();
  });

  it('supports applying story spread templates, resetting to blank canvas, and adding story reel pages', () => {
    renderStudio();

    // Navigate to Step 4
    const step4Tab = screen.getByRole('button', { name: /Proof & Stamp/i });
    fireEvent.click(step4Tab);

    // Switch to Templates subtab
    const templatesTab = screen.getByRole('tab', { name: /Templates/i });
    fireEvent.click(templatesTab);

    // Apply Cosmic Starlight Quest template
    const spaceTemplateCard = screen.getByRole('button', {
      name: /Cosmic Starlight Quest/i,
    });
    fireEvent.click(spaceTemplateCard);

    // Verify template stamps populated (4 stamps in space template)
    expect(screen.getByRole('button', { name: /Clear \(4\)/i })).toBeInTheDocument();

    // Apply Blank Canvas (Clean Slate)
    const blankCanvasCard = screen.getByRole('button', {
      name: /Blank Canvas \(Clean Slate\)/i,
    });
    fireEvent.click(blankCanvasCard);

    // Verify canvas cleared of stamps
    expect(screen.queryByRole('button', { name: /Clear \(/i })).not.toBeInTheDocument();

    // Add new story spread in bottom reel
    const addSpreadBtn = screen.getByRole('button', {
      name: /Add new story spread/i,
    });
    fireEvent.click(addSpreadBtn);

    // Should now have 6 spreads
    expect(screen.getByText('Book Page Spreads (6)')).toBeInTheDocument();
  });

  it('tests poster studio multi-size formats, orientation toggling, paper options, and gallery proof modal', () => {
    renderStudio();

    const posterTab = screen.getByRole('button', { name: /Framed Art Posters/i });
    fireEvent.click(posterTab);

    // Verify sizes exist
    expect(screen.getByRole('button', { name: /12" × 18" Gallery Print/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /18" × 24" Classic Exhibition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /24" × 36" Statement Archival/i })).toBeInTheDocument();

    // Select 24x36 Statement Archival
    const grandSizeBtn = screen.getByRole('button', { name: /24" × 36" Statement Archival/i });
    fireEvent.click(grandSizeBtn);

    // Switch to Horizontal Landscape orientation
    const landscapeBtn = screen.getByRole('button', { name: /Horizontal Landscape/i });
    fireEvent.click(landscapeBtn);

    // Select Textured Stretched Canvas paper
    const canvasPaperBtn = screen.getByRole('button', { name: /Textured Stretched Canvas/i });
    fireEvent.click(canvasPaperBtn);

    // Open Gallery Proof Modal
    const proofBtn = screen.getByRole('button', { name: /View Gallery Proof/i });
    fireEvent.click(proofBtn);

    expect(screen.getByRole('dialog', { name: /Gallery Proof Preview Modal/i })).toBeInTheDocument();
    expect(screen.getByText('Archival Gallery Proof Verification')).toBeInTheDocument();

    // Close proof modal
    const closeProofBtn = screen.getByRole('button', { name: /Confirm Proof & Continue/i });
    fireEvent.click(closeProofBtn);
    expect(screen.queryByRole('dialog', { name: /Gallery Proof Preview Modal/i })).not.toBeInTheDocument();
  });

  it('tests apparel studio garments, youth sizing pills, placement zones, and sizing guide modal', () => {
    renderStudio();

    const apparelTab = screen.getByRole('button', { name: /Kids' Apparel & Kicks/i });
    fireEvent.click(apparelTab);

    // Verify garments
    expect(screen.getByRole('button', { name: /Organic Kids' Hoodie/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kids' Heavyweight Graphic Tee/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kids' Varsity Bomber Jacket/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Custom Kids' Canvas High-Tops/i })).toBeInTheDocument();

    // Select Varsity Bomber Jacket
    const jacketBtn = screen.getByRole('button', { name: /Kids' Varsity Bomber Jacket/i });
    fireEvent.click(jacketBtn);

    // Select Youth L size
    const sizeLBtn = screen.getByRole('button', { name: /Youth L/i });
    fireEvent.click(sizeLBtn);

    // Select Left Pocket placement
    const pocketBtn = screen.getByRole('button', { name: /Left Pocket/i });
    fireEvent.click(pocketBtn);

    // Open Sizing Chart modal
    const sizeChartBtn = screen.getByRole('button', { name: /View Sizing Chart/i });
    fireEvent.click(sizeChartBtn);

    expect(screen.getByRole('dialog', { name: /Youth Apparel Sizing Guide/i })).toBeInTheDocument();
    expect(screen.getByText('Youth Garment Sizing & Fit Guide')).toBeInTheDocument();

    // Close sizing modal
    const closeModalBtn = screen.getByRole('button', { name: /Got It, Return to Studio/i });
    fireEvent.click(closeModalBtn);
    expect(screen.queryByRole('dialog', { name: /Youth Apparel Sizing Guide/i })).not.toBeInTheDocument();
  });

  it('allows customizing child hero avatar hairstyles and trusty companion pet in character creator', () => {
    renderStudio();

    // Step 4
    const step4Tab = screen.getByRole('button', { name: /Proof & Stamp/i });
    fireEvent.click(step4Tab);

    // Avatar & Co-Star Tab
    const avatarTab = screen.getByRole('tab', { name: /Avatar & Co-Star/i });
    fireEvent.click(avatarTab);

    // Switch to Hero Avatar tab inside CharacterCreator
    const heroTab = screen.getByRole('tab', { name: /Star Hero \(Child \/ You\)/i });
    fireEvent.click(heroTab);

    // Select Fluffy Curls hair style
    const curlsBtn = screen.getByRole('button', { name: /Fluffy Curls/i });
    fireEvent.click(curlsBtn);

    // Select Round Specs accessory
    const glassesBtn = screen.getByRole('button', { name: /Round Specs/i });
    fireEvent.click(glassesBtn);

    // Switch back to Trusty Companion tab
    const companionTab = screen.getByRole('tab', { name: /Trusty Companion \(Pet \/ Co-Star\)/i });
    fireEvent.click(companionTab);

    // Select Finley Fox companion
    const finleyBtn = screen.getByRole('button', { name: /Finley Fox/i });
    fireEvent.click(finleyBtn);

    // Enter custom pet name
    const petNameInput = screen.getByLabelText(/Companion Pet Name:/i);
    fireEvent.change(petNameInput, { target: { value: 'Barnaby' } });
    expect(petNameInput).toHaveValue('Barnaby');
  });
});

