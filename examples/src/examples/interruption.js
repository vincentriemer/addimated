// @flow

import * as Animated from "@unstable/addimated";
import React from "react";

import { useLayoutViewportSize } from "../utils/useLayoutViewportSize";
import styles from "./interruption.module.css";

const TARGET_SIZE = 150;
const ANIMATION_PADDING = 20;

function getRandomNumberWithMinDelta(prevVal, minDelta = 0.1) {
  let nextVal = prevVal;

  while (Math.abs(nextVal - prevVal) <= minDelta) {
    nextVal = Math.random();
  }

  return nextVal;
}

const InterruptionExample = () => {
  const [animationType, setAnimationType] = React.useState("timing");
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const { width, height } = useLayoutViewportSize();

  const setRandomPositionWithAnimationType = React.useCallback(animType => {
    setAnimationType(animType);
    setPosition(({ x, y }) => ({
      x: getRandomNumberWithMinDelta(x),
      y: getRandomNumberWithMinDelta(y)
    }));
  }, []);

  const handleSpringClick = React.useCallback(() => {
    setRandomPositionWithAnimationType("spring");
  }, []);

  const handleTimingClick = React.useCallback(() => {
    setRandomPositionWithAnimationType("timing");
  }, []);

  const animationFactory = React.useMemo(() => {
    return (animatedValue, toValue) => {
      switch (animationType) {
        case "timing":
          return Animated.timing(animatedValue, {
            toValue,
            easing: Animated.Easing.inOut(Animated.Easing.quad),
            duration: 600
          });
        case "spring":
          return Animated.spring(animatedValue, {
            toValue,
            speed: 1,
            bounciness: 15
          });
        default:
          throw new Error(`Unknown animationType '${animationType}'`);
      }
    };
  }, [animationType]);

  const [anim, isAnimating] = Animated.useAnimatedValueXY(
    position,
    animationFactory
  );

  return (
    <div className={styles.app}>
      <header>
        <button onClick={handleSpringClick}>Move with Spring</button>
        <button onClick={handleTimingClick}>Move with Timing</button>
      </header>
      <main>
        <Animated.div
          className={styles.target}
          style={{
            width: TARGET_SIZE,
            height: TARGET_SIZE,
            willChange: isAnimating ? "transform" : "auto",
            transform: [
              {
                translateX: Animated.interpolate(anim.x, {
                  inputRange: [0, 1],
                  outputRange: [
                    ANIMATION_PADDING,
                    width - TARGET_SIZE - ANIMATION_PADDING
                  ]
                })
              },
              {
                translateY: Animated.interpolate(anim.y, {
                  inputRange: [0, 1],
                  outputRange: [
                    ANIMATION_PADDING,
                    height - TARGET_SIZE - ANIMATION_PADDING
                  ]
                })
              }
            ]
          }}
        />
      </main>
    </div>
  );
};

export default InterruptionExample;
