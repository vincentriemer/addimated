// @flow

import invariant from "invariant";

import { type AnimatedValue } from "./AnimatedValue";
import { Animation, type AnimationConfig, type EndCallback } from "./Animation";
import {
  fromBouncinessAndSpeed,
  fromOrigamiTensionAndFriction
} from "./SpringConfig";
import { withDefault } from "./WithDefault";

type SpringAnimationConfigSingle = AnimationConfig & {
  toValue: number,
  overshootClamping?: boolean,
  restDisplacementThreshold?: number,
  restSpeedThreshold?: number,
  velocity?: number,
  bounciness?: number,
  speed?: number,
  tension?: number,
  friction?: number,
  stiffness?: number,
  damping?: number,
  mass?: number,
  delay?: number
};

class SpringAnimation extends Animation {
  currentValue: number;

  overshootClamping: boolean;
  restDisplacementThreshold: number;
  restSpeedThreshold: number;
  lastVelocity: number;
  startPosition: number;
  lastPosition: number;
  fromValue: number;
  toValue: any;
  stiffness: number;
  damping: number;
  mass: number;
  initialVelocity: number;
  delay: number;
  timeout: any;
  startTime: number;
  lastTime: number;
  frameTime: number;

  constructor(config: SpringAnimationConfigSingle) {
    super();

    this.overshootClamping = withDefault(config.overshootClamping, false);
    this.restDisplacementThreshold = withDefault(
      config.restDisplacementThreshold,
      0.001
    );
    this.restSpeedThreshold = withDefault(config.restSpeedThreshold, 0.001);
    this.initialVelocity = withDefault(config.velocity, NaN);
    this.lastVelocity = withDefault(config.velocity, NaN);
    this.toValue = config.toValue;
    this.delay = withDefault(config.delay, 0);

    if (
      config.stiffness !== undefined ||
      config.damping !== undefined ||
      config.mass !== undefined
    ) {
      invariant(
        config.bounciness === undefined &&
          config.speed === undefined &&
          config.tension === undefined &&
          config.friction === undefined,
        "You can define one of bounciness/speed, tension/friction, or stiffness/damping/mass, but not more than one"
      );
      this.stiffness = withDefault(config.stiffness, 100);
      this.damping = withDefault(config.damping, 10);
      this.mass = withDefault(config.mass, 1);
    } else if (config.bounciness !== undefined || config.speed !== undefined) {
      // Convert the origami bounciness/speed values to stiffness/damping
      // We assume mass is 1.
      invariant(
        config.tension === undefined &&
          config.friction === undefined &&
          config.stiffness === undefined &&
          config.damping === undefined &&
          config.mass === undefined,
        "You can define one of bounciness/speed, tension/friction, or stiffness/damping/mass, but not more than one"
      );
      const springConfig = fromBouncinessAndSpeed(
        withDefault(config.bounciness, 8),
        withDefault(config.speed, 12)
      );
      this.stiffness = springConfig.stiffness;
      this.damping = springConfig.damping;
      this.mass = 1;
    } else {
      // Convert the origami tension/friction values to stiffness/damping
      // We assume mass is 1.
      const springConfig = fromOrigamiTensionAndFriction(
        withDefault(config.tension, 40),
        withDefault(config.friction, 7)
      );
      this.stiffness = springConfig.stiffness;
      this.damping = springConfig.damping;
      this.mass = 1;
    }

    invariant(this.stiffness > 0, "Stiffness value must be greater than 0");
    invariant(this.damping > 0, "Damping value must be greater than 0");
    invariant(this.mass > 0, "Mass value must be greater than 0");
  }

  getInternalState(): Object {
    return {
      lastPosition: this.lastPosition,
      lastVelocity: this.lastVelocity,
      lastTime: this.lastTime
    };
  }

  nextFrame(now: number): [number, boolean] {
    // TODO: Rethink delay handling here
    if (now <= this.lastTime) return [this.startPosition, false];

    const deltaTime = (now - this.lastTime) / 1000;
    this.frameTime += deltaTime;

    const c: number = this.damping;
    const m: number = this.mass;
    const k: number = this.stiffness;
    const v0: number = -this.initialVelocity;

    const zeta = c / (2 * Math.sqrt(k * m)); // damping ratio
    const omega0 = Math.sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
    const omega1 = omega0 * Math.sqrt(1.0 - zeta * zeta); // exponential decay
    const x0 = this.toValue - this.startPosition; // calculate the oscillation from x0 = 1 to x = 0

    let position = 0.0;
    let velocity = 0.0;
    const t = this.frameTime;
    if (zeta < 1) {
      // Under damped
      const envelope = Math.exp(-zeta * omega0 * t);
      position =
        this.toValue -
        envelope *
          (((v0 + zeta * omega0 * x0) / omega1) * Math.sin(omega1 * t) +
            x0 * Math.cos(omega1 * t));
      // This looks crazy -- it's actually just the derivative of the
      // oscillation function
      velocity =
        zeta *
          omega0 *
          envelope *
          ((Math.sin(omega1 * t) * (v0 + zeta * omega0 * x0)) / omega1 +
            x0 * Math.cos(omega1 * t)) -
        envelope *
          (Math.cos(omega1 * t) * (v0 + zeta * omega0 * x0) -
            omega1 * x0 * Math.sin(omega1 * t));
    } else {
      // Critically damped
      const envelope = Math.exp(-omega0 * t);
      position = this.toValue - envelope * (x0 + (v0 + omega0 * x0) * t);
      velocity =
        envelope * (v0 * (t * omega0 - 1) + t * x0 * (omega0 * omega0));
    }

    this.lastTime = now;
    this.lastPosition = position;
    this.lastVelocity = velocity;

    // Conditions for stopping the spring animation
    let finished = false;
    let isOvershooting = false;
    if (this.overshootClamping && this.stiffness !== 0) {
      if (this.startPosition < this.toValue) {
        isOvershooting = position > this.toValue;
      } else {
        isOvershooting = position < this.toValue;
      }
    }
    const isVelocity = Math.abs(velocity) <= this.restSpeedThreshold;
    let isDisplacement = true;
    if (this.stiffness !== 0) {
      isDisplacement =
        Math.abs(this.toValue - position) <= this.restDisplacementThreshold;
    }

    if (isOvershooting || (isVelocity && isDisplacement)) {
      if (this.stiffness !== 0) {
        // Ensure that we end up with a round value
        this.lastPosition = this.toValue;
        this.lastVelocity = 0;
        position = this.toValue;
      }

      finished = true;
    }

    return [position, finished];
  }

  start(
    animatedVal: AnimatedValue,
    _fromValue: number,
    onEnd: ?EndCallback
  ): Animation[] {
    const currentVal = animatedVal.__getValue();

    animatedVal.model = this.toValue;

    this.active = true;
    this.fromValue = currentVal - this.toValue;
    this.toValue = 0;
    this.endCallback = onEnd;

    if (isNaN(this.initialVelocity) || isNaN(this.lastVelocity)) {
      const velocity =
        animatedVal.velocity != null ? animatedVal.velocity * 1000 : 0;
      this.initialVelocity = velocity;
      this.lastVelocity = velocity;
    }

    this.startPosition = this.fromValue;
    this.lastPosition = this.startPosition;
    this.currentValue = currentVal;

    this.lastTime = performance.now() + this.delay;
    this.frameTime = 0;

    animatedVal.animations.forEach(anim => anim.stop(false));

    return [this];
  }

  step(timestamp: number): void {
    const [currentValue, finished] = this.nextFrame(timestamp);
    this.currentValue = currentValue;

    if (finished) {
      this.stop(true);
    }
  }

  getValue(): number {
    return this.currentValue;
  }

  stop(finished?: boolean = false): void {
    this.ended = true;
    this.endCallback && this.endCallback({ finished });
  }
}

export { SpringAnimation };
