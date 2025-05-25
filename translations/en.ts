export default {
  // Tab navigation
  tabs: {
    home: 'Home',
    identify: 'Identify',
    garden: 'My Garden',
    care: 'Care',
    profile: 'Profile',
    hydroponic: 'Hydroponic',
  },

  // Greetings
  greetings: {
    morning: 'Good Morning,',
    afternoon: 'Good Afternoon,',
    evening: 'Good Evening,',
  },

  // Home screen
  home: {
    banner: {
      title: 'Plant Identification',
      subtitle: 'Take a photo to identify any plant instantly',
      button: 'Identify Now',
    },
    featured: 'Featured Plants',
    popular: 'Popular Plants',
    seeAll: 'See All',
    hydroponics: {
      title: 'Hydroponic Gardening',
      subtitle: 'Monitor and manage your hydroponic systems',
      button: 'View Systems',
    },
    aiFeatures: {
      title: 'AI-Powered Features',
      disease: 'Disease Detection',
      care: 'Custom Care Plans',
      identification: 'Plant Identification',
    },
  },

  // Identify screen
  identify: {
    title: 'Identify Plant',
    uploadPrompt: 'Take or upload a photo of a plant to identify it',
    takePhoto: 'Take Photo',
    uploadPhoto: 'Upload Photo',
    analyzing: 'Analyzing your plant...',
    confidence: '{{percent}}% Match',
    about: 'About this plant',
    care: 'Care Guide',
    family: 'Family',
    careLabels: {
      water: 'Water',
      light: 'Light',
      soil: 'Soil',
      humidity: 'Humidity',
      temperature: 'Temperature',
      fertilizer: 'Fertilizer',
    },
    viewFullCare: 'View Full Care Guide',
    addToGarden: 'Add to My Garden',
    newScan: 'New Scan',
    noDiseases: 'No common diseases recorded for this plant',
    treatment: 'Treatment',
    tabs: {
      about: 'About',
      care: 'Care',
      diseases: 'Diseases',
    },
    error: {
      title: 'Error',
      camera: 'Failed to open camera',
      gallery: 'Failed to open photo gallery',
      identification: 'Failed to identify plant. Please try again.',
    },
    permission: {
      title: 'Permission Required',
      camera: 'Please grant camera permission to take photos',
    },
    tips: {
      title: 'Tips for better identification',
      closeup: 'Take a close-up photo of the leaves or flowers',
      lighting: 'Ensure good lighting for clear details',
      focus: 'Keep the plant in focus and centered',
    },
  },

  // Garden screen
  garden: {
    title: 'My Garden',
    stats: {
      title: 'Garden Overview',
      subtitle: 'Track your plants and their care',
      plants: 'Plants',
      needWater: 'Need Water',
    },
    categories: {
      all: 'All',
      indoor: 'Indoor',
      outdoor: 'Outdoor',
      succulents: 'Succulents',
      herbs: 'Herbs',
      hydroponic: 'Hydroponic',
    },
    waterStatus: {
      today: 'Water Today',
      tomorrow: 'Water Tomorrow',
      good: 'Watered',
    },
    addPlant: 'Add Plant',
    emptyGarden: {
      title: 'Your garden is empty',
      subtitle: 'Start by adding plants from identification or manually',
      button: 'Add Your First Plant',
    },
  },

  // Care screen
  care: {
    title: 'Care Schedule',
    tasks: 'Tasks',
    noTasks: 'No tasks scheduled for this day',
    days: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
    },
    taskTypes: {
      water: 'Water',
      sunlight: 'Sunlight',
      fertilize: 'Fertilize',
      prune: 'Prune',
      repot: 'Repot',
    },
    addTask: 'Add Task',
    markComplete: 'Mark Complete',
    taskComplete: 'Task Completed',
  },

  // Hydroponic screen
  hydroponic: {
    title: 'Hydroponic Gardening',
    mySystems: 'My Systems',
    addSystem: 'Add System',
    createRecipe: 'Create Recipe',
    viewDetails: 'View Details',
    quickStats: 'Quick Stats',
    avgTemp: 'Avg. Temperature',
    avgPh: 'Avg. pH Level',
    avgEc: 'Avg. EC',
    nutrientRecipes: 'Nutrient Recipes',
    rating: 'Rating',
    learningCenter: 'Learning Center',
    viewAllGuides: 'View All Guides',
    plants: '{{count}} Plants',
    tabs: {
      systems: 'Systems',
      recipes: 'Recipes',
      guides: 'Guides',
    },
    systemTypes: {
      dwc: 'Deep Water Culture',
      nft: 'Nutrient Film Technique',
      drip: 'Drip System',
      wick: 'Wick System',
      aeroponic: 'Aeroponic',
      kratky: 'Kratky Method',
    },
    parameters: {
      ph: 'pH Level',
      ec: 'EC',
      tds: 'TDS',
      waterTemp: 'Water Temp',
      airTemp: 'Air Temp',
      humidity: 'Humidity',
    },
    nutrients: {
      title: 'Nutrient Levels',
      nitrogen: 'Nitrogen (N)',
      phosphorus: 'Phosphorus (P)',
      potassium: 'Potassium (K)',
      calcium: 'Calcium (Ca)',
      magnesium: 'Magnesium (Mg)',
    },
    actions: {
      addReading: 'Add Reading',
      viewHistory: 'View History',
      generateRecipe: 'Generate Nutrient Recipe',
      addPlant: 'Add Plant',
    },
    alerts: {
      highPh: 'pH level is too high',
      lowPh: 'pH level is too low',
      lowNutrients: 'Nutrient levels are low',
      highTemp: 'Water temperature is too high',
    },
    emptyState: {
      title: 'No Hydroponic Systems',
      subtitle: 'Add your first hydroponic system to start monitoring',
      button: 'Create System',
    },
  },

  // Profile screen
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    stats: {
      plants: 'Plants',
      scans: 'Scans',
      badges: 'Badges',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',
      units: 'Measurement Units',
      dataUsage: 'Data Usage',
      subscription: 'Subscription',
    },
    help: {
      title: 'Help & Support',
      faq: 'FAQ',
      contact: 'Contact Support',
      feedback: 'Send Feedback',
      tutorial: 'App Tutorial',
    },
    subscription: {
      free: 'Free Plan',
      premium: 'Premium Plan',
      upgrade: 'Upgrade to Premium',
      features: 'View Premium Features',
    },
    logout: 'Log Out',
    version: 'Version {{version}}',
  },

  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    retry: 'Retry',
    error: 'Something went wrong',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    done: 'Done',
    yourPlant: 'Your plant',
    yourSystem: 'Your system',
  },

  // Notifications
  notifications: {
    water: {
      title: 'Time to water',
      body: '{{plantName}} needs water. Keep it healthy with a good drink.'
    },
    fertilize: {
      title: 'Fertilize today',
      body: '{{plantName}} needs nutrients. Add fertilizer for better growth.'
    },
    prune: {
      title: 'Pruning needed',
      body: '{{plantName}} could use some pruning to encourage new growth.'
    },
    repot: {
      title: 'Time to repot',
      body: '{{plantName}} needs more space. Consider repotting soon.'
    },
    check: {
      title: 'Plant check-up',
      body: 'Time for a check-up. See how {{plantName}} is doing.'
    },
    general: {
      title: 'Plant care reminder',
      body: 'Time to check on {{plantName}}.'
    },
    alerts: {
      phHigh: {
        title: 'High pH level',
        body: '{{systemName}} pH is {{reading}}. Adjust to maintain plant health.'
      },
      phLow: {
        title: 'Low pH level',
        body: '{{systemName}} pH is {{reading}}. Adjust to maintain plant health.'
      },
      tempHigh: {
        title: 'High water temperature',
        body: '{{systemName}} water is {{reading}}. Cool it down for plant health.'
      },
      ecLow: {
        title: 'Low nutrient level', 
        body: '{{systemName}} EC is {{reading}}. Add nutrients soon.'
      },
      waterLow: {
        title: 'Low water level',
        body: '{{systemName}} water level is low. Refill soon.'
      },
      general: {
        title: 'System alert',
        body: '{{systemName}} needs attention.'
      }
    },
         achievements: {
       plantAdded: {
         title: 'First plant added',
         body: 'Congratulations on starting your plant care journey!'
       },
       careStreak: {
         title: 'Care streak: {{days}} days',
         body: 'Your plants are thriving under your consistent care.'
       },
       identification: {
         title: 'Plant expert',
         body: 'You\'ve identified {{count}} different plant species.'
       },
             levelUp: {
         title: 'Level up!',
         body: 'You\'ve reached gardening level {{level}}.'
       }
    },
    permissions: {
      title: 'Enable notifications',
      body: 'Get timely reminders for plant care and important alerts'
    }
  },

  // Auth
  auth: {
    login: 'Log In',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    resetPassword: 'Reset Password',
    resetInstructions: 'Enter your email to receive reset instructions',
    resetSent: 'Password reset email sent',
    loginWith: 'Or log in with',
  },
};
