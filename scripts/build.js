const fs = require("fs");
const path = require("path");
const util = require("util");

const Listr = require("listr");
const createLogger = require("progress-estimator");
const shell = require("shelljs");
const execa = require("execa");
const Worker = require("jest-worker").default;

const { LIB_DIR, SCRIPT_DIR, TEMPLATE_DIR, ROOT_DIR } = require("./paths");
const { allBundles, bundleTypes } = require("./bundles");
const { isProductionBundleType, getBundleOutputPath } = require("./packaging");
const { calculateResults, printResults, saveResults } = require("./stats");
const Handlebars = require("./handlebars");

const pjson = require(path.join(ROOT_DIR, "/package.json"));

const LoadingBarRenderer = require("./cli/loadingBarRenderer");

function createWorker(path) {
  return new Worker(path, {
    numWorkers: process.env.CI == null ? undefined : 1,
    enableWorkerThreads: false
  });
}

const { readExports } = createWorker(require.resolve("./readExports.js"));
const { buildBundle } = createWorker(require.resolve("./rollup.js"));

const entrypoints = {
  cjs: path.resolve(ROOT_DIR, pjson.main),
  esm: path.resolve(ROOT_DIR, pjson.module),
  esmModern: path.resolve(ROOT_DIR, pjson["module:modern"])
};

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const {
  CJS_DEV,
  CJS_PROD,
  ESM_DEV,
  ESM_PROD,
  ESM_MODERN_PROD,
  ESM_MODERN_DEV
} = bundleTypes;

function getBundleLabel(bundleType) {
  const type = isProductionBundleType(bundleType)
    ? "production"
    : "development";

  const name = (() => {
    switch (bundleType) {
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
  })();

  return `${name}:${type}`;
}

const cleanTask = {
  title: "Clean",
  task: () => {
    shell.rm("-rf", LIB_DIR);
    shell.mkdir(LIB_DIR);
  }
};

const entrypointsTask = {
  title: "NPM Entrypoints",
  task: async () => {
    const templateSrc = await readFileAsync(
      path.join(TEMPLATE_DIR, "entrypoint.js.hbs"),
      { encoding: "utf8" }
    );
    const template = Handlebars.compile(templateSrc);

    const exports = await readExports(getBundleOutputPath(ESM_DEV));
    for (let entrypointName of Object.keys(entrypoints)) {
      const entrypoint = entrypoints[entrypointName];
      const context = (() => {
        switch (entrypointName) {
          case "cjs":
            return {
              exports,
              commonjs: true,
              extension: "js",
              type: "commonjs"
            };
          case "esm":
            return { exports, commonjs: false, extension: "js", type: "esm" };
          case "esmModern":
            return {
              exports,
              commonjs: false,
              extension: "mjs",
              type: "esm-modern"
            };
        }
      })();

      const entrypointSrc = template(context);
      await writeFileAsync(entrypoint, entrypointSrc, "utf8");
    }
  }
};

const bundleTask = {
  title: "Bundle",
  task: () =>
    new Listr(
      allBundles.map(bundleType => ({
        title: getBundleLabel(bundleType),
        task: () => buildBundle(bundleType)
      })),
      { concurrent: process.env.CI == null }
    )
};

const flowBridgeTask = {
  title: "Flowtype Bridge",
  task: async () => {
    const bridgePath = path.join(TEMPLATE_DIR, "flowBridge.hbs");
    const bridgeTemplateSrc = await readFileAsync(bridgePath, {
      encoding: "utf8"
    });

    const template = Handlebars.compile(bridgeTemplateSrc);
    const entrypointPath = path.join(ROOT_DIR, pjson.source);

    for (let outputPath of Object.values(entrypoints)) {
      const context = {
        relativeEntrypoint: path.relative(
          path.dirname(outputPath),
          entrypointPath
        )
      };
      const bridgeSrc = template(context);
      await writeFileAsync(outputPath + ".flow", bridgeSrc, "utf8");
    }
  }
};

const generateTask = {
  title: "Generate",
  task: () =>
    new Listr([entrypointsTask, flowBridgeTask], {
      concurrent: process.env.CI == null
    })
};

const tasks = new Listr([cleanTask, bundleTask, generateTask], {
  renderer: LoadingBarRenderer,
  collapse: true,
  onEnd: err => {
    if (err) {
      console.error(err);
      shell.exit(1);
    }
    calculateResults("*/*.{js,mjs}");
    console.log(printResults());
    saveResults();

    shell.exit(0);
  }
});

tasks.run();
