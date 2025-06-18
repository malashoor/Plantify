export default {
  // Common translations
  common: {
    back: 'العودة',
    ok: 'موافق',
    cancel: 'إلغاء',
    loading: 'جاري التحميل...',
    enabled: 'مفعل',
    disabled: 'معطل',
    minutes: 'دقائق',
    offline: 'غير متصل',
    error: 'خطأ',
    create: 'إنشاء',
    update: 'تحديث',
    delete: 'حذف',
    confirm: 'تأكيد',
    edit: 'تعديل',
    close: 'إغلاق',
    turn_on: 'تشغيل',
    turn_off: 'إيقاف',
    new: 'جديد',
    learn_more: 'اعرف المزيد',
    previous: 'السابق',
    next: 'التالي',
    getStarted: 'ابدأ الآن',
  },
  
  // Nutrient Calculator translations
  nutrient: {
    title: 'حاسبة المغذيات',
    select_crop: 'اختر المحصول',
    select_stage: 'اختر مرحلة النمو',
    select_recipe: 'اختر الوصفة',
    water_volume: 'حجم الماء',
    calculate: 'احسب الوصفة',
    results: 'نتائج الحساب',
    warnings: 'تحذيرات',
    tips: 'نصائح',
    save: 'حفظ الوصفة',
    save_recipe: 'حفظ الوصفة',
    speak_all: 'نطق جميع التعليمات',
    official: 'رسمي',
    settings: 'الإعدادات',
    advanced_settings: 'الإعدادات المتقدمة',
    unit_system: 'نظام الوحدات',
    metric: 'متري',
    imperial: 'إمبراطوري',
    voice_feedback: 'التغذية الراجعة الصوتية',
    voice_rate: 'معدل الصوت',
    estimated_time: 'الوقت المقدر',
    nutrients_count: '{{count}} مغذيات',
    duration_days: '{{days}} يوم',
    
    difficulty: {
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
    },
    
    instructions: {
      add: 'أضف {{amount}} {{unit}} من {{nutrient}} إلى {{volume}} {{volumeUnit}} من الماء',
    },
    
    voice: {
      add: 'أضف {{amount}} {{unit}} من {{nutrient}}',
      calculation_complete: 'اكتمل حساب الوصفة. تم حساب {{nutrientCount}} مغذيات. الوقت المقدر: {{time}} دقائق.',
    },
    
    warnings: {
      ph_extreme: 'تحذير: هذه الوصفة لديها قيم pH شديدة. راقب بعناية.',
      incomplete_macro: 'تحذير: قد تفتقر هذه الوصفة للمغذيات الكبرى الأساسية.',
    },
    
    tips: {
      mix_order: 'نصيحة: امزج المغذيات دائماً بالترتيب المدرج لمنع الترسيب.',
      ph_last: 'نصيحة: اضبط الـ pH بعد إضافة جميع المغذيات.',
      beginner: 'نصيحة: ابدأ بكميات أصغر لاكتساب الخبرة.',
    },
    
    save: {
      success_title: 'تم حفظ الوصفة',
      success_message: 'تم حفظ وصفة المغذيات بنجاح.',
      error_title: 'فشل الحفظ',
      error_message: 'فشل في حفظ الوصفة. حاول مرة أخرى.',
    },
    
    accessibility: {
      screen_title: 'حاسبة المغذيات',
      main_content: 'نموذج حاسبة المغذيات',
      crop_section: 'قسم اختيار المحصول',
      crop_picker: 'قائمة منسدلة لاختيار المحصول',
      crop_picker_hint: 'اختر نوع محصولك',
      stage_section: 'قسم اختيار مرحلة النمو',
      stage_picker: 'قائمة منسدلة لاختيار مرحلة النمو',
      stage_picker_hint: 'اختر مرحلة نمو النبات',
      recipe_section: 'قسم اختيار وصفة المغذيات',
      recipe_picker: 'قائمة منسدلة لاختيار الوصفة',
      recipe_picker_hint: 'اختر وصفة مغذيات',
      volume_section: 'قسم إدخال حجم الماء',
      volume_input: 'حقل إدخال حجم الماء',
      volume_hint: 'أدخل كمية الماء لخلط المغذيات فيها',
      volume_placeholder: 'أدخل حجم الماء',
      calculate_button: 'حساب وصفة المغذيات',
      calculate_hint: 'احسب خليط المغذيات بناءً على اختياراتك',
      results_section: 'قسم نتائج الحساب',
      results_summary: 'تحتوي الوصفة على {{nutrients}} مغذيات. وقت الخلط المقدر: {{time}} دقائق',
      nutrient_item: '{{name}}: {{amount}} {{unit}}',
      recipe_name_input: 'حقل إدخال اسم الوصفة',
      recipe_name_hint: 'أدخل اسمًا لحفظ وصفة المغذيات هذه',
      recipe_name_placeholder: 'أدخل اسم الوصفة',
      save_button: 'حفظ وصفة المغذيات',
      save_hint: 'احفظ وصفة المغذيات هذه للاستخدام المستقبلي',
      voice_toggle: 'تبديل التعليمات الصوتية',
      voice_toggle_hint: 'تشغيل أو إيقاف التعليمات الصوتية',
      
      // Voice announcements
      crop_selected: 'تم اختيار {{crop}} كمحصولك',
      stage_selected: 'تم اختيار {{stage}} كمرحلة نمو',
      recipe_selected: 'تم اختيار وصفة {{recipe}} مع {{nutrients}} مغذيات',
      volume_changed: 'تم ضبط حجم الماء على {{volume}} {{unit}}',
      calculation_complete: 'اكتمل حساب الوصفة. تم حساب {{nutrients}} مغذيات. وقت الخلط المقدر: {{time}} دقائق',
      recipe_saved: 'تم حفظ وصفة المغذيات {{name}} بنجاح',
      recipe_save_error: 'خطأ في حفظ وصفة المغذيات. يرجى المحاولة مرة أخرى',
    },
   },

   // Lighting Calculator translations
   lighting: {
     title: 'حاسبة الإضاءة',
     select_crop: 'اختر المحصول',
     select_stage: 'اختر مرحلة النمو',
     select_led: 'اختر ضوء LED',
     select_photoperiod: 'اختر جدول الإضاءة',
     distance_from_canopy: 'المسافة من المظلة',
     coverage: 'التغطية',
     efficiency: 'الكفاءة',
     estimated_ppfd: 'PPFD المقدر',
     calculate: 'احسب الإضاءة',
     results: 'نتائج الإضاءة',
     settings: 'الإعدادات',
     
     save: {
       success_title: 'تم حفظ الإعداد',
       success_message: 'تم حفظ إعداد الإضاءة بنجاح.',
       error_title: 'فشل الحفظ',
       error_message: 'فشل في حفظ إعداد الإضاءة. حاول مرة أخرى.',
     },
     
     recommendations: {
       ppfd_low_title: 'شدة إضاءة منخفضة',
       ppfd_low_desc: 'PPFD الحالي ({{current}}) أقل من الأمثل ({{optimal}}). قرب الضوء أكثر.',
       ppfd_high_title: 'شدة إضاءة عالية',
       ppfd_high_desc: 'PPFD الحالي ({{current}}) أعلى من الأمثل ({{optimal}}). أبعد الضوء أكثر.',
       dli_low_title: 'ضوء يومي غير كافي',
       dli_low_desc: 'DLI الحالي ({{current}}) أقل من الأمثل ({{optimal}}). زد فترة الإضاءة.',
       spectrum_title: 'تعديل الطيف',
       spectrum_red_desc: 'لمرحلة {{stage}}، فكر في {{recommended}}% طيف أحمر.',
     },
     
     voice: {
       move_closer: 'قرب الضوء لزيادة الشدة',
       move_further: 'أبعد الضوء لتقليل الشدة',
       increase_photoperiod: 'زد ساعات الإضاءة للنمو الأفضل',
       adjust_spectrum: 'فكر في تعديل طيف الضوء لهذه المرحلة',
       calculation_complete: 'اكتمل حساب الإضاءة. PPFD: {{ppfd}}، DLI: {{dli}}، التكلفة الشهرية: {{cost}} {{currency}}',
     },
     
     notifications: {
       state_change_title: 'جدول الإضاءة',
       state_change_body: 'سيتم {{action}} الأضواء خلال {{minutes}} دقائق',
     },
     
     accessibility: {
       screen_title: 'حاسبة الإضاءة',
       main_content: 'نموذج حاسبة الإضاءة',
       crop_section: 'قسم اختيار المحصول',
       crop_hint: 'اختر هذا المحصول لحساب احتياجات الإضاءة',
       stage_section: 'قسم اختيار مرحلة النمو',
       stage_hint: 'اختر مرحلة النمو هذه لتحديد نضج النبات',
       led_section: 'قسم اختيار إضاءة LED',
       led_option: 'إضاءة LED {{name}}، {{wattage}} واط، كثافة فوتون {{ppfd}} مايكرومول لكل متر مربع في الثانية، يغطي {{coverage}} متر مربع',
       led_hint: 'اختر إضاءة LED هذه لاستخدامها في الحسابات',
       distance_section: 'قسم ضبط مسافة الإضاءة',
       distance_slider: 'شريط تمرير ضبط ارتفاع الإضاءة',
       distance_hint: 'اضبط ارتفاع إضاءة النمو الخاصة بك',
       current_distance: 'الارتفاع الحالي هو {{distance}} {{unit}}',
       photoperiod_section: 'قسم اختيار جدول الإضاءة',
       photoperiod_option: '{{light}} ساعات إضاءة و {{dark}} ساعات ظلام',
       photoperiod_hint: 'اختر جدول الإضاءة هذا لنباتاتك',
       calculate_button: 'حساب وصفة الإضاءة',
       calculate_hint: 'احسب إعداد الإضاءة الأمثل بناءً على اختياراتك',
       results_section: 'قسم نتائج الحساب',
       results_summary: 'التكامل الضوئي اليومي هو {{dli}} مول لكل متر مربع في اليوم، استهلاك الطاقة هو {{power}} كيلوواط ساعة في اليوم، التكلفة المقدرة هي ${{cost}} في اليوم',
       setup_name_input: 'حقل إدخال اسم الإعداد',
       setup_name_hint: 'أدخل اسمًا لحفظ إعداد الإضاءة هذا',
       save_button: 'حفظ إعداد الإضاءة',
       save_hint: 'احفظ تكوين الإضاءة هذا للاستخدام المستقبلي',
       
       // Voice announcements
       crop_selected: 'تم اختيار {{crop}} كمحصولك',
       stage_selected: 'تم اختيار {{stage}} كمرحلة نمو',
       led_selected: 'تم اختيار LED {{name}} بكثافة فوتون {{ppfd}} وتغطية {{coverage}} متر مربع',
       distance_changed: 'تم ضبط ارتفاع الإضاءة على {{distance}} {{unit}}',
       photoperiod_selected: 'تم ضبط جدول الإضاءة على {{light}} ساعات تشغيل، {{dark}} ساعات إيقاف',
       calculation_complete: 'اكتمل الحساب. التكامل الضوئي اليومي: {{dli}}، استهلاك الطاقة: {{power}} كيلوواط ساعة، التكلفة: ${{cost}} في اليوم',
       setup_saved: 'تم حفظ إعداد الإضاءة {{name}} بنجاح',
       setup_save_error: 'خطأ في حفظ إعداد الإضاءة. يرجى المحاولة مرة أخرى',
     },
   },

   // DIY System Builder translations (Arabic)
   diy: {
     title: 'منشئ الأنظمة المائية',
     subtitle: 'ابني نظام الزراعة المائية الخاص بك',
     selectSystem: 'اختر نوع النظام',
     buildName: 'اسم البناء',
     buildNamePlaceholder: 'أدخل اسماً لمشروع البناء',
     dimensions: 'أبعاد النظام',
     length: 'الطول',
     width: 'العرض',
     height: 'الارتفاع',
     plantConfiguration: 'تكوين النباتات',
     plantCount: 'عدد النباتات',
     spacing: 'المسافة بين النباتات',
     calculateMaterials: 'احسب المواد',
     
     // System types
     difficulty: {
       beginner: 'مبتدئ',
       intermediate: 'متوسط',
       advanced: 'متقدم'
     },
     
     bestFor: 'الأفضل لـ',
     
     // Materials and costs
     materialsList: 'قائمة المواد',
     costSummary: 'ملخص التكلفة',
     estimatedTotal: 'المجموع المقدر',
     requiredMaterials: 'المواد المطلوبة',
     formula: 'المعادلة',
     warnings: 'تحذيرات',
     recommendations: 'توصيات',
     exportList: 'تصدير القائمة',
     
     // Build guide
     buildGuide: 'دليل البناء',
     step: 'الخطوة',
     minutes: 'دقائق',
     progress: 'التقدم',
     tips: 'نصائح',
     checklist: 'قائمة المراجعة',
     notes: 'ملاحظات',
     notesPlaceholder: 'أضف ملاحظات البناء هنا...',
     photos: 'الصور',
     addPhoto: 'أضف صورة',
     completeStep: 'أكمل الخطوة',
     finishBuild: 'أنهي البناء',
     noStepsAvailable: 'لا توجد خطوات بناء متاحة',
     
     // Build journal
     buildJournal: 'مجلة البناء',
     journal: 'المجلة',
     started: 'تاريخ البدء',
     status: 'الحالة',
     completed: 'مكتمل',
     estimatedCost: 'التكلفة المقدرة',
     buildPhotos: 'صور البناء',
     buildNotes: 'ملاحظات البناء',
     buildProgress: 'تقدم البناء',
     noBuildActive: 'لا يوجد مشروع بناء نشط',
     
     // Build status
     buildStatus: {
       planning: 'التخطيط',
       in_progress: 'قيد التنفيذ',
       completed: 'مكتمل',
       paused: 'متوقف مؤقتاً'
     },
     
     // Build steps
     steps: {
       planning: {
         title: 'التخطيط والتصميم',
         description: 'خطط لتخطيط نظامك واجمع المتطلبات',
         tip1: 'قس مساحتك بعناية قبل البدء',
         tip2: 'فكر في التوسع المستقبلي عند التخطيط',
         check1: 'تأكيد قياسات المساحة',
         check2: 'جمع جميع الأدوات والمواد'
       },
       preparation: {
         title: 'تحضير المواد',
         description: 'حضر واقطع جميع المواد بالأحجام المطلوبة',
         tip1: 'تحقق من جميع القياسات مرتين قبل القطع',
         warning1: 'ارتدِ دائماً معدات الأمان عند قطع المواد',
         check1: 'قطع جميع المواد بالحجم الصحيح'
       },
       assembly: {
         title: 'تجميع النظام',
         description: 'اجمع المكونات الرئيسية للنظام',
         tip1: 'اختبر ملاءمة جميع المكونات قبل التجميع النهائي',
         warning1: 'تأكد من أن جميع الوصلات محكمة ضد الماء',
         check1: 'تم تجميع النظام واختباره'
       }
     },
     
     // Build completion
     buildComplete: {
       title: 'اكتمل البناء!',
       message: 'تهانينا! نظام الزراعة المائية الخاص بك جاهز للاستخدام.'
     },
     
     // Voice feedback
     voice: {
       systemSelection: 'اختر نوع نظام الزراعة المائية للبناء',
       calculator: 'أدخل أبعاد نظامك وعدد النباتات',
       guide: 'اتبع دليل البناء خطوة بخطوة',
       journal: 'اعرض تقدم البناء والصور',
       materials: 'راجع المواد المطلوبة والتكاليف',
       systemSelected: 'تم اختيار نظام {{system}}',
       calculationComplete: 'اكتمل حساب المواد',
       buildStarted: 'بدأ مشروع البناء {{name}}',
       stepCompleted: 'اكتملت الخطوة بنجاح',
       exportComplete: 'تم تصدير قائمة المواد بصيغة {{format}}'
     },
     
     // Errors
     error: 'خطأ',
     invalidInputs: 'يرجى إدخال أبعاد صحيحة وعدد النباتات',
     calculationFailed: 'فشل في حساب المواد',
     stepCompletionFailed: 'فشل في إكمال الخطوة',
     imagePickerFailed: 'فشل في اختيار الصورة',
     
     // Export
     export: {
       shareTitle: 'مشاركة قائمة المواد',
       error: 'خطأ في التصدير',
       errorMessage: 'فشل في تصدير قائمة المواد'
     },
     
     // Integration
     startBuild: 'ابدأ البناء',
     linkNutrients: 'ربط وصفة المغذيات',
     linkLighting: 'ربط إعداد الإضاءة',
     autoIntegration: 'التكامل التلقائي متاح'
   },

   // Educational Learning Center translations (Arabic)
   learn: {
     title: 'مركز التعلم',
     subtitle: 'أتقن علم الزراعة المائية مع الدروس المرشدة',
     
     // Categories
     categories: {
       all: 'الكل',
       fundamentals: 'الأساسيات',
       waterScience: 'علم الماء',
       climateControl: 'التحكم في المناخ',
       pestDisease: 'الآفات والأمراض',
       maintenance: 'الصيانة'
     },
     
     // Difficulty levels
     difficulty: {
       beginner: 'مبتدئ',
       intermediate: 'متوسط',
       advanced: 'متقدم'
     },
     
     // Progress and stats
     yourProgress: 'تقدمك في التعلم',
     totalStudyTime: 'إجمالي وقت الدراسة',
     dayStreak: 'سلسلة الأيام',
     achievements: 'الإنجازات',
     weeklyGoal: 'الهدف الأسبوعي',
     progress: 'التقدم',
     
     // Module management
     allModules: 'جميع وحدات التعلم',
     categoryModules: 'وحدات {{category}}',
     filterBy: 'تصفية حسب',
     lessons: 'دروس',
     minutes: 'دقيقة',
     start: 'ابدأ',
     continue: 'متابعة',
     locked: 'مقفل',
     tapToStart: 'انقر لبدء التعلم',
     moduleLockedTitle: 'الوحدة مقفلة',
     moduleLockedMessage: 'أكمل الوحدات المطلوبة لإلغاء قفل هذا المحتوى',
     moduleLockedShort: 'الوحدة مقفلة',
     moduleAccessibilityHint: 'ابدأ وحدة التعلم هذه',
     requiresCompletion: 'يتطلب إكمال',
     
     // Lesson content
     lessonContent: 'محتوى الدرس',
     learningObjectives: 'أهداف التعلم',
     keyPoints: 'النقاط الرئيسية',
     summary: 'الملخص',
     resources: 'الموارد الإضافية',
     practiceNow: 'امارس هذا الآن',
     
     // Quiz system
     quiz: 'اختبار',
     startQuiz: 'ابدأ الاختبار',
     submitQuiz: 'أرسل الاختبار',
     quizResults: 'نتائج الاختبار',
     score: 'النتيجة',
     passed: 'نجح',
     failed: 'رسب',
     retake: 'إعادة الاختبار',
     correctAnswer: 'صحيح!',
     incorrectAnswer: 'خطأ',
     explanation: 'التفسير',
     hint: 'تلميح',
     showHint: 'إظهار التلميح',
     timeRemaining: 'الوقت المتبقي',
     question: 'السؤال {{current}} من {{total}}',
     
     // Bookmarks
     bookmarks: 'الإشارات المرجعية',
     bookmark: 'إشارة مرجعية',
     addBookmark: 'أضف إشارة مرجعية',
     removeBookmark: 'إزالة الإشارة المرجعية',
     bookmarkAdded: 'تمت إضافة الإشارة المرجعية',
     bookmarkRemoved: 'تمت إزالة الإشارة المرجعية',
     noBookmarks: 'لا توجد إشارات مرجعية بعد',
     bookmarkThisLesson: 'أضف إشارة مرجعية لهذا الدرس',
     
     // Voice and audio
     voiceGuidance: 'الإرشاد الصوتي',
     playAudio: 'تشغيل الصوت',
     pauseAudio: 'إيقاف الصوت مؤقتاً',
     voiceSpeed: 'سرعة الصوت',
     autoAdvance: 'التقدم التلقائي',
     
     // Navigation and completion
     previousLesson: 'الدرس السابق',
     nextLesson: 'الدرس التالي',
     completeLesson: 'أكمل الدرس',
     lessonCompleted: 'تم إكمال الدرس!',
     moduleCompleted: 'تم إكمال الوحدة!',
     congratulations: 'تهانينا!',
     
     // Practice links
     practiceLinks: 'أنشطة الممارسة',
     exploreNutrients: 'استكشف حاسبة المغذيات',
     optimizeLighting: 'حسّن إعداد الإضاءة',
     buildSystem: 'ابني نظام الزراعة المائية',
     practiceDescription: 'طبق ما تعلمته في أدواتنا',
     
     // Voice feedback
     voice: {
       moduleStarted: 'بدء وحدة {{module}}',
       lessonStarted: 'بداية الدرس: {{lesson}}',
       lessonCompleted: 'تم إكمال الدرس بنجاح',
       quizStarted: 'بدء الاختبار: {{quiz}}',
       quizPassed: 'تهانينا! حصلت على {{score}}%',
       quizFailed: 'نتيجة الاختبار: {{score}}%. راجع المادة وحاول مرة أخرى',
       bookmarkAdded: 'تمت إضافة الإشارة المرجعية إلى مجموعتك',
       practiceStarted: 'فتح {{module}} للممارسة',
       achievementUnlocked: 'تم إلغاء قفل الإنجاز!'
     },
     
     // Learning goals
     learningGoals: 'أهداف التعلم',
     setGoal: 'حدد هدف التعلم',
     goalProgress: 'تقدم الهدف',
     dailyGoal: 'الهدف اليومي',
     weeklyGoal: 'الهدف الأسبوعي',
     studyStreak: 'سلسلة الدراسة',
     
     // Achievements
     achievementUnlocked: 'تم إلغاء قفل الإنجاز!',
     achievementDescription: 'لقد حصلت على إنجاز جديد',
     viewAchievements: 'عرض جميع الإنجازات',
     
     // Settings
     settings: 'إعدادات التعلم',
     studyReminders: 'تذكيرات الدراسة',
     dailyReminderTime: 'وقت التذكير اليومي',
     downloadContent: 'تحميل للاستخدام دون اتصال',
     deleteDownloaded: 'حذف المحتوى المحمل',
     
     // Offline support
     downloadingContent: 'تحميل محتوى الدرس...',
     contentDownloaded: 'تم تحميل المحتوى للاستخدام دون اتصال',
     offlineMode: 'وضع عدم الاتصال',
     syncProgress: 'مزامنة التقدم...',
     
     // Error states
     noModulesFound: 'لم يتم العثور على وحدات',
     tryDifferentCategory: 'جرب اختيار فئة مختلفة',
     loadingModules: 'تحميل وحدات التعلم...',
     lessonLoadError: 'فشل في تحميل محتوى الدرس',
     quizLoadError: 'فشل في تحميل الاختبار',
     progressSaveError: 'فشل في حفظ التقدم',
     
     // Accessibility
     accessibility: {
       moduleCard: 'بطاقة وحدة التعلم',
       progressBar: 'مؤشر التقدم',
       difficultyBadge: 'مؤشر مستوى الصعوبة',
       lockIcon: 'مؤشر قفل الوحدة',
       playButton: 'تشغيل صوت الدرس',
       quizQuestion: 'سؤال الاختبار',
       answerOption: 'خيار الإجابة',
       bookmarkButton: 'أضف إشارة مرجعية لهذا المحتوى',
       practiceLink: 'رابط نشاط الممارسة'
     }
   },

   // Smart Crop AI Advisor translations (Arabic)
   advisor: {
     title: 'مستشار الذكي للمحاصيل',
     subtitle: 'مساعدك الذكي للزراعة المائية',
     
     // Main interface
     askQuestion: 'اسألني أي شيء عن نباتاتك',
     thinking: 'أحلل بيانات نباتك...',
     noPlants: 'لم يتم العثور على نباتات',
     addPlant: 'أضف نباتك الأول',
     selectPlant: 'اختر النبات',
     
     // Plant health
     plantHealth: 'صحة النبات',
     excellent: 'ممتاز',
     good: 'جيد',
     fair: 'مقبول',
     poor: 'ضعيف',
     critical: 'حرج',
     
     // Health components
     healthComponents: {
       growth: 'النمو',
       nutrition: 'التغذية',
       environment: 'البيئة',
       lighting: 'الإضاءة',
       water: 'جودة الماء',
       roots: 'صحة الجذور'
     },
     
     // Analysis status
     analyzing: 'جاري التحليل...',
     lastAnalysis: 'آخر تحليل',
     nextAnalysis: 'التحليل القادم',
     confidence: 'الثقة',
     dataQuality: 'جودة البيانات',
     
     // Stress indicators
     stressIndicators: 'مؤشرات الإجهاد',
     noStress: 'لا يوجد إجهاد نشط',
     activeStress: 'إجهاد نشط',
     severity: {
       mild: 'خفيف',
       moderate: 'متوسط',
       severe: 'شديد',
       critical: 'حرج'
     },
     
     // Recommendations
     recommendations: 'توصيات الذكي الاصطناعي',
     noRecommendations: 'لا توجد توصيات في الوقت الحالي',
     priority: {
       critical: 'حرج',
       high: 'عالي',
       medium: 'متوسط',
       low: 'منخفض'
     },
     applyRecommendation: 'تطبيق التوصية',
     viewDetails: 'عرض التفاصيل',
     applied: 'مطبق',
     
     // Common recommendations
     reduceLighting: 'تقليل شدة الإضاءة',
     adjustPH: 'ضبط مستوى الحموضة',
     optimizeGrowth: 'تحسين ظروف النمو',
     lightStressDescription: 'نباتك يعاني من إجهاد ضوئي بسبب PPFD مفرط',
     lightStressReasoning: 'PPFD الحالي أعلى بكثير من النطاق الأمثل لهذه المرحلة',
     phLockoutDescription: 'الحموضة خارج النطاق الأمثل، مما يسبب انسداد المغذيات',
     phLockoutReasoning: 'عندما تكون الحموضة غير صحيحة، لا يمكن للنباتات امتصاص المغذيات بفعالية',
     growthOptimizationDescription: 'معدل النمو في تراجع، ينصح بالتحسين',
     growthOptimizationReasoning: 'عدة عوامل قد تحد من إمكانات النمو',
     
     // Conversation
     conversation: 'المساعد الذكي',
     askAboutPlant: 'اسأل عن نباتك',
     exampleQuestions: 'أمثلة على الأسئلة',
     questions: {
       yellowing: 'لماذا تصفر أوراقي؟',
       slowGrowth: 'لماذا النمو بطيء جداً؟',
       lightBurn: 'هل تحصل نباتاتي على إضاءة مفرطة؟',
       nutrients: 'كيف أضبط المغذيات؟',
       harvest: 'متى يجب أن أحصد؟'
     },
     
     // Diagnosis responses
     diagnosis: {
       yellowingPH: 'اصفرار الأوراق غالباً ما يكون بسبب خلل في الحموضة. حموضتك الحالية خارج النطاق الأمثل، مما يمنع امتصاص المغذيات بشكل صحيح.',
       yellowingNutrients: 'الاصفرار يبدو مرتبطاً بالمغذيات. مستويات EC تشير إلى نقص في المغذيات.',
       yellowingGeneral: 'الاصفرار له عدة أسباب محتملة. دعني أحلل ظروفك الحالية لأقدم إرشادات محددة.',
       slowGrowthLight: 'النمو البطيء قد يكون بسبب إضاءة غير كافية. فكر في زيادة PPFD أو تمديد فترة الإضاءة.',
       slowGrowthNutrients: 'مشاكل النمو غالباً ما ترتبط بخلل في المغذيات. مستويات EC والحموضة الحالية تحتاج تعديل.'
     },
     
     // Voice responses
     voice: {
       lightStressAction: 'لقد اكتشفت إجهاداً ضوئياً. أقلل PPFD إلى المستويات المثلى الآن.',
       phAdjustmentNeeded: 'مشكلة حموضة حرجة مكتشفة. تعديل فوري مطلوب لمنع انسداد المغذيات.',
       growthOptimization: 'لقد حددت عدة عوامل يمكن أن تحسن معدل النمو.',
       recommendationApplied: 'تم تطبيق التوصية بنجاح. أراقب النتائج.',
       plantHealthGood: 'نباتاتك تبدو صحية! جميع المعايير ضمن النطاقات المثلى.',
       attentionNeeded: 'انتباه مطلوب. لقد اكتشفت مشكلة تتطلب تدخلك.'
     },
     
     // Actions
     actions: {
       adjustLighting: 'ضبط الإضاءة',
       adjustNutrients: 'ضبط المغذيات',
       learnMore: 'تعلم المزيد',
       takePhoto: 'التقط صورة',
       scheduleReminder: 'حدد تذكير',
       viewTrends: 'عرض الاتجاهات'
     },
     
     // Follow-up questions
     followUp: {
       whenDidYouNotice: 'متى لاحظت هذه المشكلة لأول مرة؟',
       anyRecentChanges: 'هل أجريت أي تغييرات حديثة على إعدادك؟',
       wantOptimization: 'هل تريد مني تحسين إعداداتك؟',
       needMoreInfo: 'هل تريد معلومات أكثر تفصيلاً؟',
       scheduleCheckup: 'هل يجب أن أجدول فحص متابعة؟'
     },
     
     // Settings
     settings: 'إعدادات الذكي الاصطناعي',
     voiceEnabled: 'الردود الصوتية',
     hapticFeedback: 'ردود الفعل اللمسية',
     automationLevel: 'مستوى الأتمتة',
     automationLevels: {
       manual: 'يدوي فقط',
       assisted: 'بمساعدة الذكي الاصطناعي',
       semi_auto: 'شبه تلقائي',
       full_auto: 'أتمتة كاملة'
     },
     notificationFrequency: 'الإشعارات',
     notifications: {
       minimal: 'الحرجة فقط',
       important: 'التحديثات المهمة',
       regular: 'التحديثات المنتظمة',
       detailed: 'جميع الأنشطة'
     },
     
     // AI personality
     aiPersonality: 'شخصية الذكي الاصطناعي',
     communicationStyle: 'أسلوب التواصل',
     styles: {
       casual: 'عارض وودود',
       professional: 'مهني',
       encouraging: 'مشجع',
       technical: 'تفاصيل تقنية'
     },
     
     // Plant profiles
     plantProfile: 'ملف النبات',
     addPlantProfile: 'أضف نبات',
     editPlant: 'تحرير النبات',
     plantName: 'اسم النبات',
     cropType: 'نوع المحصول',
     variety: 'الصنف',
     plantedDate: 'تاريخ الزراعة',
     expectedHarvest: 'الحصاد المتوقع',
     growthStage: 'مرحلة النمو',
     stages: {
       seedling: 'شتلة',
       vegetative: 'نباتي',
       flowering: 'إزهار',
       fruiting: 'إثمار',
       harvesting: 'حصاد'
     },
     
     // Predictions
     predictions: 'توقعات الذكي الاصطناعي',
     harvestPrediction: 'توقع الحصاد',
     yieldEstimate: 'تقدير المحصول',
     problemLikelihood: 'احتمالية المشاكل',
     growthMilestone: 'المعلم القادم',
     
     // Monitoring
     monitoring: 'المراقبة في الوقت الفعلي',
     startMonitoring: 'بدء المراقبة',
     stopMonitoring: 'إيقاف المراقبة',
     monitoringActive: 'المراقبة نشطة',
     lastUpdate: 'آخر تحديث',
     sensorStatus: 'حالة المستشعر',
     
     // Data quality
     dataQualityLevels: {
       excellent: 'ممتاز',
       good: 'جيد',
       fair: 'مقبول',
       poor: 'ضعيف',
       insufficient: 'غير كافي'
     },
     
     // Confidence levels
     confidenceLevels: {
       very_high: 'عالي جداً',
       high: 'عالي',
       medium: 'متوسط',
       low: 'منخفض',
       very_low: 'منخفض جداً'
     },
     
     // Error messages
     error: {
       analysisUnavailable: 'التحليل غير متاح مؤقتاً',
       noSensorData: 'لا توجد بيانات مستشعر متاحة',
       connectionFailed: 'فشل في الاتصال بالمستشعرات',
       aiServiceDown: 'خدمة الذكي الاصطناعي غير متاحة مؤقتاً',
       applicationFailed: 'فشل في تطبيق التوصية'
     },
     
     // Success messages
     success: {
       recommendationApplied: 'تم تطبيق التوصية بنجاح',
       plantAdded: 'تم إنشاء ملف النبات',
       settingsUpdated: 'تم تحديث الإعدادات',
       monitoringStarted: 'بدأت المراقبة'
     },
     
     // Reasoning explanations
     reasoning: {
       basedOnSensorData: 'استناداً إلى قراءات المستشعر الحالية والبيانات التاريخية',
       trendAnalysis: 'تحليل اتجاهات النمو خلال الأسبوع الماضي',
       compareOptimal: 'مقارنة بالنطاقات المثلى لهذا النوع من المحاصيل',
       aiLearning: 'نموذج الذكي الاصطناعي مدرب على آلاف الزراعات الناجحة'
     }
   },

   whatsNew: {
     title: '🌟 ما الجديد',
     calculators: {
       title: 'حاسبات الزراعة المائية',
       description: 'تقدير المغذيات والإضاءة والمزيد لأي مرحلة نمو.',
     },
     premium: {
       title: 'الوصول المميز',
       description: 'افتح الأدوات المتقدمة باستخدام رموز الترويج من المزود الخاص بك.',
     },
     admin: {
       title: 'لوحة تحكم المسؤول',
       description: 'يمكن للمسؤولين الآن إدارة رموز الترويج ومنح الوصول في التطبيق.',
     },
   },

   profile: {
     settings: {
       title: 'الإعدادات',
       language: 'لغة التطبيق',
       switchTo: 'تغيير إلى',
       languageChangeError: 'فشل تغيير اللغة. يرجى المحاولة مرة أخرى.',
       notifications: 'الإشعارات',
       darkMode: 'الوضع الداكن',
     },
   },

   onboarding: {
     welcome: {
       title: 'مرحباً بك في جرينز اي',
       subtitle: 'رفيقك في العناية بالنباتات بالذكاء الاصطناعي',
     },
     care: {
       title: 'العناية الذكية بالنباتات',
       subtitle: 'احصل على توصيات شخصية للعناية بنباتاتك',
     },
     track: {
       title: 'تتبع ومراقبة',
       subtitle: 'راقب رطوبة التربة ومستويات الضوء وصحة النبات',
     },
   },

   landing: {
     title: 'مرحباً بك في جرينز اي',
     subtitle: 'مساعدك الذكي للعناية بالنباتات',
     features: {
       identification: {
         title: 'تحديد النباتات',
         description: 'التقط صورة للتعرف على النباتات والحصول على تعليمات العناية',
       },
       journal: {
         title: 'سجل النباتات',
         description: 'تتبع نمو وصحة نباتاتك مع تفاصيل كاملة',
       },
       reminders: {
         title: 'تذكيرات ذكية',
         description: 'لا تنسى أبداً سقي نباتاتك أو العناية بها',
       },
       hydroponics: {
         title: 'مراقبة الزراعة المائية',
         description: 'إدارة ومراقبة أنظمة الزراعة المائية',
       },
     },
     buttons: {
       getStarted: 'ابدأ الآن',
       login: 'تسجيل الدخول',
       guest: 'تصفح كزائر',
     },
     footer: 'انضم إلى آلاف المهتمين بالنباتات الذين يستخدمون جرينز اي',
   },

   languagePicker: {
     title: "اختر لغتك",
     subtitle: "اختر لغتك المفضلة للبدء مع GreensAI",
     selectLanguage: "اختر {{language}}",
     continue: "متابعة",
   },

   ai: {
     title: 'المساعد الذكي',
     emptyTitle: 'اسأل ما تريد',
     emptyDescription: 'يمكنني مساعدتك في رعاية النباتات، وتشخيص المشكلات، وتقديم توصيات مخصصة.',
     askPlaceholder: 'اكتب سؤالك هنا...',
     tryAsking: 'جرب أن تسأل',
     accessibility: {
       chat_container: 'واجهة المحادثة مع المساعد الذكي',
       message_input: 'حقل إدخال الرسالة',
       send_button: 'إرسال الرسالة',
       empty_state: 'لا توجد رسائل بعد. جرب طرح سؤال.',
       screen_loaded: 'المساعد الذكي جاهز لأسئلتك',
       chat_history_loaded: 'تم تحميل سجل المحادثات السابقة',
       ready_for_input: 'يمكنك البدء في كتابة سؤالك',
       input_focused: 'تم التركيز على حقل إدخال الرسالة، ابدأ في الكتابة',
       input_hint: 'اكتب سؤالك واضغط على إرسال أو استخدم Command+Enter',
       sending_message: 'جاري إرسال رسالتك',
       message_sent: 'تم إرسال الرسالة بنجاح',
       assistant_typing: 'المساعد الذكي يفكر...',
       assistant_responded: 'رد المساعد الذكي بنبرة {{emotion}}',
       error_occurred: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
       sending_hint: 'إرسال رسالتك',
       character_count: 'تم كتابة {{count}} حرف',
       user_message: 'رسالتك',
       assistant_message: 'رد المساعد الذكي',
       example_question: 'سؤال مثال',
       sent_at: 'تم الإرسال في {{time}}',
       received_at: 'تم الاستلام في {{time}}',
       neutral_tone: 'رد محايد',
       supportive_tone: 'رد داعم',
       concerned_tone: 'رد قلق',
       urgent_tone: 'رد عاجل يتطلب اهتماماً فورياً',
       shortcuts_title: 'اختصارات لوحة المفاتيح',
       shortcut_send: 'إرسال الرسالة',
       shortcut_focus: 'التركيز على مربع الدردشة',
       shortcut_clear: 'مسح سجل الدردشة',
       shortcut_read: 'قراءة آخر رد',
       shortcut_jump: 'الانتقال إلى آخر رسالة',
       show_shortcuts: 'عرض اختصارات لوحة المفاتيح',
       shortcuts_closed: 'تم إغلاق نافذة اختصارات لوحة المفاتيح',
     },
     location_aware: 'مدرك للموقع',
     loading_context: 'جارٍ تحميل معلومات الموقع والنبات...',
     thinking: 'يفكر...',
     user_message: 'رسالتك',
     assistant_message: 'رسالة المساعد',
     context: {
       location_based: 'بناءً على موقعك في {{city}}، {{country}}',
       environment_indoor: 'بما أنك تزرع {{plant}} في الداخل',
       environment_outdoor: 'لنباتك {{plant}} في الخارج',
       climate_tip: 'نظراً للمناخ المحلي',
       general_tip: 'نصيحة عامة للعناية',
     },
   },

   seeds: {
     environment: {
       label: 'بيئة النمو',
       indoor: 'داخلي',
       outdoor: 'خارجي',
       indoor_description: 'النمو في الداخل في ظروف متحكم بها',
       outdoor_description: 'النمو في الخارج في ظروف طبيعية',
     },
     location: {
       detecting: 'جاري تحديد موقعك...',
       permission_needed: 'إذن الموقع مطلوب',
       permission_message: 'نستخدم موقعك لتقديم نصائح أفضل للعناية بالنباتات.',
       not_available: 'الموقع غير متاح',
       current: 'الموقع الحالي:',
     },
     form: {
       name_placeholder: 'اسم البذرة',
       name_label: 'أدخل اسم البذرة',
       name_hint: 'أدخل اسماً وصفياً لبذرتك',
       species_placeholder: 'نوع النبات',
       species_label: 'أدخل نوع النبات',
       species_hint: 'أدخل نوع أو صنف نباتك',
       notes_placeholder: 'ملاحظات إضافية (اختياري)',
       notes_label: 'أدخل ملاحظات إضافية',
       notes_hint: 'أضف أي معلومات إضافية عن بذرتك',
       validation_error: 'حقول مطلوبة ناقصة',
       required_fields: 'يرجى ملء كل من الاسم والنوع.',
       submit_error: 'خطأ في حفظ البذرة',
       try_again: 'يرجى المحاولة مرة أخرى لاحقاً.',
       update: 'تحديث البذرة',
       create: 'زراعة البذرة',
       submit_label: 'حفظ معلومات البذرة',
     },
     location: {
       error_title: 'خطأ في الموقع',
       error_message: 'تعذر الحصول على موقعك. قد تكون بعض الميزات محدودة.',
       retry: 'إعادة محاولة الحصول على الموقع',
       detected: 'تم تحديد الموقع',
     },
   },

   errors: {
     auth: {
       not_authenticated: 'يجب تسجيل الدخول للقيام بهذا الإجراء',
     },
     seeds: {
       creation_failed: 'فشل في إنشاء البذرة',
       update_failed: 'فشل في تحديث البذرة',
       deletion_failed: 'فشل في حذف البذرة',
     },
   },

   settings: {
     error: {
       title: 'خطأ في الإعدادات',
       load_failed: 'تعذر تحميل الإعدادات',
       update_failed: 'تعذر تحديث الإعدادات',
     },
     location: {
       title: 'إعدادات الموقع',
       use_location: 'استخدم موقعي للنصائح المخصصة',
       description: 'السماح لـ GreensAI باستخدام موقعك لتقديم توصيات العناية بالنبات حسب المناخ.',
       permission_needed: 'إذن الموقع مطلوب',
       permission_message: 'يحتاج GreensAI إلى الوصول إلى الموقع لتقديم نصائح مخصصة للعناية بالنبات.',
       open_settings: 'فتح الإعدادات',
       privacy_policy: 'تعرف على كيفية استخدامنا لبيانات موقعك',
       privacy_hint: 'عرض سياسة خصوصية بيانات الموقع',
       enabled_announcement: 'تم تفعيل التخصيص حسب الموقع',
       disabled_announcement: 'تم تعطيل التخصيص حسب الموقع',
     },
   },

   weather: {
     conditions: {
       veryHot: 'شديد الحرارة',
       hot: 'حار',
       warm: 'دافئ',
       mild: 'معتدل',
       cool: 'بارد',
       humid: 'رطب',
       dry: 'جاف',
       windy: 'عاصف',
     },
     advice: {
       outdoor: {
         highTemp: 'وفر الظل خلال ساعات الذروة وزد من معدل الري لمنع الإجهاد الحراري',
         lowTemp: 'احمِ النباتات الحساسة من البرد وقلل من معدل الري',
         lowHumidity: 'فكر في رش النباتات واستخدام المهاد للحفاظ على الرطوبة',
         highHumidity: 'تأكد من التهوية الجيدة لمنع مشاكل الفطريات',
         windy: 'وفر الحماية من الرياح وتحقق من دعامات النباتات',
       },
       indoor: {
         highTemp: 'ابعد النباتات عن النوافذ الساخنة وحافظ على رطوبة المكان',
         lowTemp: 'ابعد النباتات عن التيارات الباردة وقلل من الري',
       },
     },
   },
}; 