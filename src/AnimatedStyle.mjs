// @flow

import { Animated } from "./Animated";
import { AnimatedTransform } from "./AnimatedTransform";
import { AnimatedWithChildren } from "./AnimatedWithChildren";
import { FlattenStyle } from "./FlattenStyle";

class AnimatedStyle extends AnimatedWithChildren {
  style: Object;

  constructor(style: any) {
    super();
    style = FlattenStyle(style) || {};
    if (style.transform && !(style.transform instanceof Animated)) {
      style = {
        ...style,
        transform: new AnimatedTransform(style.transform)
      };
    }
    this.style = style;
  }

  __getValue(): Object {
    var style = {};
    for (var key in this.style) {
      var value = this.style[key];
      if (value instanceof Animated) {
        style[key] = value.__getValue();
      } else {
        style[key] = value;
      }
    }
    return style;
  }

  __getAnimatedValue(): Object {
    var style = {};
    for (var key in this.style) {
      var value = this.style[key];
      if (value instanceof Animated) {
        style[key] = value.__getAnimatedValue();
      }
    }
    return style;
  }

  __attach(): void {
    for (let key in this.style) {
      const value = this.style[key];
      if (value instanceof Animated) {
        value.__addChild(this);
      }
    }
  }

  __detach(): void {
    for (let key in this.style) {
      const value = this.style[key];
      if (value instanceof Animated) {
        value.__removeChild(this);
      }
    }
  }
}

export { AnimatedStyle };
