# addimated [![](https://img.shields.io/npm/v/@unstable/addimated.svg)](https://www.npmjs.com/package/@unstable/addimated) [![](https://img.shields.io/bundlephobia/minzip/@unstable/addimated.svg)](https://bundlephobia.com/result?p=@unstable/addimated)

An always interruptable, declarative animation library for React.

## Installation

```sh
# use npm
npm install @unstable/addimated

# use yarn
yarn add @unstable/addimated
```

## Usage

Coming soon

## Examples

Coming soon

## API Reference

### Animated Values

#### `createAnimatedValue(initialValue)`

#### `createAnimatedValueXY(initialValueXY)`

### Interpolation

#### `interpolate(value, config)`

### Animations

#### `spring(value, config)`

#### `timing(value, config)`

### Composite Animations

#### `delay(time)`

#### `sequence(animations)`

#### `parallel(animations)`

#### `stagger(time, animations)`

### Animated Components

#### `createAnimatedComponent(component)`

#### Built-in Animated Components

- `a`
- `button`
- `div`
- `span`
- `img`

### Hooks

#### `useAnimatedValue(currentValue, [animationFactory])`

### Easing

#### Predefined Animations

- `Easing.ease`
- `Easing.bounce`
- `Easing.back(s)`
- `Easing.elastic(bounciness)`
- `Easing.bezier(x1, y1, x2, y2)`

#### Standard Functions

- `Easing.linear`
- `Easing.quad`
- `Easing.cubic`
- `Easing.poly`

#### Modifiers

- `Easing.in(easing)`
- `Easing.out(easing)`
- `Easing.inOut(easing)`

#### Additional Functions

- `Easing.sin`
- `Easing.circle`
- `Easing.exp`
- `Easing.step0`
- `Easing.step1`
