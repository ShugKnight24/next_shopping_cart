/**
 * Mascots Configuration Registry
 * Decoupled, white-label architecture for brand companions.
 * Allows developers and brands to plug in new mascots, vector artworks, and dialogue scripts.
 */

export const MASCOTS = {
  carty: {
    id: 'carty',
    name: 'Carty The Courier',
    title: 'Your Personal Shopping Concierge',
    theme: {
      primary: '#2563eb',
      secondary: '#06b6d4',
      accent: '#38bdf8',
      background: 'rgba(37, 99, 235, 0.08)',
      glow: 'rgba(56, 189, 248, 0.4)',
    },
    defaultMessage: "Hi there! I'm Carty The Courier. Need help finding the perfect drop today?",
    quotes: {
      home: "Welcome to our flagship shop! Discover curated drops, exclusive sneakers, and audio gear.",
      products: "Explore our collection! Filter by category or tap any product to inspect in 3D.",
      favorites: "Your curated wishlist is looking sharp! Ready to add them to your bag?",
      studio: "Welcome to the Custom Creation Studio! Let's craft personalized books and art.",
      addedToCart: "Awesome pick! Added to your bag. You're closer to Free Express Shipping!",
      freeShipping: "Hooray! You've unlocked Free Express Shipping on this order!",
    },
  },
  leo: {
    id: 'leo',
    name: 'Leo The Story Lion',
    title: 'Kids & Imagination Guide',
    theme: {
      primary: '#d97706',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      background: 'rgba(217, 119, 6, 0.1)',
      glow: 'rgba(251, 191, 36, 0.45)',
    },
    defaultMessage: "Roar! I'm Leo The Story Lion! Ready to build an unforgettable storybook together?",
    quotes: {
      home: "Hey adventurer! Head over to the Custom Studio to make your very own storybook!",
      products: "Check out these cool styles! We can even customize kids' kicks and hoodies in the Studio.",
      favorites: "Your favorite stories and styles are safe here! Ready to personalize one?",
      studio: "Let's make some magic! Step through the wizard above to personalize your custom creation.",
      studioStep1: "Step 1: Who is our hero today? Enter your child's name so they star in the adventure!",
      studioStep2: "Step 2: Choose your adventure theme! Space explorers, dino quests, or magic kingdoms?",
      studioStep3: "Step 3: Write a special dedication note that will be printed inside the book forever!",
      studioStep4: "Step 4: Look at that! Flip through the interactive pages and stamp fun stickers!",
      studioStep5: "Step 5: Your keepsake looks fantastic! Add it to your bag to print and bind it!",
      addedToCart: "Hooray! Your personalized creation is in the bag! It's going to look wonderful in print!",
      freeShipping: "Superstar! Free Express Shipping unlocked! Your custom treasures ship free!",
    },
  },
};

export const DEFAULT_MASCOT_ID = 'carty';
