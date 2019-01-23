import * as fs from "fs";
import * as path from "path";

import createLogger from "progress-estimator";
import * as shell from "shelljs";

import { asyncExec } from "./asyncExec.js";
import { LIB_CJS_DIR, LIB_DIR } from "./paths.js";

const flowBridgeSrc = `// @flow

export * from "../src/exports.js";
`;

// clean the lib folder
async function clean() {
  shell.rm("-rf", LIB_DIR);
  shell.rm("-rf", LIB_CJS_DIR);
  shell.mkdir(LIB_DIR);
  shell.mkdir(LIB_CJS_DIR);
}

// run microbundle
async function bundle() {
  return Promise.all([
    asyncExec("yarn --silent bundle:module", true),
    asyncExec("yarn --silent bundle:commonjs", true)
  ]);
}

// add flowtype bridge
async function flowBridge() {
  fs.writeFileSync(
    path.resolve(LIB_DIR, "./exports.js.flow"),
    flowBridgeSrc,
    "utf8"
  );
  fs.writeFileSync(
    path.resolve(LIB_CJS_DIR, "./exports.js.flow"),
    flowBridgeSrc,
    "utf8"
  );
}

async function build() {
  const logger = createLogger();

  try {
    await logger(clean(), "Cleaning lib folder");
    await logger(flowBridge(), "Creating flowtype bridge");
    await logger(bundle(), "Bundling");
  } catch (err) {
    console.error(err);
  }
}

build();
