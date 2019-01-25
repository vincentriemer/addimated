import * as Animated from "@unstable/addimated";
import React from "react";

import { useLayoutViewportSize } from "../utils/useLayoutViewportSize";
import styles from "./interruption.module.css";

const TARGET_SIZE = 150;
const ANIMATION_PADDING = 10;

function getRandomNumberWithMinDelta(prevVal, minDelta = 0.1) {
  let nextVal = prevVal;

  while (Math.abs(nextVal - prevVal) <= minDelta) {
    nextVal = Math.random();
  }

  return nextVal;
}

const InterruptionExample = props => {
  const [animationType, setAnimationType] = React.useState("timing");
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);

  const { width, height } = useLayoutViewportSize();

  const setRandomPositionWithAnimationType = React.useCallback(animType => {
    setAnimationType(animType);
    setX(x => getRandomNumberWithMinDelta(x));
    setY(y => getRandomNumberWithMinDelta(y));
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

  const [xAnim, isXAnimating] = Animated.useAnimatedValue(x, animationFactory);
  const [yAnim, isYAnimating] = Animated.useAnimatedValue(y, animationFactory);

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
            willChange: isXAnimating || isYAnimating ? "transform" : "auto",
            transform: [
              {
                translateX: Animated.interpolate(xAnim, {
                  inputRange: [0, 1],
                  outputRange: [
                    ANIMATION_PADDING,
                    width - TARGET_SIZE - ANIMATION_PADDING
                  ]
                })
              },
              {
                translateY: Animated.interpolate(yAnim, {
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
