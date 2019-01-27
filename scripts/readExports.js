const rollup = require("rollup");

async function readExports(entrypointPath) {
  const inputOptions = {
    input: entrypointPath,
    onwarn: () => {}
  };
  const outputOptions = { format: "esm" };

  const bundle = await rollup.rollup(inputOptions);
  const { output } = await bundle.generate(outputOptions);

  const exports = new Set();
  for (const chunk of output) {
    if (!chunk.isAsset) {
      const { exports: chunkExports } = chunk;
      for (const chunkExport of chunkExports) {
        exports.add(chunkExport);
      }
    }
  }

  return Array.from(exports);
}

module.exports = { readExports };
