module.exports = {
  semi: true,
  printWidth: 120,
  trailingComma: "none",
  singleQuote: true,
  overrides: [
    {
      files: ["*.yaml", "*.yml"],
      options: {
        singleQuote: false
      }
    }
  ]
};
