import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    defaultNS: 'common';
    resources: {
      common: {
        loading: string;
        error: string;
        retry: string;
      };
      home: {
        greeting: string;
        scanPlant: string;
        scanPlantHint: string;
        addPlant: string;
        addPlantHint: string;
      };
      tasks: {
        title: string;
        loading: string;
        empty: string;
        addFirstTask: string;
        addFirstTaskHint: string;
        viewAll: string;
        viewAllHint: string;
        pressToViewDetails: string;
      };
      health: {
        title: string;
        loading: string;
        noData: string;
        viewAll: string;
        viewAllHint: string;
        pressToViewDetails: string;
        lastChecked: string;
      };
      photos: {
        title: string;
        loading: string;
        noPhotos: string;
        takeFirstPhoto: string;
        takeFirstPhotoHint: string;
        viewAll: string;
        viewAllHint: string;
        viewPhoto: string;
        viewPhotoHint: string;
        plantImage: string;
        takenAt: string;
      };
      tips: {
        title: string;
        loading: string;
        noTips: string;
        viewAll: string;
        viewAllHint: string;
        viewTip: string;
        viewTipHint: string;
      };
    };
  }
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: {
        loading: string;
        error: string;
        retry: string;
      };
      home: {
        greeting: string;
        scanPlant: string;
        scanPlantHint: string;
        addPlant: string;
        addPlantHint: string;
      };
      tasks: {
        title: string;
        loading: string;
        empty: string;
        addFirstTask: string;
        addFirstTaskHint: string;
        viewAll: string;
        viewAllHint: string;
        pressToViewDetails: string;
      };
      health: {
        title: string;
        loading: string;
        noData: string;
        viewAll: string;
        viewAllHint: string;
        pressToViewDetails: string;
        lastChecked: string;
      };
      photos: {
        title: string;
        loading: string;
        noPhotos: string;
        takeFirstPhoto: string;
        takeFirstPhotoHint: string;
        viewAll: string;
        viewAllHint: string;
        viewPhoto: string;
        viewPhotoHint: string;
        plantImage: string;
        takenAt: string;
      };
      tips: {
        title: string;
        loading: string;
        noTips: string;
        viewAll: string;
        viewAllHint: string;
        viewTip: string;
        viewTipHint: string;
      };
    };
  }
}

declare module 'i18next' {
  interface TFunction {
    (key: string, options?: { defaultValue?: string; [key: string]: any }): string;
  }
}

declare module 'react-i18next' {
  interface TFunction {
    (key: string, options?: { defaultValue?: string; [key: string]: any }): string;
  }
} 