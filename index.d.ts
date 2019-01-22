import * as React from "@types/react";
import * as ReactNative from "@types/react-native";

declare module "@unstable/addimated" {
  interface AnimatedValue {
    setValue(value: number): void;
    setOffset(offset: number): void;

    flattenOffset(): void;
    extractOffset(): void;

    stopAnimations(callback?: (value: number) => void): void;
  }

  interface AnimatedValueXY {
    x: AnimatedValue;
    y: AnimatedValue;

    setValue(value: { x: number; y: number }): void;
    setOffset(offset: { x: number; y: number }): void;

    flattenOffset(): void;
    extractOffset(): void;

    stopAnimations(callback?: (value: { x: number; y: number }) => void): void;

    /**
     * Converts `{x, y}` into `{left, top}` for use in style, e.g.
     *
     *```javascript
     *  style={this.state.anim.getLayout()}
     *```
     */
    getLayout(): { [key: string]: AnimatedValue };

    /**
     * Converts `{x, y}` into a useable translation transform, e.g.
     *
     *```javascript
     *  style={{
     *    transform: this.state.anim.getTranslateTransform()
     *  }}
     *```
     */
    getTranslateTransform(): { [key: string]: AnimatedValue }[];
  }

  export function createAnimatedValue(value: number): AnimatedValue;
  export function createAnimatedValueXY(valueXY: {
    x: number;
    y: number;
  }): AnimatedValueXY;

  type InterpolationConfigType = {
    inputRange: number[];
    outputRange: number[] | string[];
    easing?: (input: number) => number;
    extrapolate?: ExtrapolateType;
    extrapolateLeft?: ExtrapolateType;
    extrapolateRight?: ExtrapolateType;
  };

  export function interpolate(
    value: AnimatedValue,
    config: InterpolationConfigType
  );

  type EndResult = { finished: boolean };
  type EndCallback = (result: EndResult) => void;

  export interface CompositeAnimation {
    start: (callback?: EndCallback) => void;
  }

  export function spring(
    value: AnimatedValue | AnimatedValueXY,
    config: SpringAnimationConfig
  ): CompositeAnimation;

  type ExtrapolateType = "extend" | "identity" | "clamp";

  interface SpringAnimationConfig {
    toValue: number | { x: number; y: number };
    overshootClamping?: boolean;
    restDisplacementThreshold?: number;
    restSpeedThreshold?: number;
    velocity?: number | { x: number; y: number };
    bounciness?: number;
    speed?: number;
    tension?: number;
    friction?: number;
    stiffness?: number;
    mass?: number;
    damping?: number;
    delay?: number;
  }

  export function timing(
    value: AnimatedValue | AnimatedValueXY,
    config: TimingAnimationConfig
  ): CompositeAnimation;

  interface TimingAnimationConfig {
    toValue: number | { x: number; y: number };
    easing?: (value: number) => number;
    duration?: number;
    delay?: number;
  }

  export function delay(time: number): CompositeAnimation;

  export function sequence(
    animations: Array<CompositeAnimation>
  ): CompositeAnimation;

  export function parallel(
    animations: Array<CompositeAnimation>
  ): CompositeAnimation;

  export function stagger(
    time: number,
    animations: Array<CompositeAnimation>
  ): CompositeAnimation;

  export function createAnimatedComponent(component: any): any;

  export const a: any;
  export const button: any;
  export const div: any;
  export const span: any;
  export const img: any;

  type EasingFunction = (value: number) => number;
  interface EasingStatic {
    step0: EasingFunction;
    step1: EasingFunction;
    linear: EasingFunction;
    ease: EasingFunction;
    quad: EasingFunction;
    cubic: EasingFunction;
    poly(n: number): EasingFunction;
    sin: EasingFunction;
    circle: EasingFunction;
    exp: EasingFunction;
    elastic(bounciness: number): EasingFunction;
    back(s: number): EasingFunction;
    bounce: EasingFunction;
    bezier(x1: number, y1: number, x2: number, y2: number): EasingFunction;
    in(easing: EasingFunction): EasingFunction;
    out(easing: EasingFunction): EasingFunction;
    inOut(easing: EasingFunction): EasingFunction;
  }

  export const Easing: EasingStatic;

  type AnimationFactory = (
    animatedValue: AnimatedValue,
    toValue: number
  ) => CompositeAnimation;

  export function useAnimatedValue(
    value: number,
    animationFactory?: AnimationFactory
  ): [AnimatedValue, boolean];
}
