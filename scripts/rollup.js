#!/usr/bin/env node

const path = require("path");
const cluster = require("cluster");
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const compiler = require("@ampproject/rollup-plugin-closure-compiler");

const Bundles = require("./bundles");
const { ROOT_DIR } = require("./paths");
const {
  getBundleOutputPath,
  isProductionBundleType,
  isESMBundleType,
  isModernBundleType
} = require("./packaging");

const pjson = require(path.join(ROOT_DIR, "package.json"));

const {
  CJS_DEV,
  CJS_PROD,
  ESM_DEV,
  ESM_PROD,
  ESM_MODERN_DEV,
  ESM_MODERN_PROD
} = Bundles.bundleTypes;

function getBabelOptions(bundleType) {
  const presetEnvOptions = { modules: false, loose: true };

  if (isModernBundleType(bundleType)) {
    presetEnvOptions.targets = { esmodules: true };
  }

  const presets = [[require.resolve("@babel/preset-env"), presetEnvOptions]];

  const plugins = [
    require.resolve("@babel/plugin-transform-flow-strip-types"),
    require.resolve("@babel/plugin-proposal-object-rest-spread"),
    require.resolve("@babel/plugin-proposal-class-properties"),
    [
      require.resolve("@babel/plugin-transform-runtime"),
      { helpers: true, useESModules: isESMBundleType(bundleType) }
    ],
    require.resolve("babel-preset-fbjs/plugins/dev-expression.js")
  ];

  return {
    exclude: "node_modules/**",
    babelrc: false,
    runtimeHelpers: true,
    presets,
    plugins
  };
}

function getExternals(pjson) {
  const peerDeps = pjson.peerDependencies
    ? Object.keys(pjson.peerDependencies)
    : [];
  const deps = pjson.dependencies ? Object.keys(pjson.dependencies) : [];
  const allDeps = [].concat(peerDeps, deps);

  return (id, parentId, isResolved) => {
    if (!isResolved) {
      if (allDeps.includes(id) || id.startsWith("@babel/runtime")) {
        return true;
      }
    }
    return false;
  };
}

function getFormat(bundleType) {
  switch (bundleType) {
    case CJS_DEV:
    case CJS_PROD:
      return "cjs";
    case ESM_DEV:
    case ESM_PROD:
    case ESM_MODERN_DEV:
    case ESM_MODERN_PROD:
      return "esm";
    default:
      throw new Error(`Unknown bundle type: ${bundleType}`);
  }
}

function getPlugins(bundleType) {
  const plugins = [];

  plugins.push(babel(getBabelOptions(bundleType)));

  if (isProductionBundleType(bundleType)) {
    plugins.push(compiler({}));
  }

  return plugins;
}

async function buildBundle(bundleType) {
  const inputOptions = {
    input: path.join(ROOT_DIR, pjson.source),
    external: getExternals(pjson),
    plugins: getPlugins(bundleType)
  };

  const outputOptions = {
    file: getBundleOutputPath(bundleType),
    format: getFormat(bundleType),
    sourcemap: true
  };

  const bundle = await rollup.rollup(inputOptions);
  await bundle.write(outputOptions);
}

module.exports = buildBundle;

if (process.argv.length === 3 && process.argv[1].endsWith("rollup.js")) {
  const bundleType = process.argv[2];
  buildBundle(bundleType);
}
