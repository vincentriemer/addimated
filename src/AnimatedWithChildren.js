// @flow

import invariant from "invariant";

import { Animated } from "./Animated";

class AnimatedWithChildren extends Animated {
  children: Set<Animated>;

  constructor() {
    super();
    this.children = new Set();
  }

  // stubbed methods
  __attach(): void {
    invariant(false, `__attach is not implemented`);
  }
  __detach(): void {
    invariant(false, `__detach is not implemented`);
  }
  __getValue(): mixed {
    invariant(false, `__getValue is not implemented`);
  }
  __getAnimatedValue(): mixed {
    return this.__getValue();
  }

  // implemented methods
  __addChild(child: Animated): void {
    if (this.children.size === 0) {
      this.__attach();
    }
    this.children.add(child);
  }

  __removeChild(child: Animated): void {
    if (!this.children.delete(child)) {
      console.warn(`Attempted to remove child that doesn't exist`);
    }
    if (this.children.size === 0) {
      this.__detach();
    }
  }

  __getChildren(): Set<Animated> {
    return this.children;
  }
}

export { AnimatedWithChildren };
