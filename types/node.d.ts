/**
 * Node.js module declaration to fix ESLint errors in configuration files
 */
declare let module: {
  exports: any;
};

declare let require: (moduleId: string) => any;
declare let __dirname: string;
declare let process: {
  env: Record<string, string | undefined>;
  NODE_ENV?: 'development' | 'production' | 'test';
  NODE_OPTIONS?: string;
};

declare let console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
}; 