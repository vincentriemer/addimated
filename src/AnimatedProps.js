// @flow

import { Animated } from "./Animated";
import { AnimatedStyle } from "./AnimatedStyle";
class AnimatedProps extends Animated {
  props: Object;
  callback: () => void;

  constructor(props: Object, callback: () => void) {
    super();
    if (props.style) {
      props = {
        ...props,
        style: new AnimatedStyle(props.style)
      };
    }
    this.props = props;
    this.callback = callback;
    this.__attach();
  }

  __getValue(): Object {
    var props = {};
    for (var key in this.props) {
      var value = this.props[key];
      if (value instanceof Animated) {
        props[key] = value.__getValue();
      } else {
        props[key] = value;
      }
    }
    return props;
  }

  __getAnimatedValue(): Object {
    var props = {};
    for (var key in this.props) {
      var value = this.props[key];
      if (value instanceof Animated) {
        props[key] = value.__getAnimatedValue();
      }
    }

    return props;
  }

  __attach(): void {
    for (var key in this.props) {
      var value = this.props[key];
      if (value instanceof Animated) {
        value.__addChild(this);
      }
    }
  }

  __detach(): void {
    for (var key in this.props) {
      var value = this.props[key];
      if (value instanceof Animated) {
        value.__removeChild(this);
      }
    }
  }

  update(): void {
    this.callback();
  }
}

export { AnimatedProps };
