// @flow

import invariant from "invariant";
import React from "react";

import * as Animated from "./index";

function defaultAnimationFactory(
  animatedValue: Animated.Value,
  toValue: number
) {
  return Animated.timing(animatedValue, { toValue });
}

function useInitializedRef<T>(initializer: () => T): { current: T | null } {
  const initialValue = React.useMemo(initializer, []);
  return React.useRef(initialValue);
}

function useAnimatedValue(
  value: number,
  animationFactory: typeof defaultAnimationFactory = defaultAnimationFactory
) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const animatedValueRef = useInitializedRef(() =>
    Animated.createAnimatedValue(value)
  );
  const animatedValue = animatedValueRef.current;
  invariant(animatedValue, "");
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

export * from "./index";
export { useAnimatedValue };
