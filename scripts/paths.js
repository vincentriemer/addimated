const path = require("path");

const SCRIPT_DIR = __dirname;
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const LIB_DIR = path.resolve(ROOT_DIR, "./lib");
const SRC_DIR = path.resolve(ROOT_DIR, "./src");
const TEMPLATE_DIR = path.resolve(SCRIPT_DIR, "./templates");

module.exports = {
  SCRIPT_DIR,
  ROOT_DIR,
  LIB_DIR,
  SRC_DIR,
  TEMPLATE_DIR
};
