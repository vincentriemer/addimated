// @flow

import invariant from "invariant";

import { AnimatedValue } from "./AnimatedValue";
import { AnimatedWithChildren } from "./AnimatedWithChildren";
import { type Manager } from "./Manager";

export type AnimatedValueXYInput = {
  x: number | AnimatedValue,
  y: number | AnimatedValue
};

class AnimatedValueXY extends AnimatedWithChildren {
  x: AnimatedValue;
  y: AnimatedValue;

  constructor(valueIn?: ?AnimatedValueXYInput, manager: Manager) {
    super();

    const value = valueIn || { x: 0, y: 0 };
    if (typeof value.x === "number" && typeof value.y === "number") {
      this.x = new AnimatedValue(value.x, manager);
      this.y = new AnimatedValue(value.y, manager);
    } else {
      invariant(
        value.x instanceof AnimatedValue && value.y instanceof AnimatedValue,
        "AnimatedValueXY must be initalized with an object of numbers or " +
          "AnimatedValues."
      );
      this.x = value.x;
      this.y = value.y;
    }
  }

  setValue(value: { x: number, y: number }): void {
    this.x.setValue(value.x);
    this.y.setValue(value.y);
  }

  setOffset(offset: { x: number, y: number }): void {
    this.x.setOffset(offset.x);
    this.y.setOffset(offset.y);
  }

  flattenOffset(): void {
    this.x.flattenOffset();
    this.y.flattenOffset();
  }

  extractOffset(): void {
    this.x.extractOffset();
    this.y.extractOffset();
  }

  __getValue(): { x: number, y: number } {
    return {
      x: this.x.__getValue(),
      y: this.y.__getValue()
    };
  }

  stopAnimations(callback?: ?(value: { x: number, y: number }) => void): void {
    const currentValue = this.__getValue();
    this.x.stopAnimations();
    this.y.stopAnimations();
    callback && callback(currentValue);
  }

  /**
   * Converts `{x, y}` into `{left, top}` for use in style, e.g.
   *
   *```javascript
   *  style={this.state.anim.getLayout()}
   *```
   */
  getLayout(): { left: AnimatedValue, top: AnimatedValue } {
    return {
      left: this.x,
      top: this.y
    };
  }

  /**
   * Converts `{x, y}` into a useable translation transform, e.g.
   *
   *```javascript
   *  style={{
   *    transform: this.state.anim.getTranslateTransform()
   *  }}
   *```
   */
  getTranslateTransform(): { [key: string]: AnimatedValue }[] {
    return [{ translateX: this.x }, { translateY: this.y }];
  }
}

export { AnimatedValueXY };
