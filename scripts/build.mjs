import * as fs from "fs";
import * as path from "path";

import createLogger from "progress-estimator";
import * as shell from "shelljs";

import { asyncExec } from "./asyncExec.mjs";
import { LIB_DIR } from "./paths.mjs";

const flowBridgeSrc = `// @flow

export * from "../src/exports.mjs";
`;

// clean the lib folder
async function clean() {
  shell.rm("-rf", LIB_DIR);
}

// run microbundle
async function bundle() {
  return asyncExec("yarn microbundle", true);
}

// add flowtype bridge
async function flowBridge() {
  fs.writeFileSync(
    path.resolve(LIB_DIR, "./addimated.flow.js"),
    flowBridgeSrc,
    "utf8"
  );
}

async function build() {
  const logger = createLogger();

  try {
    await logger(clean(), "Cleaning lib folder");
    const output = await logger(bundle(), "Bundling");
    await logger(flowBridge(), "Creating flowtype bridge");
  } catch (err) {
    console.error(err);
  }
}

build();
