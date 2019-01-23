// @flow
/* eslint-disable no-unused-vars */

import invariant from "invariant";

import { type AnimatedValue } from "./AnimatedValue";

export type AnimationConfig = {};
export type EndResult = { finished: boolean };
export type EndCallback = (result: EndResult) => void;

class Animation {
  active: boolean = false;
  ended: boolean = false;
  endCallback: ?EndCallback;

  start(
    animatedVal: AnimatedValue,
    fromValue: number,
    onEnd: ?EndCallback
  ): Animation[] {
    invariant(false, `start is not implemented`);
  }
  step(timestamp: number): void {
    invariant(false, `step is not implemented`);
  }
  getValue(): number {
    invariant(false, `getValue is not implemented`);
  }
  stop(finished?: boolean): void {
    invariant(false, `stop is not implemented`);
  }
}

export { Animation };
