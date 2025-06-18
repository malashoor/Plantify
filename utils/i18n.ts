// Simple stub for smoke test
export const useTranslation = () => {
  return {
    t: (key: string, fallback?: string) => fallback || key,
    i18n: {
      language: 'en',
    },
  };
};

export const setupI18n = () => {
  // Simple stub
};

export const I18nContext = {
  Provider: ({ children }: { children: any }) => children,
};
