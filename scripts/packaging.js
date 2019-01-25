const path = require("path");

const Bundles = require("./bundles");
const { LIB_DIR } = require("./paths");

const {
  CJS_DEV,
  CJS_PROD,
  ESM_DEV,
  ESM_PROD,
  ESM_MODERN_DEV,
  ESM_MODERN_PROD
} = Bundles.bundleTypes;

function isModernBundleType(bundleType) {
  switch (bundleType) {
    case ESM_MODERN_DEV:
    case ESM_MODERN_PROD:
      return true;
    default:
      return false;
  }
}

function isESMBundleType(bundleType) {
  switch (bundleType) {
    case CJS_DEV:
    case CJS_PROD:
      return false;
    case ESM_DEV:
    case ESM_PROD:
    case ESM_MODERN_DEV:
    case ESM_MODERN_PROD:
      return true;
    default:
      throw new Error(`Unknown bundle type: ${bundleType}`);
  }
}

function isProductionBundleType(bundleType) {
  switch (bundleType) {
    case CJS_DEV:
    case ESM_DEV:
    case ESM_MODERN_DEV:
      return false;
    case CJS_PROD:
    case ESM_PROD:
    case ESM_MODERN_PROD:
      return true;
    default:
      throw new Error(`Unknown bundle type: ${bundleType}`);
  }
}

function getDirname(bundletype) {
  switch (bundletype) {
    case CJS_DEV:
    case CJS_PROD:
      return "commonjs";
    case ESM_DEV:
    case ESM_PROD:
      return "esm";
    case ESM_MODERN_DEV:
    case ESM_MODERN_PROD:
      return "esm-modern";
    default:
      throw new Error(`Unknown bundle type: ${bundleType}`);
  }
}

function getBundleFilename(bundleType) {
  const filename = isProductionBundleType(bundleType)
    ? "production"
    : "development";

  const extension = isModernBundleType(bundleType) ? "mjs" : "js";

  return `${filename}.${extension}`;
}

function getBundleOutputPath(bundleType) {
  return path.join(
    LIB_DIR,
    getDirname(bundleType),
    getBundleFilename(bundleType)
  );
}

module.exports = {
  getBundleOutputPath,
  getBundleFilename,
  getDirname,
  isProductionBundleType,
  isESMBundleType,
  isModernBundleType
};
