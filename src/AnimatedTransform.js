// @flow

import { Animated } from "./Animated";
import { AnimatedWithChildren } from "./AnimatedWithChildren";

class AnimatedTransform extends AnimatedWithChildren {
  transforms: Object[];

  constructor(transforms: Object[]) {
    super();
    this.transforms = transforms;
  }

  __getValue(): Array<Object> {
    return this.transforms.map(transform => {
      var result = {};
      for (var key in transform) {
        var value = transform[key];
        if (value instanceof Animated) {
          result[key] = value.__getValue();
        } else {
          result[key] = value;
        }
      }
      return result;
    });
  }

  __getAnimatedValue(): Array<Object> {
    return this.transforms.map(transform => {
      var result = {};
      for (var key in transform) {
        var value = transform[key];
        if (value instanceof Animated) {
          result[key] = value.__getAnimatedValue();
        } else {
          // All transform components needed to recompose matrix
          result[key] = value;
        }
      }
      return result;
    });
  }

  __attach(): void {
    this.transforms.forEach(transform => {
      for (var key in transform) {
        var value = transform[key];
        if (value instanceof Animated) {
          value.__addChild(this);
        }
      }
    });
  }

  __detach(): void {
    this.transforms.forEach(transform => {
      for (var key in transform) {
        var value = transform[key];
        if (value instanceof Animated) {
          value.__removeChild(this);
        }
      }
    });
  }
}

export { AnimatedTransform };
