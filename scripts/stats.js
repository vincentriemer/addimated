"use strict";
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const filesize = require("filesize");
const chalk = require("chalk");
const gzip = require("gzip-size");
const Table = require("cli-table");

const { SCRIPT_DIR, LIB_DIR } = require("./paths");

const prevBuildResults = fs.existsSync(path.join(SCRIPT_DIR, "results.json"))
  ? require("./results.json")
  : { bundleSizes: [] };

const currentBuildResults = {
  bundleSizes: [...prevBuildResults.bundleSizes]
};

function saveResults() {
  fs.writeFileSync(
    path.join(SCRIPT_DIR, "results.json"),
    JSON.stringify(currentBuildResults, null, 2)
  );
}

function fractionalChange(prev, current) {
  return (current - prev) / prev;
}

function percentChangeString(change) {
  if (!isFinite(change)) {
    // When a new package is created
    return "n/a";
  }
  const formatted = (change * 100).toFixed(1);
  if (/^-|^0(?:\.0+)$/.test(formatted)) {
    return `${formatted}%`;
  } else {
    return `+${formatted}%`;
  }
}

const resultsHeaders = [
  "Bundle",
  "Prev Size",
  "Current Size",
  "Diff",
  "Prev Gzip",
  "Current Gzip",
  "Diff"
];

function generateResultsArray(current, prevResults) {
  return current.bundleSizes
    .map(result => {
      const prev = prevResults.bundleSizes.filter(
        res => res.filename === result.filename
      )[0];
      if (result === prev) {
        // We didn't rebuild this bundle.
        return;
      }

      const size = result.size;
      const gzip = result.gzip;
      let prevSize = prev ? prev.size : 0;
      let prevGzip = prev ? prev.gzip : 0;

      return {
        filename: result.filename,
        prevSize: filesize(prevSize),
        prevFileSize: filesize(size),
        prevFileSizeChange: fractionalChange(prevSize, size),
        prevFileSizeAbsoluteChange: size - prevSize,
        prevGzip: filesize(prevGzip),
        prevGzipSize: filesize(gzip),
        prevGzipSizeChange: fractionalChange(prevGzip, gzip),
        prevGzipSizeAbsoluteChange: gzip - prevGzip
      };
      // Strip any nulls
    })
    .filter(f => f);
}

function calculateResults(bundleGlob) {
  const bundles = glob.sync(path.join(LIB_DIR, bundleGlob));

  bundles.forEach(path => {
    const filename = path
      .split("/")
      .slice(-2)
      .join("/");

    const data = fs.readFileSync(path, { encoding: "utf8" });
    const size = Buffer.byteLength(data);
    const gzipSize = gzip.sync(data);

    const currentSizes = currentBuildResults.bundleSizes;
    const recordIndex = currentSizes.findIndex(
      record => record.filename === filename
    );
    const index = recordIndex !== -1 ? recordIndex : currentSizes.length;
    currentSizes[index] = {
      filename,
      size,
      gzip: gzipSize
    };
  });
}

function printResults() {
  const table = new Table({
    head: resultsHeaders.map(label => chalk.gray.yellow(label))
  });

  const results = generateResultsArray(currentBuildResults, prevBuildResults);
  results.forEach(result => {
    table.push([
      chalk.white.bold(`${result.filename}`),
      chalk.gray.bold(result.prevSize),
      chalk.white.bold(result.prevFileSize),
      percentChangeString(result.prevFileSizeChange),
      chalk.gray.bold(result.prevGzip),
      chalk.white.bold(result.prevGzipSize),
      percentChangeString(result.prevGzipSizeChange)
    ]);
  });

  return table.toString();
}

module.exports = {
  calculateResults,
  printResults,
  saveResults
};
