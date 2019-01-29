<h1 align="center">
  <img alt="addimated" width="152" src="https://ghtext.vincentriemer.com/?text=addimated&type=h1&weight=light"/>
</h1>

<p align="center">An always interruptable, declarative animation library for React.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@unstable/addimated">
    <img src="https://img.shields.io/npm/v/@unstable/addimated.svg">
  </a>
  <a href="https://bundlephobia.com/result?p=@unstable/addimated">
    <img src="https://img.shields.io/bundlephobia/minzip/@unstable/addimated.svg">
  </a>
</p>

<br />

<h2>
  <img width="146" alt="WARNING" src="https://ghtext.vincentriemer.com/?text=WARNING&type=h1&weight=black&color=%23d73a49"/>
</h2>

This project is largely a proof-of-concept/experiment as a stepping stone to future animation work I have planned. Feel free to fool around with this but I wouldn't recommend using it in production.

## Installation

```sh
# use npm
npm install @unstable/addimated

# use yarn
yarn add @unstable/addimated
```

## Usage

```js
import * as Animated from "@unstable/addimated";
```

Addimated's API and usage largly mirror's React Native's [Animated](https://facebook.github.io/react-native/docs/animated) with a few notable changes:

- Addimated exports a namespace instead of a default object export
- When creating new animated values, instead of constructing classes like `new Animated.Value()` or `new Animated.ValueXY()`, you call the factory functions `Animated.createAnimatedValue()` and `Animated.createAnimatedValueXY()`
- `interpolate` is its own exported function instead of a method on an animated value. So instead of

  ```js
  value.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100]
  });
  ```

  you should use

  ```js
  Animated.interpolate(value, {
    inputRange: [0, 1],
    outputRange: [-100, 100]
  });
  ```

- Since Addimated targets the web instead of React Native, instead of exporting `Animated.View`, `Animated.Image`, ect. it exports [animated components suitable for the web](#built-in-animated-components).
- Addimated provides hooks for a better development experience in React functional components. See [useAnimatedValue](#useanimatedvaluecurrentvalue-number-animationfactory-function-animatedvalue-boolean) for usage.

## Examples

- [Timing Sequence Overlap](https://codesandbox.io/embed/50wx3l4n6x?view=preview)
- [Spring/Timing Interruption](https://codesandbox.io/embed/4xy742lvk7?view=preview)
- [With `react-with-gesture`](https://codesandbox.io/embed/wo1vnm11pl?view=preview)

## API Reference

### Animated Values

#### `createAnimatedValue(initialValue: number):`[`AnimatedValue`](#animatedvalue)

Creates a standard value for driving animations.

#### `createAnimatedValueXY(initialValueXY: { x: number, y: number }):`[`AnimatedValueXY`](#animatedvaluexy)

Creates a 2D value for driving 2D animations, such as pan gestures.

### Interpolation

#### `interpolate(value:`[`AnimatedValue`](#animatedvalue)`, config: Object):`[`AnimatedValue`](#animatedvalue)

Maps input ranges to output ranges, typically using a linear interpolation but also supports easing functions. By default, it will extrapolate the curve beyond the ranges given, but you can also have it clamp the output value.

Config is an object that may have the following options:

- `inputRange`: _(required)_ An array of numbers (must be ascending) used to map against.
- `outputRange`: _(required)_ An array of numbers (or strings for colors or values with units) to map to.
- `easing`: an easing function to use instead of the default linear interpolation.
- `extrapolate`: By default, `interpolate` will extrapolate values outside the input/output range with `"extend"`, but you can restrict the values by providing `"clamp"`.
- `extrapolateLeft`: Same as `extrapolate` but only for the left side of the interpolation.
- `extrapolateRight`: Same as `extrapolate` but only for the right side of the interpolation.

### Animations

#### `timing(value:`[`AnimatedValue`](#animatedvalue)`|`[`AnimatedValueXY`](#animatedvaluexy)`, config: Object):` [`Animation`](#animation)

Animates a value along a timed easing curve. The Easing module has tons of predefined curves, or you can use your own function.

Config is an object that may have the following options:

- `toValue`: _(required)_ Next value to animate to
- `duration`: Length of animation (milliseconds). Default 500.
- `easing`: Easing function to define curve. Default is `Easing.inOut(Easing.ease)`.
- `delay`: Start the animation after delay (milliseconds). Default 0.

#### `spring(value:`[`AnimatedValue`](#animatedvalue)`|`[`AnimatedValueXY`](#animatedvaluexy)`, config: Object):`[`Animation`](#animation)

Animates a value according to an analytical spring model based on damped harmonic oscillation. Tracks velocity state to create fluid motions as the toValue updates, and can be chained together.

Config is an object that may have the following options.

Note that you can only define one of bounciness/speed, tension/friction, or stiffness/damping/mass, but not more than one:

The friction/tension or bounciness/speed options match the spring model in Facebook Pop, Rebound, and Origami.

- `friction`: Controls "bounciness"/overshoot. Default 7.
- `tension`: Controls speed. Default 40.
- `speed`: Controls speed of the animation. Default 12.
- `bounciness`: Controls bounciness. Default 8.

Specifying stiffness/damping/mass as parameters makes Animated.spring use an analytical spring model based on the motion equations of a damped harmonic oscillator. This behavior is slightly more precise and faithful to the physics behind spring dynamics, and closely mimics the implementation in iOS's CASpringAnimation primitive.

- `stiffness`: The spring stiffness coefficient. Default 100.
- `damping`: Defines how the spring’s motion should be damped due to the forces of friction. Default 10.
- `mass`: The mass of the object attached to the end of the spring. Default 1.

Other configuration options are as follows:

- `toValue`: _(required)_ Next value to animate to
- `velocity`: The initial velocity of the object attached to the spring. Default 0 (object is at rest).
- `overshootClamping`: Boolean indicating whether the spring should be clamped and not bounce. Default false.
- `restDisplacementThreshold`: The threshold of displacement from rest below which the spring should be considered at rest. Default 0.001.
- `restSpeedThreshold`: The speed at which the spring should be considered at rest in pixels per second. Default 0.001.
- `delay`: Start the animation after delay (milliseconds). Default 0.

### Composite Animations

#### `delay(time: number):` [`Animation`](#animation)

Creates an empty animation that lasts for the given `time`, useful when used inside a `sequence` to create spacing between animations.

#### `sequence(animations:`[`Animation`](#animation)`[]):`[`Animation`](#animation)

Starts an array of animations in order, waiting for each to complete before starting the next. If the current running animation is stopped, no following animations will be started.

#### `parallel(animations:`[`Animation`](#animation)`[]):`[`Animation`](#animation)

Starts an array of animations all at the same time.

#### `stagger(time: number, animations:`[`Animation`](#animation)`[]):`[`Animation`](#animation)

Array of animations may run in parallel (overlap), but are started in sequence with successive delays. Nice for doing trailing effects.

### Animated Components

#### `createAnimatedComponent(component: React.Component|string): AnimatedComponent`

Make any React component Animatable. Used to create `Animated.div`, etc.

#### Built-in Animated Components

- `a`
- `button`
- `div`
- `img`
- `span`

### Hooks

#### `useAnimatedValue(currentValue: number, animationFactory: ?Function): [`[`AnimatedValue`](#animatedvalue)`, boolean]`

A hook that turns the `currentValue` into an [`AnimatedValue`](#animatedvalue) where when the `currentValue` changes, it is animated with the [`Animation`](#animation) provided by the optional `animationFactory`.

If `animationFactory` is not provided it defaults to:

```js
function defaultAnimationFactory(animatedValue, toValue) {
  return timing(animatedValue, { toValue });
}
```

It returns a tuple where the first value is the resulting [`AnimatedValue`](#animatedvalue) and the second is a `boolean` that specifies if the value is being animated or not.

#### `useAnimatedValueXY(currentValue: { x: number, y: number }, animationFactory: ?Function): [`[`AnimatedValueXY`](#animatedvaluexy)`, boolean]`

An equivalent hook to `useAnimatedValue` but handles [`AnimatedXY`](#animatedxy) values instead

### Easing

#### Predefined Animations

- `Easing.ease`: A simple inertial interaction, similar to an object slowly accelerating to speed.
- `Easing.bounce`: Provides a simple bouncing effect.
- `Easing.back(s)`: Use with `parallel()` to create a simple effect where the object animates back slightly as the animation starts.
- `Easing.elastic(bounciness)`: A simple elastic interaction, similar to a spring oscillating back and forth.
- `Easing.bezier(x1, y1, x2, y2)`: Provides a cubic bezier curve, equivalent to CSS Transitions' `transition-timing-function`.

#### Standard Functions

- `Easing.linear`: A linear function, `f(t) = t`. Position correlates to elapsed time one to one.
- `Easing.quad`: A quadratic function, `f(t) = t * t`. Position equals the square of elapsed time.
- `Easing.cubic`: A cubic function, `f(t) = t * t * t`. Position equals the cube of elapsed time.
- `Easing.poly`: A power function. Position is equal to the Nth power of elapsed time.

#### Modifiers

- `Easing.in(easing)`: Runs an easing function forwards.
- `Easing.out(easing)`: Runs an easing function backwards.
- `Easing.inOut(easing)`: Makes any easing function symmetrical. The easing function will run forwards for half of the duration, then backwards for the rest of the duration.

#### Additional Functions

- `Easing.sin`: A sinusoidal function.
- `Easing.circle`: A circular function.
- `Easing.exp`: An exponential function.
- `Easing.step0`: A stepping function, returns 1 for any positive value.
- `Easing.step1`A stepping function, returns 1 if a value is greater than or equal to 1.

### Interfaces

#### AnimatedValue

##### Methods

- `setValue(value: number): void`
- `setOffset(offset: number): void`
- `flattenOffset(): void`
- `extractOffset(): void`
- `stopAnimations(callback: ?(value: number) => void): void`

#### AnimatedValueXY

##### Properties

- `x:`[`AnimatedValue`](#animatedvalue)
- `y:`[`AnimatedValue`](#animatedvalue)

##### Methods

- `setValue(value: { x: number, y: number }): void`
- `setOffset(offset: { x: number, y: number }): void`
- `flattenOffset(): void`
- `extractOffset(): void`
- `stopAnimations(callback: ?(value: { x: number, y: number }) => void): void`
- `getTranslateTransform(): [{ translateX: number }, { translateY: number}]`

#### Animation

##### Methods

- `start(callback: ?({ isFinished: boolean}) => void): void`

## Development

To do a local build of Addimated: clone the respository, pull the package's depedencies, and run the project's build script like so:

```sh
# clone repo
git clone https://github.com/vincentriemer/addimated.git
cd addimated

# pull dependencies
yarn install

# run build script
yarn run build
```

Once you have done a local build, you can run the project's internal examples against it to test your changes by performing the following:

```sh
# assuming the current working directory is the root of the repo,
# navigate to the examples folder
cd examples

# pull the example project's dependencies
yarn install

# start the development server
yarn run start
```
