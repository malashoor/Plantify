export default {
  // ... existing translations
  
  // Sensor rule translations
  sensorRule: {
    above: 'above',
    below: 'below',
  },
  
  // Sensor rule alert templates
  sensorRuleAlert: {
    title: '{{parameter}} alert for {{plantName}}',
    body: 'Your {{parameter}} has been {{condition}} {{threshold}}{{unit}} for {{duration}} minutes.',
    viewDetails: 'View details',
  },
  
  // Sensor rules translations
  sensorRules: {
    title: 'Sensor Rules',
    addNew: 'Add Rule',
    addHint: 'Create a new sensor rule',
    editRule: 'Edit Rule',
    newRule: 'New Rule',
    deleteConfirm: 'Are you sure you want to delete this rule for {parameter}?',
    deleteError: 'Failed to delete sensor rule',
    loadError: 'Failed to load sensor rules',
    createError: 'Failed to create sensor rule',
    updateError: 'Failed to update sensor rule',
    noRules: 'No sensor rules created yet',
    tapAdd: 'Tap the Add button to create your first rule',
    plant: 'Plant',
    allPlants: 'All Plants',
    parameter: 'Parameter',
    condition: 'Condition',
    threshold: 'Threshold',
    thresholdHint: 'Enter the value that will trigger the rule',
    thresholdRequired: 'Threshold value is required',
    duration: 'Duration',
    durationHint: 'How long the condition must be true before triggering',
    durationRequired: 'Duration is required',
    actions: 'Actions',
    notification: 'Push Notification',
    notificationDesc: 'Send a notification to this device',
    sms: 'SMS Alert',
    smsDesc: 'Send a text message alert',
    slack: 'Slack Alert',
    slackDesc: 'Post alert to Slack channel',
    slackChannel: 'Slack Channel',
    slackChannelRequired: 'Slack channel is required',
    slackMention: 'Mention User ID (Optional)',
    slackMentionHint: 'User ID to mention in the Slack alert',
    editHint: 'Edit this sensor rule',
    deleteHint: 'Delete this sensor rule',
  },
  
  // Update common translations
  common: {
    // ... existing common translations
    back: 'Back',
    ok: 'OK',
    cancel: 'Cancel',
    loading: 'Loading...',
    enabled: 'Enabled',
    disabled: 'Disabled',
    minutes: 'minutes',
    offline: 'Offline',
    error: 'Error',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    confirm: 'Confirm',
    edit: 'Edit',
    close: 'Close',
    turn_on: 'Turn On',
    turn_off: 'Turn Off',
    new: 'NEW',
    learn_more: 'Learn More',
    previous: 'Previous',
    next: 'Next',
    getStarted: 'Get Started',
    save: 'Save',
  },
  
  // Update tabs translations
  tabs: {
    // ... existing tabs translations
    sensorRules: 'Rules',
  },
  
  // Update accessibility translations
  accessibility: {
    // ... existing accessibility translations
    sensorRulesTab: 'View sensor rules',
    main_content: 'Nutrient calculator main content',
    crop_selected: 'Selected crop: {{crop}}',
    stage_selected: 'Selected growth stage: {{stage}}',
    recipe_selected: 'Selected recipe: {{recipe}}',
    select_crop: 'Select {{crop}} crop',
    crop_hint: 'Double tap to select this crop',
    select_stage: 'Select {{stage}} growth stage',
    select_recipe: 'Select {{recipe}} recipe',
    water_volume: 'Water volume input',
    volume_hint: 'Enter the amount of water for your nutrient solution',
    volume_slider: 'Water volume slider',
    calculate_hint: 'Calculate nutrient amounts for selected recipe',
    calculation_complete: 'Calculation complete with {{count}} nutrients',
    speak_instruction: 'Speak this instruction',
    speak_all: 'Speak all instructions',
    back_hint: 'Go back to previous screen',
    voice_rate: 'Voice playback rate',
    back_hint_detail: 'Returns to the previous view',
    action_hint: 'Double tap to activate',
    language_selector: 'Language selection',
    language_changed: 'Language changed to {{language}}, {{nativeName}}',
    switch_language: 'Switch from {{from}} to {{to}}',
    language_switch_hint: 'Double tap to switch language',
    language_button_hint: 'Select {{language}} as your preferred language',
    language_pill_hint: 'Select {{language}} as your preferred language',
    viewTaskDetails: 'View task details',
    addNewTask: 'Add new task',
    taskCount: '{{count}} tasks remaining',
    taskComplete: 'Task completed',
    taskIncomplete: 'Task incomplete',
    taskDueDate: 'Due on {{date}}',
  },
  
  // Nutrient Calculator translations
  nutrient: {
    title: 'Nutrient Calculator',
    select_crop: 'Select Crop',
    select_stage: 'Select Growth Stage',
    select_recipe: 'Select Recipe',
    water_volume: 'Water Volume',
    calculate: 'Calculate Recipe',
    results: 'Calculation Results',
    warnings: 'Warnings',
    tips: 'Tips',
    save: 'Save Recipe',
    save_recipe: 'Save Recipe',
    speak_all: 'Speak All Instructions',
    official: 'Official',
    settings: 'Settings',
    advanced_settings: 'Advanced Settings',
    unit_system: 'Unit System',
    metric: 'Metric',
    imperial: 'Imperial',
    voice_feedback: 'Voice Feedback',
    voice_rate: 'Voice Rate',
    estimated_time: 'Estimated Time',
    nutrients_count: '{{count}} nutrients',
    duration_days: '{{days}} days',
    
    difficulty: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    
    instructions: {
      add: 'Add {{amount}} {{unit}} of {{nutrient}} to {{volume}} {{volumeUnit}} of water',
    },
    
    voice: {
      add: 'Add {{amount}} {{unit}} of {{nutrient}}',
      calculation_complete: 'Recipe calculation complete. {{nutrientCount}} nutrients calculated. Estimated time: {{time}} minutes.',
    },
    
    warnings: {
      ph_extreme: 'Warning: This recipe has extreme pH values. Monitor carefully.',
      incomplete_macro: 'Warning: This recipe may be missing essential macronutrients.',
    },
    
    tips: {
      mix_order: 'Tip: Always mix nutrients in the order listed to prevent precipitation.',
      ph_last: 'Tip: Adjust pH after adding all nutrients.',
      beginner: 'Tip: Start with smaller batches to gain experience.',
    },
    
    save: {
      success_title: 'Recipe Saved',
      success_message: 'Your nutrient recipe has been saved successfully.',
      error_title: 'Save Failed',
      error_message: 'Failed to save the recipe. Please try again.',
    },
    
    accessibility: {
      screen_title: 'Nutrient Calculator',
      main_content: 'Nutrient calculator form',
      crop_section: 'Crop selection section',
      crop_picker: 'Crop selection dropdown',
      crop_picker_hint: 'Select your crop type',
      stage_section: 'Growth stage selection section',
      stage_picker: 'Growth stage selection dropdown',
      stage_picker_hint: 'Select your plant growth stage',
      recipe_section: 'Nutrient recipe selection section',
      recipe_picker: 'Recipe selection dropdown',
      recipe_picker_hint: 'Select a nutrient recipe',
      volume_section: 'Water volume input section',
      volume_input: 'Water volume input field',
      volume_hint: 'Enter the amount of water to mix nutrients in',
      volume_placeholder: 'Enter water volume',
      calculate_button: 'Calculate nutrient recipe',
      calculate_hint: 'Calculate the nutrient mix based on your selections',
      results_section: 'Calculation results section',
      results_summary: 'Recipe contains {{nutrients}} nutrients. Estimated mixing time: {{time}} minutes',
      nutrient_item: '{{name}}: {{amount}} {{unit}}',
      recipe_name_input: 'Recipe name input field',
      recipe_name_hint: 'Enter a name to save this nutrient recipe',
      recipe_name_placeholder: 'Enter recipe name',
      save_button: 'Save nutrient recipe',
      save_hint: 'Save this nutrient recipe for future use',
      voice_toggle: 'Voice feedback toggle',
      voice_toggle_hint: 'Turn voice instructions on or off',
      
      // Voice announcements
      crop_selected: '{{crop}} selected as your crop',
      stage_selected: '{{stage}} selected as growth stage',
      recipe_selected: '{{recipe}} recipe selected with {{nutrients}} nutrients',
      volume_changed: 'Water volume set to {{volume}} {{unit}}',
      calculation_complete: 'Recipe calculation complete. {{nutrients}} nutrients calculated. Estimated mixing time: {{time}} minutes',
      recipe_saved: 'Nutrient recipe {{name}} saved successfully',
      recipe_save_error: 'Error saving nutrient recipe. Please try again',
    },
   },

   // Lighting Calculator translations
   lighting: {
     title: 'Lighting Calculator',
     select_crop: 'Select Crop',
     select_stage: 'Select Growth Stage',
     select_led: 'Select LED Light',
     select_photoperiod: 'Select Light Schedule',
     distance_from_canopy: 'Distance from Canopy',
     coverage: 'Coverage',
     efficiency: 'Efficiency',
     estimated_ppfd: 'Estimated PPFD',
     calculate: 'Calculate Lighting',
     results: 'Lighting Results',
     settings: 'Settings',
     
     save: {
       success_title: 'Setup Saved',
       success_message: 'Your lighting setup has been saved successfully.',
       error_title: 'Save Failed',
       error_message: 'Failed to save the lighting setup. Please try again.',
     },
     
     recommendations: {
       ppfd_low_title: 'Low Light Intensity',
       ppfd_low_desc: 'Current PPFD ({{current}}) is below optimal ({{optimal}}). Move light closer.',
       ppfd_high_title: 'High Light Intensity', 
       ppfd_high_desc: 'Current PPFD ({{current}}) is above optimal ({{optimal}}). Move light further.',
       dli_low_title: 'Insufficient Daily Light',
       dli_low_desc: 'Current DLI ({{current}}) is below optimal ({{optimal}}). Increase photoperiod.',
       spectrum_title: 'Spectrum Adjustment',
       spectrum_red_desc: 'For {{stage}} stage, consider {{recommended}}% red spectrum.',
     },
     
     voice: {
       move_closer: 'Move your light closer to increase intensity',
       move_further: 'Move your light further to reduce intensity', 
       increase_photoperiod: 'Increase your light hours for better growth',
       adjust_spectrum: 'Consider adjusting your light spectrum for this growth stage',
       calculation_complete: 'Lighting calculation complete. PPFD: {{ppfd}}, DLI: {{dli}}, Monthly cost: {{cost}} {{currency}}',
     },
     
     notifications: {
       state_change_title: 'Light Schedule',
       state_change_body: 'Lights will {{action}} in {{minutes}} minutes',
     },
     
     accessibility: {
       screen_title: 'Lighting Calculator',
       main_content: 'Lighting calculator form',
       crop_section: 'Crop selection section',
       crop_hint: 'Select this crop to calculate its lighting needs',
       stage_section: 'Growth stage selection section',
       stage_hint: 'Select this growth stage to specify plant maturity',
       led_section: 'LED light selection section',
       led_option: '{{name}} LED light, {{wattage}} watts, PPFD {{ppfd}} micromoles per square meter per second, covers {{coverage}} square meters',
       led_hint: 'Select this LED light to use in calculations',
       distance_section: 'Light distance adjustment section',
       distance_slider: 'Light height adjustment slider',
       distance_hint: 'Adjust the height of your grow light',
       current_distance: 'Current height is {{distance}} {{unit}}',
       photoperiod_section: 'Light schedule selection section',
       photoperiod_option: '{{light}} hours of light and {{dark}} hours of darkness',
       photoperiod_hint: 'Select this light schedule for your plants',
       calculate_button: 'Calculate lighting recipe',
       calculate_hint: 'Calculate the optimal lighting setup based on your selections',
       results_section: 'Calculation results section',
       results_summary: 'Daily light integral is {{dli}} moles per square meter per day, power consumption is {{power}} kilowatt hours per day, estimated cost is ${{cost}} per day',
       setup_name_input: 'Setup name input field',
       setup_name_hint: 'Enter a name to save this lighting setup',
       save_button: 'Save lighting setup',
       save_hint: 'Save this lighting configuration for future use',
       
       // Voice announcements
       crop_selected: '{{crop}} selected as your crop',
       stage_selected: '{{stage}} selected as growth stage',
       led_selected: '{{name}} LED selected with {{ppfd}} PPFD and {{coverage}} square meter coverage',
       distance_changed: 'Light height set to {{distance}} {{unit}}',
       photoperiod_selected: 'Light schedule set to {{light}} hours on, {{dark}} hours off',
       calculation_complete: 'Calculation complete. Daily light integral: {{dli}}, Power usage: {{power}} kilowatt hours, Cost: ${{cost}} per day',
       setup_saved: 'Lighting setup {{name}} saved successfully',
       setup_save_error: 'Error saving lighting setup. Please try again',
     },
   },
   
   // DIY System Builder translations
   diy: {
     title: 'DIY System Builder',
     subtitle: 'Build your own hydroponic system',
     selectSystem: 'Select System Type',
     buildName: 'Build Name',
     buildNamePlaceholder: 'Enter a name for your build',
     dimensions: 'System Dimensions',
     length: 'Length',
     width: 'Width',
     height: 'Height',
     plantConfiguration: 'Plant Configuration',
     plantCount: 'Number of Plants',
     spacing: 'Plant Spacing',
     calculateMaterials: 'Calculate Materials',
     
     // System types
     difficulty: {
       beginner: 'Beginner',
       intermediate: 'Intermediate',
       advanced: 'Advanced'
     },
     
     bestFor: 'Best for',
     
     // Materials and costs
     materialsList: 'Materials List',
     costSummary: 'Cost Summary',
     estimatedTotal: 'Estimated Total',
     requiredMaterials: 'Required Materials',
     formula: 'Formula',
     warnings: 'Warnings',
     recommendations: 'Recommendations',
     exportList: 'Export List',
     
     // Build guide
     buildGuide: 'Build Guide',
     step: 'Step',
     minutes: 'minutes',
     progress: 'Progress',
     tips: 'Tips',
     checklist: 'Checklist',
     notes: 'Notes',
     notesPlaceholder: 'Add your build notes here...',
     photos: 'Photos',
     addPhoto: 'Add Photo',
     completeStep: 'Complete Step',
     finishBuild: 'Finish Build',
     noStepsAvailable: 'No build steps available',
     
     // Build journal
     buildJournal: 'Build Journal',
     journal: 'Journal',
     started: 'Started',
     status: 'Status',
     completed: 'Completed',
     estimatedCost: 'Estimated Cost',
     buildPhotos: 'Build Photos',
     buildNotes: 'Build Notes',
     buildProgress: 'Build Progress',
     noBuildActive: 'No active build',
     
     // Build status
     buildStatus: {
       planning: 'Planning',
       in_progress: 'In Progress',
       completed: 'Completed',
       paused: 'Paused'
     },
     
     // Build steps
     steps: {
       planning: {
         title: 'Planning & Design',
         description: 'Plan your system layout and gather requirements',
         tip1: 'Measure your space carefully before starting',
         tip2: 'Consider future expansion when planning',
         check1: 'Space measurements confirmed',
         check2: 'All tools and materials gathered'
       },
       preparation: {
         title: 'Material Preparation',
         description: 'Prepare and cut all materials to size',
         tip1: 'Double-check all measurements before cutting',
         warning1: 'Always wear safety equipment when cutting materials',
         check1: 'All materials cut to correct size'
       },
       assembly: {
         title: 'System Assembly',
         description: 'Assemble the main system components',
         tip1: 'Test fit all components before final assembly',
         warning1: 'Ensure all connections are watertight',
         check1: 'System assembled and tested'
       }
     },
     
     // Build completion
     buildComplete: {
       title: 'Build Complete!',
       message: 'Congratulations! Your hydroponic system is ready to use.'
     },
     
     // Voice feedback
     voice: {
       systemSelection: 'Choose a hydroponic system type to build',
       calculator: 'Enter your system dimensions and plant count',
       guide: 'Follow the step-by-step build guide',
       journal: 'View your build progress and photos',
       materials: 'Review required materials and costs',
       systemSelected: '{{system}} system selected',
       calculationComplete: 'Materials calculation complete',
       buildStarted: 'Build {{name}} started',
       stepCompleted: 'Step completed successfully',
       exportComplete: 'Materials list exported as {{format}}'
     },
     
     // Errors
     error: 'Error',
     invalidInputs: 'Please enter valid dimensions and plant count',
     calculationFailed: 'Failed to calculate materials',
     stepCompletionFailed: 'Failed to complete step',
     imagePickerFailed: 'Failed to select image',
     
     // Export
     export: {
       shareTitle: 'Share Materials List',
       error: 'Export Error',
       errorMessage: 'Failed to export materials list'
     },
     
     // Integration
     startBuild: 'Start Build',
     linkNutrients: 'Link Nutrient Recipe',
     linkLighting: 'Link Lighting Setup',
     autoIntegration: 'Auto-Integration Available'
   },

   // Educational Learning Center translations
   learn: {
     title: 'Learning Center',
     subtitle: 'Master hydroponic science with guided lessons',
     
     // Categories
     categories: {
       all: 'All',
       fundamentals: 'Fundamentals',
       waterScience: 'Water Science',
       climateControl: 'Climate Control',
       pestDisease: 'Pest & Disease',
       maintenance: 'Maintenance'
     },
     
     // Difficulty levels
     difficulty: {
       beginner: 'Beginner',
       intermediate: 'Intermediate',
       advanced: 'Advanced'
     },
     
     // Progress and stats
     yourProgress: 'Your Learning Progress',
     totalStudyTime: 'Total Study Time',
     dayStreak: 'Day Streak',
     achievements: 'Achievements',
     weeklyGoal: 'Weekly Goal',
     progress: 'Progress',
     
     // Module management
     allModules: 'All Learning Modules',
     categoryModules: '{{category}} Modules',
     filterBy: 'Filter by',
     lessons: 'lessons',
     minutes: 'min',
     start: 'Start',
     continue: 'Continue',
     locked: 'Locked',
     tapToStart: 'Tap to start learning',
     moduleLockedTitle: 'Module Locked',
     moduleLockedMessage: 'Complete the prerequisite modules to unlock this content',
     moduleLockedShort: 'Module is locked',
     moduleAccessibilityHint: 'Start this learning module',
     requiresCompletion: 'Requires completion of',
     
     // Lesson content
     lessonContent: 'Lesson Content',
     learningObjectives: 'Learning Objectives',
     keyPoints: 'Key Points',
     summary: 'Summary',
     resources: 'Additional Resources',
     practiceNow: 'Practice This Now',
     
     // Quiz system
     quiz: 'Quiz',
     startQuiz: 'Start Quiz',
     submitQuiz: 'Submit Quiz',
     quizResults: 'Quiz Results',
     score: 'Score',
     passed: 'Passed',
     failed: 'Failed',
     retake: 'Retake Quiz',
     correctAnswer: 'Correct!',
     incorrectAnswer: 'Incorrect',
     explanation: 'Explanation',
     hint: 'Hint',
     showHint: 'Show Hint',
     timeRemaining: 'Time Remaining',
     question: 'Question {{current}} of {{total}}',
     
     // Bookmarks
     bookmarks: 'Bookmarks',
     bookmark: 'Bookmark',
     addBookmark: 'Add Bookmark',
     removeBookmark: 'Remove Bookmark',
     bookmarkAdded: 'Bookmark added',
     bookmarkRemoved: 'Bookmark removed',
     noBookmarks: 'No bookmarks yet',
     bookmarkThisLesson: 'Bookmark this lesson',
     
     // Voice and audio
     voiceGuidance: 'Voice Guidance',
     playAudio: 'Play Audio',
     pauseAudio: 'Pause Audio',
     voiceSpeed: 'Voice Speed',
     autoAdvance: 'Auto Advance',
     
     // Navigation and completion
     previousLesson: 'Previous Lesson',
     nextLesson: 'Next Lesson',
     completeLesson: 'Complete Lesson',
     lessonCompleted: 'Lesson Completed!',
     moduleCompleted: 'Module Completed!',
     congratulations: 'Congratulations!',
     
     // Practice links
     practiceLinks: 'Practice Activities',
     exploreNutrients: 'Explore Nutrient Calculator',
     optimizeLighting: 'Optimize Lighting Setup',
     buildSystem: 'Build Hydroponic System',
     practiceDescription: 'Apply what you learned in our tools',
     
     // Voice feedback
     voice: {
       moduleStarted: 'Starting {{module}} module',
       lessonStarted: 'Beginning lesson: {{lesson}}',
       lessonCompleted: 'Lesson completed successfully',
       quizStarted: 'Starting quiz: {{quiz}}',
       quizPassed: 'Congratulations! You scored {{score}}%',
       quizFailed: 'Quiz score: {{score}}%. Review the material and try again',
       bookmarkAdded: 'Bookmark added to your collection',
       practiceStarted: 'Opening {{module}} for practice',
       achievementUnlocked: 'Achievement unlocked!'
     },
     
     // Learning goals
     learningGoals: 'Learning Goals',
     setGoal: 'Set Learning Goal',
     goalProgress: 'Goal Progress',
     dailyGoal: 'Daily Goal',
     weeklyGoal: 'Weekly Goal',
     studyStreak: 'Study Streak',
     
     // Achievements
     achievementUnlocked: 'Achievement Unlocked!',
     achievementDescription: 'You earned a new achievement',
     viewAchievements: 'View All Achievements',
     
     // Settings
     settings: 'Learning Settings',
     studyReminders: 'Study Reminders',
     dailyReminderTime: 'Daily Reminder Time',
     downloadContent: 'Download for Offline',
     deleteDownloaded: 'Delete Downloaded Content',
     
     // Offline support
     downloadingContent: 'Downloading lesson content...',
     contentDownloaded: 'Content downloaded for offline use',
     offlineMode: 'Offline Mode',
     syncProgress: 'Syncing progress...',
     
     // Error states
     noModulesFound: 'No modules found',
     tryDifferentCategory: 'Try selecting a different category',
     loadingModules: 'Loading learning modules...',
     lessonLoadError: 'Failed to load lesson content',
     quizLoadError: 'Failed to load quiz',
     progressSaveError: 'Failed to save progress',
     
     // Accessibility
     accessibility: {
       moduleCard: 'Learning module card',
       progressBar: 'Progress indicator',
       difficultyBadge: 'Difficulty level indicator',
       lockIcon: 'Module locked indicator',
       playButton: 'Play lesson audio',
       quizQuestion: 'Quiz question',
       answerOption: 'Answer option',
       bookmarkButton: 'Bookmark this content',
       practiceLink: 'Practice activity link'
     }
   },

   // Smart Crop AI Advisor translations
   advisor: {
     title: 'Crop AI Advisor',
     subtitle: 'Your intelligent hydroponic assistant',
     
     // Main interface
     askQuestion: 'Ask me anything about your plants',
     thinking: 'Analyzing your plant data...',
     noPlants: 'No plants found',
     addPlant: 'Add Your First Plant',
     selectPlant: 'Select Plant',
     
     // Plant health
     plantHealth: 'Plant Health',
     excellent: 'Excellent',
     good: 'Good',
     fair: 'Fair',
     poor: 'Poor',
     critical: 'Critical',
     
     // Health components
     healthComponents: {
       growth: 'Growth',
       nutrition: 'Nutrition',
       environment: 'Environment',
       lighting: 'Lighting',
       water: 'Water Quality',
       roots: 'Root Health'
     },
     
     // Analysis status
     analyzing: 'Analyzing...',
     lastAnalysis: 'Last Analysis',
     nextAnalysis: 'Next Analysis',
     confidence: 'Confidence',
     dataQuality: 'Data Quality',
     
     // Stress indicators
     stressIndicators: 'Stress Indicators',
     noStress: 'No active stress detected',
     activeStress: 'Active Stress',
     severity: {
       mild: 'Mild',
       moderate: 'Moderate',
       severe: 'Severe',
       critical: 'Critical'
     },
     
     // Recommendations
     recommendations: 'AI Recommendations',
     noRecommendations: 'No recommendations at this time',
     priority: {
       critical: 'Critical',
       high: 'High',
       medium: 'Medium',
       low: 'Low'
     },
     applyRecommendation: 'Apply Recommendation',
     viewDetails: 'View Details',
     applied: 'Applied',
     
     // Common recommendations
     reduceLighting: 'Reduce Light Intensity',
     adjustPH: 'Adjust pH Level',
     optimizeGrowth: 'Optimize Growth Conditions',
     lightStressDescription: 'Your plant is experiencing light stress from excessive PPFD',
     lightStressReasoning: 'Current PPFD is significantly above optimal range for this growth stage',
     phLockoutDescription: 'pH is outside optimal range, causing nutrient lockout',
     phLockoutReasoning: 'When pH is incorrect, plants cannot absorb nutrients effectively',
     growthOptimizationDescription: 'Growth rate has been declining, optimization recommended',
     growthOptimizationReasoning: 'Several factors may be limiting growth potential',
     
     // Conversation
     conversation: 'AI Assistant',
     askAboutPlant: 'Ask about your plant',
     exampleQuestions: 'Example Questions',
     questions: {
       yellowing: 'Why are my leaves turning yellow?',
       slowGrowth: 'Why is growth so slow?',
       lightBurn: 'Are my plants getting too much light?',
       nutrients: 'How do I adjust my nutrients?',
       harvest: 'When should I harvest?'
     },
     
     // Diagnosis responses
     diagnosis: {
       yellowingPH: 'Yellowing leaves are often caused by pH imbalance. Your current pH is outside the optimal range, preventing proper nutrient uptake.',
       yellowingNutrients: 'The yellowing appears to be nutrient-related. Your EC levels suggest nutrient deficiency.',
       yellowingGeneral: 'Yellowing can have several causes. Let me analyze your current conditions to provide specific guidance.',
       slowGrowthLight: 'Slow growth may be due to insufficient lighting. Consider increasing PPFD or extending photoperiod.',
       slowGrowthNutrients: 'Growth issues often relate to nutrient imbalances. Your current EC and pH levels need adjustment.'
     },
     
     // Voice responses
     voice: {
       lightStressAction: 'I\'ve detected light stress. Reducing PPFD to optimal levels now.',
       phAdjustmentNeeded: 'Critical pH issue detected. Immediate adjustment required to prevent nutrient lockout.',
       growthOptimization: 'I\'ve identified several factors that could improve your growth rate.',
       recommendationApplied: 'Recommendation applied successfully. Monitoring for results.',
       plantHealthGood: 'Your plants are looking healthy! All parameters are within optimal ranges.',
       attentionNeeded: 'Attention needed. I\'ve detected an issue that requires your action.'
     },
     
     // Actions
     actions: {
       adjustLighting: 'Adjust Lighting',
       adjustNutrients: 'Adjust Nutrients',
       learnMore: 'Learn More',
       takePhoto: 'Take Photo',
       scheduleReminder: 'Set Reminder',
       viewTrends: 'View Trends'
     },
     
     // Follow-up questions
     followUp: {
       whenDidYouNotice: 'When did you first notice this issue?',
       anyRecentChanges: 'Have you made any recent changes to your setup?',
       wantOptimization: 'Would you like me to optimize your settings?',
       needMoreInfo: 'Would you like more detailed information?',
       scheduleCheckup: 'Should I schedule a follow-up check?'
     },
     
     // Settings
     settings: 'AI Settings',
     voiceEnabled: 'Voice Responses',
     hapticFeedback: 'Haptic Feedback',
     automationLevel: 'Automation Level',
     automationLevels: {
       manual: 'Manual Only',
       assisted: 'AI Assisted',
       semi_auto: 'Semi-Automatic',
       full_auto: 'Full Automation'
     },
     notificationFrequency: 'Notifications',
     notifications: {
       minimal: 'Critical Only',
       important: 'Important Updates',
       regular: 'Regular Updates',
       detailed: 'All Activity'
     },
     
     // AI personality
     aiPersonality: 'AI Personality',
     communicationStyle: 'Communication Style',
     styles: {
       casual: 'Casual & Friendly',
       professional: 'Professional',
       encouraging: 'Encouraging',
       technical: 'Technical Detail'
     },
     
     // Plant profiles
     plantProfile: 'Plant Profile',
     addPlantProfile: 'Add Plant',
     editPlant: 'Edit Plant',
     plantName: 'Plant Name',
     cropType: 'Crop Type',
     variety: 'Variety',
     plantedDate: 'Planted Date',
     expectedHarvest: 'Expected Harvest',
     growthStage: 'Growth Stage',
     stages: {
       seedling: 'Seedling',
       vegetative: 'Vegetative',
       flowering: 'Flowering',
       fruiting: 'Fruiting',
       harvesting: 'Harvesting'
     },
     
     // Predictions
     predictions: 'AI Predictions',
     harvestPrediction: 'Harvest Prediction',
     yieldEstimate: 'Yield Estimate',
     problemLikelihood: 'Problem Likelihood',
     growthMilestone: 'Next Milestone',
     
     // Monitoring
     monitoring: 'Real-time Monitoring',
     startMonitoring: 'Start Monitoring',
     stopMonitoring: 'Stop Monitoring',
     monitoringActive: 'Monitoring Active',
     lastUpdate: 'Last Update',
     sensorStatus: 'Sensor Status',
     
     // Data quality
     dataQualityLevels: {
       excellent: 'Excellent',
       good: 'Good',
       fair: 'Fair',
       poor: 'Poor',
       insufficient: 'Insufficient'
     },
     
     // Confidence levels
     confidenceLevels: {
       very_high: 'Very High',
       high: 'High',
       medium: 'Medium',
       low: 'Low',
       very_low: 'Very Low'
     },
     
     // Error messages
     error: {
       analysisUnavailable: 'Analysis temporarily unavailable',
       noSensorData: 'No sensor data available',
       connectionFailed: 'Failed to connect to sensors',
       aiServiceDown: 'AI service temporarily unavailable',
       applicationFailed: 'Failed to apply recommendation'
     },
     
     // Success messages
     success: {
       recommendationApplied: 'Recommendation applied successfully',
       plantAdded: 'Plant profile created',
       settingsUpdated: 'Settings updated',
       monitoringStarted: 'Monitoring started'
     },
     
     // Reasoning explanations
     reasoning: {
       basedOnSensorData: 'Based on current sensor readings and historical data',
       trendAnalysis: 'Analysis of growth trends over the past week',
       compareOptimal: 'Compared to optimal ranges for this crop type',
       aiLearning: 'AI model trained on thousands of successful grows'
     }
   },
   
   whatsNew: {
     title: '🌟 What\'s New',
     calculators: {
       title: 'Hydroponic Calculators',
       description: 'Estimate nutrients, lighting, and more for any grow stage.',
     },
     premium: {
       title: 'Premium Access',
       description: 'Unlock advanced tools with promotion codes from your provider.',
     },
     admin: {
       title: 'Admin Dashboard',
       description: 'Admins can now manage promo codes and grant access in-app.',
     },
   },

   profile: {
     settings: {
       title: 'Settings',
       language: 'App Language',
       switchTo: 'Switch to',
       languageChangeError: 'Failed to change language. Please try again.',
       notifications: 'Notifications',
       darkMode: 'Dark Mode',
     },
   },

   onboarding: {
     welcome: {
       title: 'Welcome to GreensAI',
       subtitle: 'Your AI-powered plant care companion',
     },
     care: {
       title: 'Smart Plant Care',
       subtitle: 'Get personalized care recommendations for your plants',
     },
     track: {
       title: 'Track & Monitor',
       subtitle: 'Monitor soil moisture, light levels, and plant health',
     },
   },

   landing: {
     title: 'Welcome to GreensAI',
     subtitle: 'Your AI-Powered Plant Care Assistant',
     features: {
       identification: {
         title: 'Plant Identification',
         description: 'Take a photo to instantly identify plants and get care instructions',
       },
       journal: {
         title: 'Plant Journal',
         description: "Track your plant's growth and health with detailed entries",
       },
       reminders: {
         title: 'Smart Reminders',
         description: 'Never forget to water or care for your plants again',
       },
       hydroponics: {
         title: 'Hydroponics Monitor',
         description: 'Manage and monitor your hydroponic systems',
       },
     },
     buttons: {
       getStarted: 'Get Started',
       login: 'Log In',
       guest: 'Explore as Guest',
     },
     footer: 'Join thousands of plant enthusiasts using GreensAI',
   },

   languagePicker: {
     title: "Choose Your Language",
     subtitle: "Select your preferred language to get started with GreensAI",
     selectLanguage: "Select {{language}}",
     continue: "Continue",
   },

   premium: {
     title: 'Premium Access',
     description: 'Unlock all features and get the most out of your plant care experience',
     subscribe: 'Subscribe',
     restorePurchases: 'Restore Purchases',
     
     alreadyPremium: {
       title: 'You\'re a Premium Member! 🌟',
       message: 'Thank you for supporting GreensAI. Enjoy all premium features!',
     },

     purchaseSuccess: {
       title: 'Welcome to Premium!',
       message: 'Thank you for subscribing. You now have access to all premium features.',
     },

     restoreSuccess: {
       title: 'Purchases Restored',
       message: 'Your premium access has been restored successfully.',
     },

     restoreFailed: {
       title: 'Restore Failed',
       message: 'No previous purchases were found to restore.',
     },

     features: {
       advancedCalculator: {
         title: 'Advanced Plant Calculator',
         description: 'Access PPFD calculations, nutrient ratios, and detailed growth analytics',
       },
       unlimitedAI: {
         title: 'Unlimited AI Consultations',
         description: 'Get personalized plant care advice anytime you need it',
       },
       customJournal: {
         title: 'Custom Plant Journal',
         description: 'Create detailed care logs and track your plants\' progress',
       },
       prioritySupport: {
         title: 'Priority Support',
         description: 'Get faster responses and dedicated assistance',
       },
     },

     status: {
       active: "Premium Active",
       expires: "Expires {{date}}",
       inactive: "Free Plan",
     },
     cta: {
       upgrade: "Upgrade to Premium",
       trial: "Start Free Trial",
     },
     promoCodes: {
       title: "Have a Promo Code?",
       placeholder: "Enter code",
       apply: "Apply Code",
       success: "Code Applied Successfully",
       error: "Invalid Code",
       activated: "Your premium features have been activated!",
       invalid: "Please check your code and try again.",
     },
   },

   ai: {
     title: 'AI Assistant',
     emptyTitle: 'Ask Me Anything',
     emptyDescription: 'I can help you with plant care, diagnose issues, and provide personalized recommendations.',
     askPlaceholder: 'Type your question here...',
     tryAsking: 'Try asking',
     accessibility: {
       chat_container: 'AI Assistant chat interface',
       message_input: 'Message input field',
       send_button: 'Send message',
       empty_state: 'No messages yet. Try asking a question.',
       screen_loaded: 'AI Assistant ready for your questions',
       chat_history_loaded: 'Previous chat history loaded',
       ready_for_input: 'You can start typing your question',
       input_focused: 'Message input field focused, start typing your question',
       input_hint: 'Type your question and press send or use Command+Enter',
       sending_message: 'Sending your message',
       message_sent: 'Message sent successfully',
       assistant_typing: 'AI Assistant is thinking...',
       assistant_responded: 'AI Assistant responded with {{emotion}} tone',
       error_occurred: 'An error occurred. Please try again.',
       sending_hint: 'Send your message',
       character_count: '{{count}} characters typed',
       user_message: 'Your message',
       assistant_message: 'AI Assistant response',
       example_question: 'Example question',
       sent_at: 'Sent at {{time}}',
       received_at: 'Received at {{time}}',
       neutral_tone: 'Neutral response',
       supportive_tone: 'Supportive response',
       concerned_tone: 'Concerned response',
       urgent_tone: 'Urgent response requiring immediate attention',
       shortcuts_title: 'Keyboard Shortcuts',
       shortcut_send: 'Send message',
       shortcut_focus: 'Focus chat input',
       shortcut_clear: 'Clear chat history',
       shortcut_read: 'Read last response',
       shortcut_jump: 'Jump to latest message',
       show_shortcuts: 'Show keyboard shortcuts',
       shortcuts_closed: 'Keyboard shortcuts dialog closed',
       chat_cleared: 'Chat history cleared',
       reading_last_response: 'Reading last response',
       jumped_to_latest: 'Jumped to latest message',
       keyboard_shown: 'Keyboard shown',
       keyboard_hidden: 'Keyboard hidden',
     },
     location_aware: 'Location-Aware',
     loading_context: 'Loading location and plant context...',
     thinking: 'Thinking...',
     context: {
       location_based: 'Based on your location in {{city}}, {{country}}',
       environment_indoor: 'Since you\'re growing this {{plant}} indoors',
       environment_outdoor: 'For your outdoor {{plant}}',
       climate_tip: 'Given the local climate',
       general_tip: 'General care tip',
     },
   },

   seeds: {
     environment: {
       label: 'Growing Environment',
       indoor: 'Indoor',
       outdoor: 'Outdoor',
       indoor_description: 'Growing inside with controlled conditions',
       outdoor_description: 'Growing outside in natural conditions',
     },
     location: {
       detecting: 'Detecting your location...',
       permission_needed: 'Location permission needed',
       permission_message: 'We use your location to provide better plant care advice.',
       not_available: 'Location not available',
       current: 'Current location:',
     },
     form: {
       name_placeholder: 'Seed name',
       name_label: 'Enter seed name',
       name_hint: 'Enter a descriptive name for your seed',
       species_placeholder: 'Plant species',
       species_label: 'Enter plant species',
       species_hint: 'Enter the species or variety of your plant',
       notes_placeholder: 'Additional notes (optional)',
       notes_label: 'Enter additional notes',
       notes_hint: 'Add any extra information about your seed',
       validation_error: 'Required Fields Missing',
       required_fields: 'Please fill in both name and species.',
       submit_error: 'Error Saving Seed',
       try_again: 'Please try again later.',
       update: 'Update Seed',
       create: 'Plant Seed',
       submit_label: 'Save seed information',
     },
     location: {
       error_title: 'Location Error',
       error_message: 'Could not get your location. Some features may be limited.',
       retry: 'Retry getting location',
       detected: 'Location detected',
     },
   },

   errors: {
     auth: {
       not_authenticated: 'You must be logged in to perform this action',
     },
     seeds: {
       creation_failed: 'Failed to create seed',
       update_failed: 'Failed to update seed',
       deletion_failed: 'Failed to delete seed',
     },
   },

   settings: {
     error: {
       title: 'Settings Error',
       load_failed: 'Could not load settings',
       update_failed: 'Could not update settings',
     },
     location: {
       title: 'Location Settings',
       use_location: 'Use my location for personalized advice',
       description: 'Allow GreensAI to use your location to provide climate-specific plant care recommendations.',
       permission_needed: 'Location Permission Required',
       permission_message: 'GreensAI needs location access to provide personalized plant care advice.',
       open_settings: 'Open Settings',
       privacy_policy: 'Learn how we use your location data',
       privacy_hint: 'View our location data privacy policy',
       enabled_announcement: 'Location-based personalization enabled',
       disabled_announcement: 'Location-based personalization disabled',
     },
   },

   weather: {
     conditions: {
       veryHot: 'very hot',
       hot: 'hot',
       warm: 'warm',
       mild: 'mild',
       cool: 'cool',
       humid: 'humid',
       dry: 'dry',
       windy: 'windy',
     },
     advice: {
       outdoor: {
         highTemp: 'provide shade during peak hours and water more frequently to prevent heat stress',
         lowTemp: 'protect sensitive plants from cold and reduce watering frequency',
         lowHumidity: 'consider misting your plants and using mulch to retain moisture',
         highHumidity: 'ensure good air circulation to prevent fungal issues',
         windy: 'provide wind protection and check plant supports',
       },
       indoor: {
         highTemp: 'keep plants away from hot windows and maintain indoor humidity',
         lowTemp: 'move plants away from cold drafts and reduce watering',
         lowHumidity: 'use a humidity tray or humidifier to maintain moisture',
       },
     },
     currentConditions: 'Current conditions',
     temperature: 'Temperature',
     humidity: 'Humidity',
     windSpeed: 'Wind Speed',
     feelsLike: 'Feels like',
     lastUpdated: 'Last updated',
     notAvailable: 'Weather data not available',
     updating: 'Updating weather data...',
   },
}; 