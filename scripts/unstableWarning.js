import * as path from "path";

import { ROOT_DIR } from "./paths";

const maybeScopedDir = path.resolve(ROOT_DIR, "..").split(path.sep);
const maybeScopedDirname = maybeScopedDir[maybeScopedDir.length - 1];

if (maybeScopedDirname === "@unstable") {
  console.warn(
    `\u001b[33mwarning\u001b[0m @unstable/addimated is an experimental package, continue at your own risk`
  );
}
