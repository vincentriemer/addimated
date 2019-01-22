// @flow

import invariant from "invariant";

class Animated {
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
  __addChild(_child: Animated): void {
    invariant(false, `__addChild is not implemented`);
  }
  __removeChild(_child: Animated): void {
    invariant(false, `__removeChild is not implemented`);
  }
  __getChildren(): Set<Animated> {
    return new Set();
  }
}

export { Animated };
