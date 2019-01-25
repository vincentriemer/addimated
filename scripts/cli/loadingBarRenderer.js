const logUpdate = require("log-update");
const chalk = require("chalk");
const indentString = require("indent-string");
const cliTruncate = require("cli-truncate");
const figures = require("figures");
const stripAnsi = require("strip-ansi");

const LoadingBar = require("./loadingBar");

const subtaskPointer = chalk.yellow(figures.pointer);

const isDefined = x => x !== null && x !== undefined;

const loadingBars = {};
const getLoadingBar = task => {
  const { title } = task;

  if (!loadingBars[title]) {
    loadingBars[title] = new LoadingBar(task);
  }

  return loadingBars[title];
};

const renderHelper = (tasks, options, level) => {
  level = level || 0;

  let output = [];
  let isDone = true;

  for (const task of tasks) {
    if (task.isEnabled()) {
      const loadingBar = getLoadingBar(task);

      const [barOutput, done] = loadingBar.render(!!options.errored);

      // if (
      //   task.isPending() ||
      //   task.isSkipped() ||
      //   task.isCompleted() ||
      //   task.hasFailed()
      // ) {
      output.push(indentString(` ${barOutput}`, level, "  "));
      // }

      if (
        (task.isPending() || task.isSkipped() || task.hasFailed()) &&
        isDefined(task.output)
      ) {
        let data = task.output;

        if (typeof data === "string") {
          data = stripAnsi(
            data
              .trim()
              .split("\n")
              .filter(Boolean)
              .pop()
          );

          if (data === "") {
            data = undefined;
          }
        }

        if (isDefined(data)) {
          const out = indentString(
            `${figures.arrowRight} ${data}`,
            level,
            "  "
          );
          output.push(
            `   ${chalk.gray(cliTruncate(out, process.stdout.columns - 3))}`
          );
        }
      }

      if (done === false) {
        isDone = false;
      }

      if (task.hasSubtasks() > 0) {
        const [subOutput, subtasksDone] = renderHelper(
          task.subtasks,
          options,
          level + 1
        );

        if (
          (!subtasksDone || task.hasFailed() || options.collapse === false) &&
          (task.hasFailed() || options.showSubtasks)
        ) {
          output = output.concat(subOutput);
        }

        if (subtasksDone === false) {
          isDone = false;
        }
      }
    }
  }

  return [output.join("\n"), isDone];
};

const render = (tasks, options) => {
  const [output, isDone] = renderHelper(tasks, options);
  logUpdate(output);
  return isDone;
};

class LoadingBarRenderer {
  constructor(tasks, options) {
    this._tasks = tasks;
    this._options = Object.assign(
      {
        showSubtasks: true,
        collapse: true,
        clearOutput: false
      },
      options
    );
  }

  static get nonTTY() {
    return false;
  }

  render() {
    if (this._id) {
      // Do not render if we are already rendering
      return;
    }

    this._id = setInterval(() => {
      const done = render(this._tasks, this._options);
      if (done) {
        clearInterval(this._id);
        logUpdate.done();
        this._options.onEnd && this._options.onEnd();
      }
    }, (1 / 30) * 1000); // 30fps
  }

  end(err) {
    if (err) {
      if (this._id) {
        clearInterval(this._id);
        this._id = undefined;
      }

      render(this._tasks, { ...this._options, errored: true });
      logUpdate.done();
      this._options.onEnd && this._options.onEnd(err);
    }
  }
}

module.exports = LoadingBarRenderer;
