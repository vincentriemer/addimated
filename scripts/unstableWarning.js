import * as path from "path";

import { ROOT_DIR } from "./paths";

const maybeScopedDir = path.resolve(ROOT_DIR, "..").split(path.sep);
const maybeScopedDirname = maybeScopedDir[maybeScopedDir.length - 1];

var nex = process.env.npm_execpath;

if (nex && maybeScopedDirname === "@unstable") {
  const isNpm = nex.includes("npm");

  const prefix = isNpm
    ? `npm \u001b[43m\u001b[30mWARN\u001b[0m \x1b[35munstable\u001b[0m`
    : `\x1b[33mwarning\u001b[0m`;

  console.warn(
    `${prefix} @unstable/addimated is an experimental package, continue at your own risk`
  );
}
