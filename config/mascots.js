/**
 * Mascots Configuration Registry
 * Decoupled, white-label architecture for brand companions.
 * Allows developers and brands to plug in new mascots, vector artworks, and dialogue scripts.
 */

export const MASCOTS = {
  // --- E-Commerce Storefront Realm ---
  carty: {
    id: 'carty',
    realm: 'shop',
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
  sparky: {
    id: 'sparky',
    realm: 'shop',
    name: 'Sparky The Sneaker Hound',
    title: 'Streetwear & Hype Drop Specialist',
    theme: {
      primary: '#dc2626',
      secondary: '#f97316',
      accent: '#facc15',
      background: 'rgba(220, 38, 38, 0.08)',
      glow: 'rgba(250, 204, 21, 0.4)',
    },
    defaultMessage: "Yo! I'm Sparky The Sneaker Hound! Ready to cop the freshest heat in the vault?",
    quotes: {
      home: "Fresh drops just landed! Tap that 3D preview on the sneakers to check the stitching up close.",
      products: "These colorways are legendary! Filter for limited releases before they sell out.",
      favorites: "Top tier grails on your wishlist! Don't sleep on these, sizes go quick!",
      studio: "Did you know you can customize your own kicks in the Studio? Check it out!",
      addedToCart: "Straight heat! Added to your bag. Looking clean!",
      freeShipping: "Boom! Free Express Shipping unlocked! Your grails ship fast on us!",
    },
  },

  // --- Kids & Web-to-Print Platform Realm ---
  leo: {
    id: 'leo',
    realm: 'kids',
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
  penny: {
    id: 'penny',
    realm: 'kids',
    name: 'Princess Penny',
    title: 'Enchanted Kingdoms & Fairytales Guide',
    theme: {
      primary: '#db2777',
      secondary: '#f472b6',
      accent: '#fbcfe8',
      background: 'rgba(219, 39, 119, 0.08)',
      glow: 'rgba(244, 114, 182, 0.4)',
    },
    defaultMessage: "Sparkle and shine! I'm Princess Penny! Let's weave a magical royal storybook!",
    quotes: {
      home: "Welcome to our fairytale boutique! Head to the Studio to write your own royal adventure.",
      products: "A royal collection of wonderful gifts! You can personalize crowns and art in the Studio.",
      favorites: "Your enchanted favorites are gathered here, safe in the royal treasury!",
      studio: "Your royal story begins now! Personalize the name and sprinkle starlight onto every page.",
      studioStep1: "Step 1: Who is the royal star? Enter their name to be crowned in our story!",
      studioStep2: "Step 2: Choose your adventure! An enchanted palace, secret forest, or cloud castle?",
      studioStep3: "Step 3: Pen a royal decree dedication from your loving heart!",
      studioStep4: "Step 4: Behold the golden pages! Stamp royal crowns and sparkling gems!",
      studioStep5: "Step 5: The royal keepsake is ready to be printed in gold foil and delivered!",
      addedToCart: "Magical! Your custom heirloom is in your royal bag!",
      freeShipping: "Royal celebration! Free Express Carriage Shipping unlocked for you!",
    },
  },
  dexter: {
    id: 'dexter',
    realm: 'kids',
    name: 'Dexter The Dino Explorer',
    title: 'Prehistoric & Space Adventure Guide',
    theme: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#6ee7b7',
      background: 'rgba(5, 150, 105, 0.08)',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
    defaultMessage: "Chomp chomp! I'm Dexter The Dino Explorer! Ready to dig up a thrilling adventure?",
    quotes: {
      home: "Roar! Grab your explorer hat and let's craft an awesome dinosaur storybook in the Studio!",
      products: "Look at all these cool gadgets and sneakers! Perfect for wild expeditions.",
      favorites: "All your expedition gear is cataloged right here!",
      studio: "Dino time! Let's build a prehistoric quest starring your favorite adventurer!",
      studioStep1: "Step 1: What is the chief explorer's name? They're leading the dinosaur expedition!",
      studioStep2: "Step 2: Choose your quest! Volcano valley, fossil treasure hunt, or time machine?",
      studioStep3: "Step 3: Write an explorer's field note dedication for page 1!",
      studioStep4: "Step 4: Look at those giant footprints! Stamp rockets, stars, and dino badges!",
      studioStep5: "Step 5: Mission accomplished! Let's print your expedition book!",
      addedToCart: "Dino-mite! Your personalized adventure is safely packed in your bag!",
      freeShipping: "T-Rex roar! Free Express Shipping unlocked on this order!",
    },
  },
};

export const DEFAULT_SHOP_MASCOT_ID = 'carty';
export const DEFAULT_KIDS_MASCOT_ID = 'leo';
export const DEFAULT_MASCOT_ID = DEFAULT_SHOP_MASCOT_ID;

