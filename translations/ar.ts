export default {
  // Tab navigation
  tabs: {
    home: 'الرئيسية',
    identify: 'تحديد',
    garden: 'حديقتي',
    care: 'العناية',
    profile: 'الملف الشخصي',
    hydroponic: 'زراعة مائية',
  },

  // Greetings
  greetings: {
    morning: 'صباح الخير،',
    afternoon: 'مساء الخير،',
    evening: 'مساء الخير،',
  },

  // Home screen
  home: {
    banner: {
      title: 'تحديد النباتات',
      subtitle: 'التقط صورة لتحديد أي نبات على الفور',
      button: 'حدد الآن',
    },
    featured: 'نباتات مميزة',
    popular: 'نباتات شائعة',
    seeAll: 'عرض الكل',
    hydroponics: {
      title: 'الزراعة المائية',
      subtitle: 'مراقبة وإدارة أنظمة الزراعة المائية الخاصة بك',
      button: 'عرض الأنظمة',
    },
    aiFeatures: {
      title: 'ميزات الذكاء الاصطناعي',
      disease: 'اكتشاف الأمراض',
      care: 'خطط رعاية مخصصة',
      identification: 'تحديد النباتات',
    },
  },

  // Identify screen
  identify: {
    title: 'تحديد النبات',
    uploadPrompt: 'التقط أو ارفع صورة للنبات لتحديده',
    takePhoto: 'التقط صورة',
    uploadPhoto: 'ارفع صورة',
    analyzing: 'جاري تحليل النبات...',
    confidence: 'تطابق {{percent}}%',
    about: 'عن هذا النبات',
    care: 'دليل العناية',
    family: 'الفصيلة',
    careLabels: {
      water: 'الري',
      light: 'الإضاءة',
      soil: 'التربة',
      humidity: 'الرطوبة',
      temperature: 'درجة الحرارة',
      fertilizer: 'التسميد',
    },
    viewFullCare: 'عرض دليل العناية الكامل',
    addToGarden: 'إضافة إلى حديقتي',
    newScan: 'فحص جديد',
    noDiseases: 'لا توجد أمراض شائعة مسجلة لهذا النبات',
    treatment: 'العلاج',
    tabs: {
      about: 'حول',
      care: 'العناية',
      diseases: 'الأمراض',
    },
    error: {
      title: 'خطأ',
      camera: 'فشل في فتح الكاميرا',
      gallery: 'فشل في فتح معرض الصور',
      identification: 'فشل في تحديد النبات. يرجى المحاولة مرة أخرى.',
    },
    permission: {
      title: 'الإذن مطلوب',
      camera: 'يرجى منح إذن الكاميرا لالتقاط الصور',
    },
    tips: {
      title: 'نصائح للتحديد بشكل أفضل',
      closeup: 'التقط صورة قريبة للأوراق أو الزهور',
      lighting: 'تأكد من وجود إضاءة جيدة للتفاصيل الواضحة',
      focus: 'حافظ على النبات في التركيز وفي المنتصف',
    },
  },

  // Garden screen
  garden: {
    title: 'حديقتي',
    stats: {
      title: 'نظرة عامة على الحديقة',
      subtitle: 'تتبع نباتاتك والعناية بها',
      plants: 'النباتات',
      needWater: 'تحتاج للري',
    },
    categories: {
      all: 'الكل',
      indoor: 'داخلي',
      outdoor: 'خارجي',
      succulents: 'عصاريات',
      herbs: 'أعشاب',
      hydroponic: 'زراعة مائية',
    },
    waterStatus: {
      today: 'ري اليوم',
      tomorrow: 'ري غداً',
      good: 'تم الري',
    },
    addPlant: 'إضافة نبات',
    emptyGarden: {
      title: 'حديقتك فارغة',
      subtitle: 'ابدأ بإضافة النباتات من التحديد أو يدويًا',
      button: 'أضف نباتك الأول',
    },
  },

  // Care screen
  care: {
    title: 'جدول العناية',
    tasks: 'المهام',
    noTasks: 'لا توجد مهام مجدولة لهذا اليوم',
    days: {
      sun: 'أحد',
      mon: 'إثن',
      tue: 'ثلا',
      wed: 'أرب',
      thu: 'خمي',
      fri: 'جمع',
      sat: 'سبت',
    },
    taskTypes: {
      water: 'ري',
      sunlight: 'تعريض للشمس',
      fertilize: 'تسميد',
      prune: 'تقليم',
      repot: 'إعادة زراعة',
    },
    addTask: 'إضافة مهمة',
    markComplete: 'تحديد كمكتمل',
    taskComplete: 'تم إكمال المهمة',
  },

  // Hydroponic screen
  hydroponic: {
    title: 'الزراعة المائية',
    mySystems: 'أنظمتي',
    addSystem: 'إضافة نظام',
    createRecipe: 'إنشاء وصفة',
    viewDetails: 'عرض التفاصيل',
    quickStats: 'إحصائيات سريعة',
    avgTemp: 'متوسط درجة الحرارة',
    avgPh: 'متوسط درجة الحموضة',
    avgEc: 'متوسط التوصيل',
    nutrientRecipes: 'وصفات المغذيات',
    rating: 'التقييم',
    learningCenter: 'مركز التعلم',
    viewAllGuides: 'عرض جميع الأدلة',
    plants: '{{count}} نبات',
    tabs: {
      systems: 'الأنظمة',
      recipes: 'الوصفات',
      guides: 'الأدلة',
    },
    systemTypes: {
      dwc: 'زراعة المياه العميقة',
      nft: 'تقنية الغشاء المغذي',
      drip: 'نظام التنقيط',
      wick: 'نظام الفتيل',
      aeroponic: 'زراعة هوائية',
      kratky: 'طريقة كراتكي',
    },
    parameters: {
      ph: 'مستوى الحموضة',
      ec: 'التوصيل الكهربائي',
      tds: 'المواد الصلبة الذائبة',
      waterTemp: 'درجة حرارة الماء',
      airTemp: 'درجة حرارة الهواء',
      humidity: 'الرطوبة',
    },
    nutrients: {
      title: 'مستويات المغذيات',
      nitrogen: 'النيتروجين (N)',
      phosphorus: 'الفوسفور (P)',
      potassium: 'البوتاسيوم (K)',
      calcium: 'الكالسيوم (Ca)',
      magnesium: 'المغنيسيوم (Mg)',
    },
    actions: {
      addReading: 'إضافة قراءة',
      viewHistory: 'عرض السجل',
      generateRecipe: 'إنشاء وصفة مغذية',
      addPlant: 'إضافة نبات',
    },
    alerts: {
      highPh: 'مستوى الحموضة مرتفع جدًا',
      lowPh: 'مستوى الحموضة منخفض جدًا',
      lowNutrients: 'مستويات المغذيات منخفضة',
      highTemp: 'درجة حرارة الماء مرتفعة جدًا',
    },
    emptyState: {
      title: 'لا توجد أنظمة زراعة مائية',
      subtitle: 'أضف نظام الزراعة المائية الأول للبدء في المراقبة',
      button: 'إنشاء نظام',
    },
  },

  // Profile screen
  profile: {
    title: 'الملف الشخصي',
    editProfile: 'تعديل الملف',
    stats: {
      plants: 'النباتات',
      scans: 'الفحوصات',
      badges: 'الشارات',
    },
    settings: {
      title: 'الإعدادات',
      language: 'اللغة',
      notifications: 'الإشعارات',
      darkMode: 'الوضع الداكن',
      units: 'وحدات القياس',
      dataUsage: 'استخدام البيانات',
      subscription: 'الاشتراك',
    },
    help: {
      title: 'المساعدة والدعم',
      faq: 'الأسئلة الشائعة',
      contact: 'اتصل بالدعم',
      feedback: 'إرسال ملاحظات',
      tutorial: 'دليل التطبيق',
    },
    subscription: {
      free: 'الخطة المجانية',
      premium: 'الخطة المميزة',
      upgrade: 'الترقية إلى المميز',
      features: 'عرض ميزات الاشتراك المميز',
    },
    logout: 'تسجيل الخروج',
    version: 'الإصدار {{version}}',
  },

  // Common
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    loading: 'جاري التحميل...',
    retry: 'إعادة المحاولة',
    error: 'حدث خطأ ما',
    success: 'تم بنجاح',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    skip: 'تخطي',
    done: 'تم',
  },

  // Auth
  auth: {
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    resetInstructions: 'أدخل بريدك الإلكتروني لتلقي تعليمات إعادة التعيين',
    resetSent: 'تم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور',
    loginWith: 'أو تسجيل الدخول باستخدام',
  },
};
