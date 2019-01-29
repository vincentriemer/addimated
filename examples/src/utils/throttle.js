// @flow

export function throttle<T: Function>(
  func: T,
  threshhold: number = 250,
  scope?: any
): T {
  let last: number, deferTimer: TimeoutID;

  // $FlowFixMe
  return function(self: any) {
    let context = scope || self;

    let now = Date.now(),
      args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function() {
        last = now;
        func.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      func.apply(context, args);
    }
  };
}
