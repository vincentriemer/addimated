// @flow

import invariant from "invariant";

import { type AnimatedValue } from "./AnimatedValue";
import { Animation, type AnimationConfig, type EndCallback } from "./Animation";
import * as Easing from "./Easing";
import { withDefault } from "./WithDefault";

const easeInOut = Easing.inOut(Easing.ease);

type TimingAnimationConfigSingle = AnimationConfig & {
  toValue: number,
  easing?: (value: number) => number,
  duration?: number,
  delay?: number
};

class TimingAnimation extends Animation {
  startTime: ?number;
  currentTime: ?number;

  fromValue: number;
  toValue: number;
  duration: number;
  delay: number;
  easing: (value: number) => number;

  constructor(config: TimingAnimationConfigSingle) {
    super();

    this.startTime = null;
    this.currentTime = null;

    this.toValue = config.toValue;
    this.easing = withDefault(config.easing, easeInOut);
    this.duration = withDefault(config.duration, 500);
    this.delay = withDefault(config.delay, 0);
  }

  start(
    animatedVal: AnimatedValue,
    fromValue: number,
    onEnd: ?EndCallback
  ): Animation[] {
    animatedVal.model = this.toValue;

    this.active = true;
    this.fromValue = fromValue - this.toValue;
    this.toValue = 0;
    this.endCallback = onEnd;

    this.currentTime = performance.now();
    this.startTime = this.currentTime + this.delay;

    return animatedVal.animations.concat(this);
  }

  step(timestamp: number): void {
    const startTime = this.startTime;
    if (startTime == null) {
      console.warn("Attempted to step an animation which hasn't started");
      return;
    }

    if (!this.ended && timestamp >= startTime + this.duration) {
      this.stop(true);
    }

    this.currentTime = timestamp;
  }

  getValue(): number {
    const toValue = this.toValue;
    const fromValue = this.fromValue;

    const currentTime = this.currentTime;
    const startTime = this.startTime;
    invariant(
      currentTime && startTime,
      "Attempted to get the value of an animation which hasn't started"
    );

    if (currentTime <= startTime) {
      return fromValue;
    } else {
      return (
        fromValue +
        this.easing((currentTime - startTime) / this.duration) *
          (toValue - fromValue)
      );
    }
  }

  stop(finished?: boolean = false): void {
    this.ended = true;
    this.endCallback && this.endCallback({ finished });
  }
}

export { TimingAnimation };
