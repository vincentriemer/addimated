const tasks = arr => arr.join(" && ");

module.exports = {
  hooks: {
    "pre-commit": tasks([
      "lint-staged",
      "yarn build",
      "git add scripts/results.json"
    ])
  }
};
