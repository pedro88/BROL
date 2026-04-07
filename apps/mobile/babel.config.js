module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Module resolver pour les alias
      [
        "module-resolver",
        {
          alias: {
            "@": "./",
            "@brol/shared": "../../packages/shared/src",
          },
        },
      ],
    ],
  };
};
