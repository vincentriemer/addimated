// @flow

import BezierEasing from "bezier-easing";

/**
 * This class implements common easing functions. The math is pretty obscure,
 * but this cool website has nice visual illustrations of what they represent:
 * http://xaedes.de/dev/transitions/
 */

const _ease = BezierEasing(0.42, 0, 1, 1);

function step0(n: number) {
  return n > 0 ? 1 : 0;
}

function step1(n: number) {
  return n >= 1 ? 1 : 0;
}

function linear(t: number) {
  return t;
}

function ease(t: number) {
  return _ease(t);
}

function quad(t: number) {
  return t * t;
}

function cubic(t: number) {
  return t * t * t;
}

function poly(n: number) {
  return (t: number) => Math.pow(t, n);
}

function sin(t: number) {
  return 1 - Math.cos((t * Math.PI) / 2);
}

function circle(t: number) {
  return 1 - Math.sqrt(1 - t * t);
}

function exp(t: number) {
  return Math.pow(2, 10 * (t - 1));
}

/**
 * A simple elastic interaction, similar to a spring.  Default bounciness
 * is 1, which overshoots a little bit once.  0 bounciness doesn't overshoot
 * at all, and bounciness of N > 1 will overshoot about N times.
 *
 * Wolfram Plots:
 *
 *   http://tiny.cc/elastic_b_1 (default bounciness = 1)
 *   http://tiny.cc/elastic_b_3 (bounciness = 3)
 */
function elastic(bounciness: number = 1): (t: number) => number {
  var p = bounciness * Math.PI;
  return t => 1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * p);
}

function back(s: number): (t: number) => number {
  if (s === undefined) {
    s = 1.70158;
  }
  return t => t * t * ((s + 1) * t - s);
}

function bounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  }

  if (t < 2 / 2.75) {
    t -= 1.5 / 2.75;
    return 7.5625 * t * t + 0.75;
  }

  if (t < 2.5 / 2.75) {
    t -= 2.25 / 2.75;
    return 7.5625 * t * t + 0.9375;
  }

  t -= 2.625 / 2.75;
  return 7.5625 * t * t + 0.984375;
}

function _in(easing: (t: number) => number): (t: number) => number {
  return easing;
}

/**
 * Runs an easing function backwards.
 */
function out(easing: (t: number) => number): (t: number) => number {
  return t => 1 - easing(1 - t);
}

/**
 * Makes any easing function symmetrical.
 */
function inOut(easing: (t: number) => number): (t: number) => number {
  return t => {
    if (t < 0.5) {
      return easing(t * 2) / 2;
    }
    return 1 - easing((1 - t) * 2) / 2;
  };
}

export {
  step0,
  step1,
  linear,
  ease,
  quad,
  cubic,
  poly,
  sin,
  circle,
  exp,
  elastic,
  back,
  bounce,
  BezierEasing as bezier,
  _in as in,
  out,
  inOut
};
