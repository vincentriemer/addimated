// @flow

function withDefault<T>(value: ?T, defaultValue: T): T {
  if (value == null) {
    return defaultValue;
  }
  return value;
}

export { withDefault };
