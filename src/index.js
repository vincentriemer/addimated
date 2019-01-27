// @flow

import invariant from "invariant";
import React from "react";

import { type Animated } from "./Animated";
import { AnimatedInterpolation } from "./AnimatedInterpolation";
import { AnimatedValue } from "./AnimatedValue";
import { AnimatedValueXY, type AnimatedValueXYInput } from "./AnimatedValueXY";
import { type AnimationConfig, type EndCallback } from "./Animation";
import { createAnimatedComponent } from "./createAnimatedComponent";
import * as Easing from "./Easing";
import { Interpolation } from "./Interpolation";
import { type InterpolationConfigType } from "./Interpolation";
import { Manager } from "./Manager";
import { SpringAnimation } from "./SpringAnimation";
import { TimingAnimation } from "./TimingAnimation";

type TimingAnimationConfig = AnimationConfig & {
  toValue: number | AnimatedValue | { x: number, y: number } | AnimatedValueXY,
  easing?: (value: number) => number,
  duration?: number,
  delay?: number
};

type SpringAnimationConfig = AnimationConfig & {
  toValue: number | AnimatedValue | { x: number, y: number } | AnimatedValueXY,
  overshootClamping?: boolean,
  restDisplacementThreshold?: number,
  restSpeedThreshold?: number,
  velocity?: number | { x: number, y: number },
  bounciness?: number,
  speed?: number,
  tension?: number,
  friction?: number,
  stiffness?: number,
  damping?: number,
  mass?: number,
  delay?: number
};

export type CompositeAnimation = {|
  start: (callback?: ?EndCallback) => void
|};

let globalManager: ?Manager;

function maybeVectorAnim<T: Object>(
  value: AnimatedValue | AnimatedValueXY,
  config: T,
  anim: (value: AnimatedValue, config: T) => CompositeAnimation
): ?CompositeAnimation {
  if (value instanceof AnimatedValueXY) {
    const configX = { ...config };
    const configY = { ...config };
    for (let key in config) {
      const { x, y } = config[key];
      if (x !== undefined && y !== undefined) {
        configX[key] = x;
        configY[key] = y;
      }
    }
    const aX = anim(value.x, configX);
    const aY = anim(value.y, configY);

    return parallel([aX, aY]);
  } else {
    return null;
  }
}

function spring(
  value: AnimatedValue | AnimatedValueXY,
  config: SpringAnimationConfig
): CompositeAnimation {
  const vectorAnim = maybeVectorAnim(value, config, spring);
  if (vectorAnim) return vectorAnim;

  const singleValue: any = value;
  const singleConfig: any = config;

  return {
    start: function(callback?: ?EndCallback): void {
      singleValue.animate(new SpringAnimation(singleConfig), callback);
    }
  };
}

function timing(
  value: AnimatedValue | AnimatedValueXY,
  config: TimingAnimationConfig
): CompositeAnimation {
  const vectorAnim = maybeVectorAnim(value, config, timing);
  if (vectorAnim) return vectorAnim;

  const singleValue: any = value;
  const singleConfig: any = config;

  return {
    start: function(callback?: ?EndCallback): void {
      singleValue.animate(new TimingAnimation(singleConfig), callback);
    }
  };
}

function sequence(animations: CompositeAnimation[]): CompositeAnimation {
  let current = 0;
  return {
    start: function(callback?: ?EndCallback) {
      const onComplete = function(result) {
        if (!result.finished) {
          callback && callback(result);
          return;
        }

        current++;

        if (current === animations.length) {
          callback && callback(result);
          return;
        }

        animations[current].start(onComplete);
      };

      if (animations.length === 0) {
        callback && callback({ finished: true });
      } else {
        animations[current].start(onComplete);
      }
    }
  };
}

function parallel(animations: CompositeAnimation[]): CompositeAnimation {
  let doneCount = 0;

  const result = {
    start: function(callback?: ?EndCallback) {
      if (doneCount === animations.length) {
        callback && callback({ finished: true });
        return;
      }

      animations.forEach(anim => {
        const cb = function(endResult) {
          doneCount++;
          if (doneCount === animations.length) {
            doneCount = 0;
            callback && callback(endResult);
            return;
          }
        };

        if (!anim) {
          cb({ finished: true });
        } else {
          anim.start(cb);
        }
      });
    }
  };

  return result;
}

function delay(time: number): CompositeAnimation {
  return timing(createAnimatedValue(0), {
    toValue: 0,
    duration: time
  });
}

function stagger(
  time: number,
  animations: CompositeAnimation[]
): CompositeAnimation {
  return parallel(
    animations.map((animation, i) => {
      return sequence([delay(time * i), animation]);
    })
  );
}

function createAnimatedValue(value: number): AnimatedValue {
  globalManager = globalManager || new Manager();
  return new AnimatedValue(value, globalManager);
}

function createAnimatedValueXY(
  valueIn: ?AnimatedValueXYInput
): AnimatedValueXY {
  globalManager = globalManager || new Manager();
  return new AnimatedValueXY(valueIn, globalManager);
}

function interpolate(
  value: Animated,
  config: InterpolationConfigType
): AnimatedInterpolation {
  return new AnimatedInterpolation(value, Interpolation.create(config));
}

const a = createAnimatedComponent("a");
const button = createAnimatedComponent("button");
const div = createAnimatedComponent("div");
const span = createAnimatedComponent("span");
const img = createAnimatedComponent("img");

function defaultAnimationFactory(
  animatedValue: AnimatedValue | AnimatedValueXY,
  toValue: number | { x: number, y: number }
) {
  return timing(animatedValue, { toValue });
}

function useInitializedRef<T>(initializer: () => T): { current: T | null } {
  const initialValue = React.useMemo(initializer, []);
  return React.useRef(initialValue);
}

function useAnimatedValue(
  value: number,
  animationFactory: typeof defaultAnimationFactory = defaultAnimationFactory
): [AnimatedValue, boolean] {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const animatedValueRef = useInitializedRef(() => createAnimatedValue(value));
  const animatedValue = animatedValueRef.current;
  invariant(animatedValue, "Animated value not populated");
  const prevValueRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (prevValueRef.current != null && value !== prevValueRef.current) {
      setIsAnimating(true);
      animationFactory(animatedValue, value).start(result => {
        if (result.finished) {
          setIsAnimating(false);
        }
      });
    }
    prevValueRef.current = value;
  }, [value, animationFactory]);

  return [animatedValue, isAnimating];
}

function useAnimatedValueXY(
  value: {| x: number, y: number |},
  animationFactory: typeof defaultAnimationFactory = defaultAnimationFactory
) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const animatedValueRef = useInitializedRef(() =>
    createAnimatedValueXY(value)
  );
  const animatedValue = animatedValueRef.current;
  invariant(animatedValue, "Animated value not populated");
  const prevValueRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (prevValueRef.current != null && value !== prevValueRef.current) {
      setIsAnimating(true);
      animationFactory(animatedValue, value).start(result => {
        if (result.finished) {
          setIsAnimating(false);
        }
      });
    }
    prevValueRef.current = value;
  }, [value.x, value.y, animationFactory]);

  return [animatedValue, isAnimating];
}

export {
  // Animated Values
  createAnimatedValue,
  createAnimatedValueXY,
  // Value Mutators
  interpolate,
  // Animations
  spring,
  timing,
  // Animation Monitors
  delay,
  sequence,
  parallel,
  stagger,
  // Components
  createAnimatedComponent,
  a,
  button,
  div,
  span,
  img,
  // Easing Functions
  Easing,
  // Hooks
  useAnimatedValue,
  useAnimatedValueXY
};

// types
export type { AnimatedValue as Value, AnimatedValueXY as ValueXY };
