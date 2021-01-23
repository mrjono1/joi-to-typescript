module.exports = {
  semi: true,
  printWidth: 120,
  trailingComma: "none",
  singleQuote: true,
  bracketSpacing: true,
  endOfLine: "auto",
  arrowParens: 'avoid',
  overrides: [
    {
      files: ["*.yaml", "*.yml"],
      options: {
        singleQuote: false
      }
    }
  ]
};
