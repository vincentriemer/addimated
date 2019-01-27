const { isESMBundleType, isModernBundleType } = require("./packaging");

function getBabelOptions(bundleType) {
  const presetEnvOptions = { modules: false, loose: true };

  if (isModernBundleType(bundleType)) {
    presetEnvOptions.targets = { esmodules: true };
  }

  const presets = [[require.resolve("@babel/preset-env"), presetEnvOptions]];

  const plugins = [
    require.resolve("@babel/plugin-transform-flow-strip-types"),
    [
      require.resolve("@babel/plugin-proposal-object-rest-spread"),
      {
        loose: true,
        useBuiltIns: isModernBundleType(bundleType)
      }
    ],
    [
      require.resolve("@babel/plugin-proposal-class-properties"),
      { loose: true }
    ],
    [
      require.resolve("@babel/plugin-transform-runtime"),
      {
        corejs: false,
        helpers: true,
        regenerator: false,
        useESModules: isESMBundleType(bundleType)
      }
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

module.exports = { getBabelOptions };
