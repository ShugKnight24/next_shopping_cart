/**
 * Mascots Configuration Registry
 * Decoupled, white-label architecture for brand companions.
 * Allows developers and brands to plug in new mascots, vector artworks, and dialogue scripts.
 */

export const MASCOTS = {
  // --- E-Commerce Storefront Realm ---
  luna: {
    id: 'luna',
    realm: 'shop',
    name: 'Luna The Cosmic Shepherd',
    title: 'Guardian of the Stars & Flagship Concierge',
    theme: {
      primary: '#1e293b',
      secondary: '#38bdf8',
      accent: '#fbbf24',
      background: 'rgba(30, 41, 59, 0.08)',
      glow: 'rgba(56, 189, 248, 0.45)',
    },
    defaultMessage:
      "Woof! I'm Luna The Cosmic Shepherd. Watching over your cosmic shopping voyage today!",
    quotes: {
      home: "Welcome home! I've scouted the finest curated drops and star-tier essentials across the galaxy for you.",
      products:
        'My keen shepherd senses detect incredible craftsmanship here! Tap any drop for a 3D inspection.',
      favorites:
        'Your constellation of saved favorites is shining bright! Ready to bring them home?',
      studio:
        'The Studio is breathtaking! You can customize timeless heirlooms, books, and kicks right here.',
      addedToCart:
        "Tail wag! I've secured that treasure safely in your bag. Free Express Shipping is on the horizon!",
      freeShipping:
        "Cosmic celebration! You've unlocked Free Express Shipping! Our star cruiser is fueled and ready!",
      treatReaction:
        'Luna wags her curled tail with immense joy and does a graceful zero-gravity spin!',
      secretDrop:
        'Luna sniffs the cosmos and unlocks a secret perk for you: use code FIRST15 at checkout!',
      highPaw:
        "Luna lifts her suited paw for a gentle, loving astronaut high-five. You're family here!",
    },
    interactiveActions: [
      {
        id: 'treat',
        label: 'Give Astronaut Treat',
        reply:
          'Luna wags her tail happily and does a zero-gravity spin in her spacesuit!',
      },
      {
        id: 'secretDrop',
        label: 'Sniff Secret Perk',
        reply:
          'Luna discovered a cosmic perk! Use code FIRST15 at checkout for 15% off!',
      },
      {
        id: 'highPaw',
        label: 'Cosmic High-Paw',
        reply:
          'Luna touches her suited paw to yours with a warm, soulful gaze. Good journey, friend!',
      },
    ],
  },
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
    defaultMessage:
      "Hi there! I'm Carty The Courier. Need help finding the perfect drop today?",
    quotes: {
      home: 'Welcome to our flagship shop! Discover curated drops, exclusive sneakers, and audio gear.',
      products:
        'Explore our collection! Filter by category or tap any product to inspect in 3D.',
      favorites:
        'Your curated wishlist is looking sharp! Ready to add them to your bag?',
      studio:
        "Welcome to the Custom Creation Studio! Let's craft personalized books and art.",
      addedToCart:
        "Awesome pick! Added to your bag. You're closer to Free Express Shipping!",
      freeShipping:
        "Hooray! You've unlocked Free Express Shipping on this order!",
    },
    interactiveActions: [
      {
        id: 'scan',
        label: 'Scan For Deals',
        reply:
          'Beep boop! Sensors detect 15% off first orders with code FIRST15!',
      },
      {
        id: 'joke',
        label: 'Tell Robot Joke',
        reply:
          'Why did the robot go to the sneaker vault? To upgrade its reboot soles!',
      },
      {
        id: 'shipping',
        label: 'Check Express Status',
        reply:
          'All orders over $150 qualify for 100% Free Express Overnight Shipping!',
      },
    ],
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
    defaultMessage:
      "Yo! I'm Sparky The Sneaker Hound! Ready to cop the freshest heat in the vault?",
    quotes: {
      home: 'Fresh drops just landed! Tap that 3D preview on the sneakers to check the stitching up close.',
      products:
        'These colorways are legendary! Filter for limited releases before they sell out.',
      favorites:
        "Top tier grails on your wishlist! Don't sleep on these, sizes go quick!",
      studio:
        'Did you know you can customize your own kicks in the Studio? Check it out!',
      addedToCart: 'Straight heat! Added to your bag. Looking clean!',
      freeShipping:
        'Boom! Free Express Shipping unlocked! Your grails ship fast on us!',
    },
    interactiveActions: [
      {
        id: 'hype',
        label: 'Hype Check',
        reply:
          '100% Certified Grail status! Clean colorways, archival build quality!',
      },
      {
        id: 'bark',
        label: 'Hound Howl',
        reply:
          'Awoo! That drop is too fresh to sleep on, cop before sizes vanish!',
      },
    ],
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
    defaultMessage:
      "Roar! I'm Leo The Story Lion! Ready to build an unforgettable storybook together?",
    quotes: {
      home: 'Hey adventurer! Head over to the Custom Studio to make your very own storybook!',
      products:
        "Check out these cool styles! We can even customize kids' kicks and hoodies in the Studio.",
      favorites:
        'Your favorite stories and styles are safe here! Ready to personalize one?',
      studio:
        "Let's make some magic! Step through the wizard above to personalize your custom creation.",
      studioStep1:
        "Step 1: Who is our hero today? Enter your child's name so they star in the adventure!",
      studioStep2:
        'Step 2: Choose your adventure theme! Space explorers, dino quests, or magic kingdoms?',
      studioStep3:
        'Step 3: Write a special dedication note that will be printed inside the book forever!',
      studioStep4:
        'Step 4: Look at that! Flip through the interactive pages and stamp fun stickers!',
      studioStep5:
        'Step 5: Your keepsake looks fantastic! Add it to your bag to print and bind it!',
      addedToCart:
        "Hooray! Your personalized creation is in the bag! It's going to look wonderful in print!",
      freeShipping:
        'Superstar! Free Express Shipping unlocked! Your custom treasures ship free!',
    },
    interactiveActions: [
      {
        id: 'roar',
        label: 'Roar of Courage',
        reply:
          "ROAARRR! You have the heart of a brave adventurer! Let's write history!",
      },
      {
        id: 'idea',
        label: 'Story Spark',
        reply:
          'What if our hero finds an ancient glowing compass buried under the stars?',
      },
    ],
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
    defaultMessage:
      "Sparkle and shine! I'm Princess Penny! Let's weave a magical royal storybook!",
    quotes: {
      home: 'Welcome to our fairytale boutique! Head to the Studio to write your own royal adventure.',
      products:
        'A royal collection of wonderful gifts! You can personalize crowns and art in the Studio.',
      favorites:
        'Your enchanted favorites are gathered here, safe in the royal treasury!',
      studio:
        'Your royal story begins now! Personalize the name and sprinkle starlight onto every page.',
      studioStep1:
        'Step 1: Who is the royal star? Enter their name to be crowned in our story!',
      studioStep2:
        'Step 2: Choose your adventure! An enchanted palace, secret forest, or cloud castle?',
      studioStep3:
        'Step 3: Pen a royal decree dedication from your loving heart!',
      studioStep4:
        'Step 4: Behold the golden pages! Stamp royal crowns and sparkling gems!',
      studioStep5:
        'Step 5: The royal keepsake is ready to be printed in gold foil and delivered!',
      addedToCart: 'Magical! Your custom heirloom is in your royal bag!',
      freeShipping:
        'Royal celebration! Free Express Carriage Shipping unlocked for you!',
    },
    interactiveActions: [
      {
        id: 'spell',
        label: 'Sprinkle Starlight',
        reply:
          'Tink! Golden starlight swirls around your story with a magical blessing!',
      },
      {
        id: 'crown',
        label: 'Royal Decree',
        reply:
          'By royal proclamation, you are hereby crowned the Master of Imagination!',
      },
    ],
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
    defaultMessage:
      "Chomp chomp! I'm Dexter The Dino Explorer! Ready to dig up a thrilling adventure?",
    quotes: {
      home: "Roar! Grab your explorer hat and let's craft an awesome dinosaur storybook in the Studio!",
      products:
        'Look at all these cool gadgets and sneakers! Perfect for wild expeditions.',
      favorites: 'All your expedition gear is cataloged right here!',
      studio:
        "Dino time! Let's build a prehistoric quest starring your favorite adventurer!",
      studioStep1:
        "Step 1: What is the chief explorer's name? They're leading the dinosaur expedition!",
      studioStep2:
        'Step 2: Choose your quest! Volcano valley, fossil treasure hunt, or time machine?',
      studioStep3:
        "Step 3: Write an explorer's field note dedication for page 1!",
      studioStep4:
        'Step 4: Look at those giant footprints! Stamp rockets, stars, and dino badges!',
      studioStep5:
        "Step 5: Mission accomplished! Let's print your expedition book!",
      addedToCart:
        'Dino-mite! Your personalized adventure is safely packed in your bag!',
      freeShipping: 'T-Rex roar! Free Express Shipping unlocked on this order!',
    },
    interactiveActions: [
      {
        id: 'stomp',
        label: 'Dino Stomp',
        reply:
          'STOMP STOMP! The ground shakes as Dexter discovers a golden fossil!',
      },
      {
        id: 'fact',
        label: 'Dino Fact',
        reply:
          'Did you know? Some dinosaurs had feathers as bright as modern parakeets!',
      },
    ],
  },
  finley: {
    id: 'finley',
    realm: 'kids',
    name: 'Finley The Starlight Fox',
    title: 'The Little Prince Celestial Fox',
    theme: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#38bdf8',
      background: 'rgba(234, 88, 12, 0.08)',
      glow: 'rgba(56, 189, 248, 0.45)',
    },
    defaultMessage:
      "Greetings, traveler! I'm Finley The Starlight Fox. It is only with the heart that one can see rightly!",
    quotes: {
      home: 'Welcome under the stars! You are unique in all the universe, and your stories matter deeply.',
      products:
        'Look beyond the obvious—what makes a gift truly precious is the thought and love you invest in it.',
      favorites:
        'The things you hold dear in your heart are gathered safely here beneath the constellation.',
      studio:
        'The Studio is our quiet oasis. Here, we can tame words and colors into a story that lasts forever.',
      studioStep1:
        "Step 1: Tell me the name of your little prince or princess so we may tame them as our story's heart.",
      studioStep2:
        'Step 2: Choose our voyage! Floating across asteroid B-612, a desert sunset, or a field of roses?',
      studioStep3:
        'Step 3: Write your heartfelt dedication. Remember: what is essential is invisible to the eye.',
      studioStep4:
        'Step 4: Behold the constellations on every page! Stamp starlight, roses, and little foxes.',
      studioStep5:
        'Step 5: You have tamed this book with your time and care. It is now ready to take flight!',
      addedToCart:
        'A true friendship is formed! Your personalized keepsake has been placed in your bag.',
      freeShipping:
        'Listen! The stars are laughing like five hundred million little bells—Free Express Shipping is unlocked!',
    },
    interactiveActions: [
      {
        id: 'secret',
        label: 'Starlight Secret',
        reply:
          "Finley whispers: 'Here is my secret, very simple: It is only with the heart that one can see rightly.'",
      },
      {
        id: 'rose',
        label: 'Celestial Rose',
        reply:
          "Finley gazes at the stars: 'It is the time you have devoted to your story that makes it so important.'",
      },
      {
        id: 'tame',
        label: 'Tame Finley',
        reply:
          "Finley curls his bushy white-tipped tail warmly against your boots. 'Now we shall need each other in all the cosmos!'",
      },
    ],
  },
};

export const DEFAULT_SHOP_MASCOT_ID = 'luna';
export const DEFAULT_KIDS_MASCOT_ID = 'leo';
export const DEFAULT_MASCOT_ID = DEFAULT_SHOP_MASCOT_ID;
