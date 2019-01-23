import * as shell from "shelljs";

export function asyncExec(command, silent = false) {
  return new Promise((resolve, reject) =>
    shell.exec(command, { silent }, (code, value, error) => {
      if (code !== 0) {
        return reject(error);
      }
      resolve(value);
    })
  );
}
