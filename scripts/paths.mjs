import * as path from "path";

export const SCRIPT_DIR = path.dirname(import.meta.url.substr("file:/".length));
export const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
export const LIB_DIR = path.resolve(ROOT_DIR, "./lib");
export const LIB_CJS_DIR = path.resolve(ROOT_DIR, "./lib-commonjs");
export const SRC_DIR = path.resolve(ROOT_DIR, "./src");
