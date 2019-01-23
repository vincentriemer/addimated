// @flow

import { AnimatedValue } from "./AnimatedValue";

class Manager {
  ticking: boolean;
  animatedValues: Set<AnimatedValue>;

  constructor() {
    this.ticking = false;
    this.animatedValues = new Set();
  }

  attachValue(value: AnimatedValue) {
    this.animatedValues.add(value);
  }

  detatchValue(value: AnimatedValue) {
    this.animatedValues.delete(value);
  }

  requestTick() {
    if (!this.ticking) {
      window.requestAnimationFrame(this.__update.bind(this));
      this.ticking = true;
    }
  }

  __update(timestamp: number) {
    this.ticking = false;

    const valsToFlush: AnimatedValue[] = [];
    for (const animatedValue of this.animatedValues) {
      const maybeVal = animatedValue.step(timestamp);
      if (maybeVal) {
        valsToFlush.push(maybeVal);
      }
    }

    if (valsToFlush.length > 0) {
      valsToFlush.forEach(anim => anim.flush());
      this.requestTick();
    }
  }
}

export { Manager };
