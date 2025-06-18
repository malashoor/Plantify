module.exports = {
  // Skip entire src directory to prevent routing conflicts
  skipDirs: ['src', 'tabs-disabled'],
  // Also ignore any remaining utility files in app
  ignore: [
    '**/tabs-disabled/**',
    '**/*.test.*',
    '**/*.spec.*',
  ],
  // Enable strict mode for better error handling
  strict: true,
}; 