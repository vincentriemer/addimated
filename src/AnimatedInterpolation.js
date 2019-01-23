// @flow

import invariant from "invariant";

import { Animated } from "./Animated";
import { AnimatedWithChildren } from "./AnimatedWithChildren";
import { Interpolation } from "./Interpolation";
import { type InterpolationConfigType } from "./Interpolation";

class AnimatedInterpolation extends AnimatedWithChildren {
  parent: Animated;
  interpolation: (input: number) => number | string;

  constructor(
    parent: Animated,
    interpolation: (input: number) => number | string
  ) {
    super();
    this.parent = parent;
    this.interpolation = interpolation;
  }

  __getValue() {
    const parentValue = this.parent.__getValue();
    invariant(
      typeof parentValue === "number",
      "Cannot interpolate an input which is not a number."
    );
    return this.interpolation(parentValue);
  }

  interpolate(config: InterpolationConfigType): AnimatedInterpolation {
    return new AnimatedInterpolation(this, Interpolation.create(config));
  }

  __attach(): void {
    this.parent.__addChild(this);
  }

  __detach(): void {
    this.parent.__removeChild(this);
  }
}

export { AnimatedInterpolation };
