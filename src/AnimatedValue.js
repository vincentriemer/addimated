// @flow

import { type Animated } from "./Animated";
import { AnimatedProps } from "./AnimatedProps";
import { AnimatedWithChildren } from "./AnimatedWithChildren";
import { Animation, type EndCallback } from "./Animation";
import { type Manager } from "./Manager";

function _flush(rootNode: AnimatedValue): void {
  const animatedStyles = new Set();
  function findAnimatedStyles(node: Animated | AnimatedProps) {
    if (node instanceof AnimatedProps) {
      animatedStyles.add(node);
    } else {
      node.__getChildren().forEach(findAnimatedStyles);
    }
  }
  findAnimatedStyles(rootNode);
  animatedStyles.forEach(animatedStyle => animatedStyle.update());
}

class AnimatedValue extends AnimatedWithChildren {
  manager: Manager;

  model: number;
  offset: number;
  animations: Animation[];

  previousTimestamp: ?number;
  previousValue: ?number;
  velocity: ?number;

  // TODO: Tracking
  // TODO: Listeners

  constructor(value: number, manager: Manager) {
    super();
    this.manager = manager;
    this.model = value;
    this.offset = 0;
    this.animations = [];
  }

  __attach() {
    this.manager.attachValue(this);
    this.flush();
  }

  __detach() {
    this.stopAnimations();
    this.manager.detatchValue(this);
  }

  __getValue(): number {
    return this.animations.reduce((acc, anim) => {
      return acc + anim.getValue();
    }, this.offset + this.model);
  }

  /**
   * Directly set the value.  This will stop any animations running on the value
   * and update all the bound properties.
   */
  setValue(value: number): void {
    this.stopAnimations();
    this.model = value;
    this.flush();
  }

  /**
   * Sets an offset that is applied on top of whatever value is set, whether via
   * `setValue`, an animation, or `Animated.event`.  Useful for compensating
   * things like the start of a pan gesture.
   */
  setOffset(offset: number): void {
    this.offset = offset;
  }

  /**
   * Merges the offset value into the base value and resets the offset to zero.
   * The final output of the value is unchanged.
   */
  flattenOffset(): void {
    this.model += this.offset;
    this.offset = 0;
  }

  /**
   * Sets the offset value to the base value, and resets the base value to zero.
   * The final output of the value is unchanged.
   */
  extractOffset(): void {
    this.offset += this.model;
    this.model = 0;
  }

  step(timestamp: number): ?AnimatedValue {
    if (this.animations.length === 0) {
      this.velocity = null;
      this.previousValue = null;
      this.previousTimestamp = null;
      return null;
    }

    this.animations.forEach(anim => {
      anim.step(timestamp);
    });

    this.animations = this.animations.filter(anim => !anim.ended);

    const nextValue = this.__getValue();

    const prevVal = this.previousValue;
    const prevTime = this.previousTimestamp;
    if (prevVal && prevTime) {
      this.velocity = (nextValue - prevVal) / (timestamp - prevTime);
    }

    this.previousTimestamp = timestamp;
    this.previousValue = nextValue;
    return this;
  }

  animate(animation: Animation, callback: ?EndCallback): void {
    this.animations = animation.start(this, this.model, callback);
    this.manager.requestTick();
  }

  stopAnimations(callback?: ?(value: number) => void): void {
    this.animations.forEach(anim => {
      anim.stop();
    });
    this.animations = [];
    callback && callback(this.__getValue());
  }

  flush(): void {
    _flush(this);
  }
}

export { AnimatedValue };
