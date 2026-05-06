/**
 * Product Category Taxonomy
 *
 * Multi-level categorization system for curating catalogs by buyer type.
 * Products can have multiple overlapping categories.
 *
 * Buyer type mapping:
 * - State Parks / Nature Centers: wildlife.*, nature.*, plant.*, location.*
 * - Garden Centers: plant.*, wildlife.pollinators, nature.flowers
 * - Science Museums: science.*, space.*
 * - Natural History Museums: science.*, wildlife.*, nature.*, paleontology
 * - Aquariums: wildlife.marine, science.marine_biology, nature.water
 * - Space Museums: space.*, science.astronomy
 */

export const PRODUCT_TAXONOMY = {
  science: {
    astronomy: {
      keywords: ['solar system', 'planet', 'moon', 'star', 'galaxy', 'constellation', 'nebula', 'jupiter', 'mars', 'saturn', 'venus', 'mercury', 'uranus', 'neptune'],
      description: 'Celestial bodies, solar system, planets, stars'
    },
    biology: {
      keywords: ['anatomy', 'anatomical', 'cell', 'DNA', 'heart', 'skeleton', 'skull', 'bone', 'organ'],
      description: 'Human anatomy, cellular biology, life sciences'
    },
    marine_biology: {
      keywords: ['whale', 'shark', 'dolphin', 'octopus', 'jellyfish', 'coral', 'sea lion', 'seal', 'marine', 'ocean life', 'kelp forest'],
      description: 'Marine animals, ocean ecosystems, sea life'
    },
    geology: {
      keywords: ['volcano', 'volcanic', 'erupting', 'crystal', 'rock', 'mineral', 'glacier', 'ice', 'cave', 'canyon', 'desert', 'sand dune', 'arctic glacier'],
      description: 'Earth science, geological formations, rocks and minerals'
    },
    paleontology: {
      keywords: ['dinosaur', 'fossil', 'prehistoric', 'mammoth', 'wooly mammoth', 'trilobite', 't-rex', 'pterodactyl'],
      description: 'Dinosaurs, fossils, prehistoric life'
    },
    physics: {
      keywords: ['aurora', 'northern lights', 'borealis', 'magnetism', 'light', 'prism', 'rainbow'],
      description: 'Physics phenomena, light, magnetism, natural forces'
    }
  },

  space: {
    planets: {
      keywords: ['jupiter', 'mars', 'saturn', 'earth', 'venus', 'mercury', 'uranus', 'neptune', 'pluto'],
      description: 'Individual planets of the solar system'
    },
    celestial_bodies: {
      keywords: ['moon', 'full moon', 'crescent moon', 'cratered moon', 'sun', 'solar system', 'comet', 'asteroid', 'meteor'],
      description: 'Moons, sun, asteroids, comets'
    },
    phenomena: {
      keywords: ['aurora', 'eclipse', 'northern lights', 'borealis', 'solar eclipse', 'lunar eclipse', 'meteor shower'],
      description: 'Space and atmospheric phenomena'
    }
  },

  nature: {
    landscapes: {
      keywords: ['mountain', 'mountain range', 'valley', 'desert', 'forest', 'glacier', 'canyon', 'cliff', 'vista', 'peak', 'alpine'],
      description: 'Natural landscapes and terrain features'
    },
    water: {
      keywords: ['waterfall', 'ocean', 'river', 'stream', 'creek', 'lake', 'pond', 'beach', 'coastal', 'cascade', 'rapids', 'quiet creek', 'snowy creek'],
      description: 'Water features, aquatic environments'
    },
    weather: {
      keywords: ['storm', 'rainbow', 'sunset', 'sunrise', 'aurora', 'clouds', 'lightning', 'rain'],
      description: 'Weather patterns and atmospheric conditions'
    },
    seasons: {
      keywords: ['autumn', 'fall', 'winter', 'spring', 'summer', 'snowy', 'frost'],
      description: 'Seasonal themes and imagery'
    }
  },

  plant: {
    flowers: {
      keywords: ['rose', 'sunflower', 'lotus', 'dogwood', 'iris', 'lily', 'daisy', 'orchid', 'wildflower', 'blossom', 'bloom', 'marigold', 'lupine', 'blue iris'],
      description: 'Flowering plants and blossoms'
    },
    trees: {
      keywords: ['oak', 'pine', 'maple', 'willow', 'tree', 'forest', 'woodland', 'mighty oak'],
      description: 'Trees and woody plants'
    },
    garden: {
      keywords: ['mushroom', 'fern', 'vine', 'moss', 'fungus', 'toadstool', 'garden'],
      description: 'Garden plants, mushrooms, ground cover'
    }
  },

  wildlife: {
    birds: {
      keywords: ['eagle', 'bald eagle', 'cardinal', 'bluebird', 'hummingbird', 'owl', 'barn owl', 'forest owl', 'snowy owl', 'penguin', 'emperor penguin', 'raven', 'crow', 'hawk', 'parrot', 'parakeet', 'blue parakeet', 'chicken', 'rooster', 'blue heron', 'heron'],
      description: 'Birds of all types - wild and domestic'
    },
    mammals: {
      keywords: ['bear', 'polar bear', 'grizzly bear', 'black bear', 'borealis polar bear', 'fox', 'forest fox', 'deer', 'elk', 'coastal elk', 'wolf', 'raccoon', 'woodland raccoon', 'skunk', 'forest skunk', 'rabbit', 'squirrel', 'moose', 'horse', 'reindeer'],
      description: 'Land mammals - wild and domesticated'
    },
    marine: {
      keywords: ['whale', 'humpback whale', 'breaching whale', 'shark', 'great white shark', 'dolphin', 'playful dolphins', 'octopus', 'jellyfish', 'seal', 'sea lion', 'kelp forest sea lions', 'otter', 'seahorse', 'sea dragon'],
      description: 'Marine mammals and sea creatures'
    },
    insects: {
      keywords: ['butterfly', 'butterflies', 'monarch butterfly', 'monarch butterflies', 'bee', 'bumblebee', 'dragonfly', 'ladybug', 'firefly', 'beetle'],
      description: 'Insects and arthropods'
    },
    reptiles: {
      keywords: ['turtle', 'tortoise', 'frog', 'toad', 'salamander', 'lizard', 'gecko', 'snake', 'dragon', 'sea dragon'],
      description: 'Reptiles, amphibians, mythical reptiles'
    },
    prehistoric: {
      keywords: ['dinosaur', 'roaring dinosaur', 'mammoth', 'wooly mammoth', 'prehistoric', 't-rex', 'pterodactyl'],
      description: 'Prehistoric animals'
    },
    pollinators: {
      keywords: ['bee', 'bumblebee', 'butterfly', 'butterflies', 'monarch butterfly', 'monarch butterflies', 'hummingbird', 'moth'],
      description: 'Pollinating insects and birds (important for garden centers)'
    }
  },

  pet: {
    dogs: {
      keywords: ['corgi', 'german shepherd', 'shepherd', 'beagle', 'terrier', 'jack russell', 'basenji', 'dachshund', 'australian shepherd', 'cattle dog', 'wolfhound', 'irish wolfhound'],
      description: 'Dog breeds'
    },
    cats: {
      keywords: ['cat', 'kitten', 'feline', 'sleepy cat'],
      description: 'Cats and felines'
    },
    other: {
      keywords: ['hamster', 'rabbit', 'guinea pig', 'koi fish', 'goldfish', 'pet bird', 'parakeet'],
      description: 'Other common pets (excluding wild fish)'
    }
  },

  location: {
    specific: {
      national_parks: {
        keywords: ['smoky mountains', 'smokies', 'grand canyon', 'yellowstone', 'yosemite', 'arches', 'zion', 'glacier national park', 'acadia', 'olympic'],
        description: 'Specific U.S. National Parks'
      },
      landmarks: {
        keywords: ['taj mahal', 'colosseum', 'acropolis', 'pueblo bonito', 'chaco', 'eiffel tower', 'statue of liberty', 'golden gate'],
        description: 'Famous landmarks and monuments'
      },
      regions: {
        keywords: ['appalachian', 'rockies', 'cascades', 'sierra', 'coastal', 'arctic', 'desert southwest'],
        description: 'Geographic regions'
      }
    },
    general: {
      geographic: {
        keywords: ['mountain range', 'mountains', 'desert', 'ocean', 'forest', 'woodland', 'glacier', 'canyon', 'valley', 'beach', 'coastal', 'alpine', 'polar', 'arctic'],
        description: 'General geographic features (not specific places)'
      }
    }
  },

  cultural: {
    spiritual: {
      keywords: ['mandala', 'om', 'yin yang', 'cross', 'celtic', 'trinity', 'angel', 'buddha', 'zen'],
      description: 'Spiritual and religious symbols'
    },
    historical: {
      keywords: ['viking', 'celtic', 'aztec', 'mayan', 'egyptian', 'medieval', 'native', 'tribal'],
      description: 'Historical cultures and civilizations'
    },
    holiday: {
      keywords: ['christmas', 'halloween', 'easter', 'thanksgiving', 'valentines', 'santa', 'pumpkin', 'nativity'],
      description: 'Holiday and seasonal themes'
    }
  },

  abstract: {
    geometric: {
      keywords: ['geometric', 'triangle', 'circle', 'square', 'hexagon', 'polygon', 'pattern'],
      description: 'Geometric patterns and shapes'
    },
    mandala: {
      keywords: ['mandala', 'kaleidoscope', 'symmetry', 'circular pattern'],
      description: 'Mandala and symmetrical designs'
    },
    artistic: {
      keywords: ['art nouveau', 'stained glass', 'abstract', 'modern', 'contemporary'],
      description: 'Artistic styles and movements'
    }
  },

  fantasy: {
    mythical: {
      keywords: ['dragon', 'unicorn', 'phoenix', 'griffin', 'pegasus', 'mermaid', 'fairy'],
      description: 'Mythical creatures and fantasy beings'
    },
    magic: {
      keywords: ['wizard', 'witch', 'spell', 'potion', 'magic', 'enchanted'],
      description: 'Magic and wizardry themes'
    }
  }
} as const;

/**
 * Buyer type category recommendations
 * Maps buyer types to relevant category paths
 */
export const BUYER_TYPE_CATEGORIES = {
  state_park: [
    'wildlife.birds',
    'wildlife.mammals',
    'wildlife.reptiles',
    'nature.landscapes',
    'nature.water',
    'plant.trees',
    'plant.flowers',
    'location.specific.national_parks',
    'location.general.geographic'
  ],
  nature_center: [
    'wildlife.birds',
    'wildlife.mammals',
    'wildlife.insects',
    'wildlife.pollinators',
    'nature.landscapes',
    'nature.water',
    'plant.flowers',
    'plant.trees',
    'plant.garden'
  ],
  garden_center: [
    'plant.flowers',
    'plant.garden',
    'plant.trees',
    'wildlife.pollinators',
    'wildlife.insects',
    'wildlife.birds'
  ],
  science_museum: [
    'science.astronomy',
    'science.biology',
    'science.marine_biology',
    'science.geology',
    'science.paleontology',
    'science.physics',
    'space.planets',
    'space.celestial_bodies',
    'space.phenomena',
    'wildlife.prehistoric'
  ],
  natural_history_museum: [
    'science.paleontology',
    'science.geology',
    'science.biology',
    'science.marine_biology',
    'wildlife.birds',
    'wildlife.mammals',
    'wildlife.marine',
    'wildlife.prehistoric',
    'nature.landscapes',
    'nature.water'
  ],
  aquarium: [
    'wildlife.marine',
    'science.marine_biology',
    'nature.water',
    'wildlife.reptiles'
  ],
  space_museum: [
    'space.planets',
    'space.celestial_bodies',
    'space.phenomena',
    'science.astronomy',
    'science.physics'
  ],
  zoo: [
    'wildlife.birds',
    'wildlife.mammals',
    'wildlife.marine',
    'wildlife.reptiles',
    'wildlife.insects',
    'wildlife.prehistoric'
  ],
  pet_store: [
    'pet.dogs',
    'pet.cats',
    'pet.other',
    'wildlife.birds',
    'wildlife.mammals'
  ]
} as const;

/**
 * Extract categories from a product title
 * Returns array of category paths that match
 */
export function categorizeProduct(title: string): string[] {
  const titleLower = title.toLowerCase();
  const categories: string[] = [];

  // Iterate through taxonomy
  for (const [topLevel, midLevels] of Object.entries(PRODUCT_TAXONOMY)) {
    for (const [midLevel, config] of Object.entries(midLevels)) {
      if (typeof config === 'object' && 'keywords' in config) {
        // Check if any keyword matches
        const hasMatch = config.keywords.some((keyword: string) =>
          titleLower.includes(keyword.toLowerCase())
        );

        if (hasMatch) {
          categories.push(`${topLevel}.${midLevel}`);
        }
      } else {
        // Handle third level (like location.specific.national_parks)
        for (const [subLevel, subConfig] of Object.entries(config)) {
          if (typeof subConfig === 'object' && subConfig !== null && 'keywords' in subConfig) {
            const keywords = (subConfig as { keywords: string[] }).keywords;
            const hasMatch = keywords.some(keyword =>
              titleLower.includes(keyword.toLowerCase())
            );

            if (hasMatch) {
              categories.push(`${topLevel}.${midLevel}.${subLevel}`);
            }
          }
        }
      }
    }
  }

  return categories;
}

/**
 * Get human-readable label for a category path
 */
export function getCategoryLabel(categoryPath: string): string {
  const parts = categoryPath.split('.');
  return parts
    .map(part => part.replace(/_/g, ' '))
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' > ');
}

/**
 * Get all products that match specific category paths
 */
export function getRelevantCategories(buyerType: keyof typeof BUYER_TYPE_CATEGORIES): string[] {
  return [...(BUYER_TYPE_CATEGORIES[buyerType] || [])];
}
