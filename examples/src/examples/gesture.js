import * as Animated from "@unstable/addimated";
import React from "react";
import { useGesture } from "react-with-gesture";

import styles from "./gesture.module.css";

const TARGET_SIZE = 150;

const GestureExample = props => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [anim] = React.useState(() =>
    Animated.createAnimatedValueXY({
      x: 0,
      y: 0
    })
  );

  const onAction = React.useCallback(
    event => {
      if (event.first) {
        anim.stopAnimations(({ x, y }) => {
          anim.setOffset({ x, y });
          anim.setValue({ x: event.delta[0], y: event.delta[1] });
          setIsAnimating(true);
          setIsDragging(true);
        });
      } else if (!event.down) {
        anim.flattenOffset();
        const velocity = {
          x: event.velocity * event.direction[0] * 1000,
          y: event.velocity * event.direction[1] * 1000
        };
        Animated.spring(anim, {
          toValue: { x: 0, y: 0 },
          velocity,
          speed: 0.5
        }).start(({ finished }) => {
          if (finished) {
            setIsAnimating(false);
          }
        });
        setIsDragging(false);
      } else {
        anim.setValue({ x: event.delta[0], y: event.delta[1] });
      }
    },
    [anim]
  );

  const bind = useGesture({ onAction });

  const [draggingAnim, isDragAnimating] = Animated.useAnimatedValue(
    isDragging ? 1 : 0,
    (animVal, value) => {
      if (value === 1) {
        const easing = Animated.Easing.inOut(Animated.Easing.quad);

        const animation = Animated.parallel([
          Animated.timing(animVal, {
            toValue: value + 0.5,
            easing,
            duration: 300
          }),
          Animated.timing(animVal, {
            toValue: value,
            easing,
            duration: 300,
            delay: 100
          })
        ]);

        return animation;
      }
      return Animated.spring(animVal, { toValue: value });
    }
  );

  return (
    <div className={styles.app}>
      <main>
        <Animated.div
          className={styles.target}
          style={{
            width: TARGET_SIZE,
            height: TARGET_SIZE,
            willChange: isAnimating ? "transform" : "auto",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            WebkitUserSelect: "none",
            transform: anim.getTranslateTransform().concat([
              {
                scale: Animated.interpolate(draggingAnim, {
                  inputRange: [0, 1],
                  outputRange: [1, 0.75]
                })
              }
            ])
          }}
          {...bind()}
        >
          <Animated.div
            style={{
              willChange: isDragAnimating ? "opacity" : "auto",
              opacity: draggingAnim
            }}
          />
        </Animated.div>
      </main>
    </div>
  );
};

export default GestureExample;
