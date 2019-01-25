const chalk = require("chalk");

const BAR_WIDTH = 20;

class LoadingBar {
  constructor(task) {
    this.task = task;
    this.loadingIteration = 0;
    this.doneIteration = 0;
    this.endIteration = 0;
  }

  renderDoneBar(forceDone) {
    const message = "Done";

    if (forceDone) {
      const output = `${this.task.title} ${chalk.green(`[${message}]`)}`;
      return [output, true];
    }

    const printedMessage = message.substr(
      0,
      Math.floor(this.doneIteration / 2)
    );

    const bar = new Array(
      Math.max(0, BAR_WIDTH - printedMessage.length - this.doneIteration)
    ).fill(" ");

    const isDone = bar.length === 0;

    const barEndColor = isDone ? chalk.green : chalk.blue;

    const output = `${this.task.title} ${chalk.green(
      "[" + printedMessage
    )}${bar.join("")}${barEndColor("]")}`;

    let done = bar.length === 0;
    if (done) {
      done = this.endIteration > 10;
      this.endIteration++;
    }

    return [output, done];
  }

  getBarPadding(size) {
    return new Array(size).fill(" ");
  }

  renderLoadingBar() {
    const bar = new Array(BAR_WIDTH).fill(" ");

    const barAltIndex = this.loadingIteration % (BAR_WIDTH * 2);

    let index = this.loadingIteration % BAR_WIDTH;
    if (barAltIndex >= BAR_WIDTH) {
      index = BAR_WIDTH - 1 - index;
    }

    bar[index] = chalk.blue("·");

    return bar.join("");
  }

  render(forceDone) {
    const task = this.task;

    if (task.isCompleted()) {
      const output = this.renderDoneBar(forceDone);
      this.doneIteration++;
      return output;
    } else if (task.hasFailed()) {
      const output = `${task.title} ${chalk.red("[Failed]")}`;
      return [output, false];
    } else if (task.isSkipped()) {
      const output = `${task.title} ${chalk.dim("[Skipped]")}`;
      return [output, true];
    } else if (task.isPending()) {
      const output = `${this.task.title} ${chalk.blue(
        "["
      )}${this.renderLoadingBar()}${chalk.blue("]")}`;

      this.loadingIteration++;

      return [output, false];
    } else {
      const output = chalk.dim(`${task.title}`);
      return [output, false];
    }
  }
}

module.exports = LoadingBar;
