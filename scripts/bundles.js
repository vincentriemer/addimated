const bundleTypes = {
  CJS_DEV: "CJS_DEV",
  CJS_PROD: "CJS_PROD",
  ESM_DEV: "ESM_DEV",
  ESM_PROD: "ESM_PROD",
  ESM_MODERN_DEV: "ESM_MODERN_DEV",
  ESM_MODERN_PROD: "ESM_MODERN_PROD"
};

module.exports = {
  bundleTypes,
  allBundles: [...Object.values(bundleTypes)]
};
