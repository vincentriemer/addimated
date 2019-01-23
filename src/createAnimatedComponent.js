// @flow

import invariant from "invariant";
import React from "react";

import { AnimatedProps } from "./AnimatedProps";
import { ApplyAnimatedValues, transformStyles } from "./ApplyAnimatedValues";

function createAnimatedComponent(Component: any): any {
  const AnimatedComponent = React.forwardRef((props, ref) => {
    const isMountedRef = React.useRef(true);
    const propsAnimatedRef = React.useRef(null);
    const forceUpdate = React.useState(null)[1];
    const componentRef = React.useRef(null);

    const setNativeProps = React.useCallback(props => {
      const didUpdate = ApplyAnimatedValues(componentRef.current, props);
      if (!didUpdate) {
        isMountedRef.current && forceUpdate();
      }
    }, []);

    const attachProps = React.useCallback(nextProps => {
      let oldPropsAnimated = propsAnimatedRef.current;

      // The system is best designed when setNativeProps is implemented. It is
      // able to avoid re-rendering and directly set the attributes that
      // changed. However, setNativeProps can only be implemented on leaf
      // native components. If you want to animate a composite component, you
      // need to re-render it. In this case, we have a fallback that uses
      // forceUpdate.
      const callback = () => {
        const propsAnimated = propsAnimatedRef.current;
        if (propsAnimated) {
          const didUpdate = ApplyAnimatedValues(
            componentRef.current,
            propsAnimated.__getAnimatedValue()
          );
          if (!didUpdate) {
            isMountedRef.current && forceUpdate();
          }
        }
      };

      propsAnimatedRef.current = new AnimatedProps(nextProps, callback);

      // When you call detach, it removes the element from the parent list
      // of children. If it goes to 0, then the parent also detaches itself
      // and so on.
      // An optimization is to attach the new elements and THEN detach the old
      // ones instead of detaching and THEN attaching.
      // This way the intermediate state isn't to go to 0 and trigger
      // this expensive recursive detaching to then re-attach everything on
      // the very next operation.
      oldPropsAnimated && oldPropsAnimated.__detach();
    }, []);

    attachProps(props);

    const propsAnimated = propsAnimatedRef.current;
    invariant(
      propsAnimated,
      "Uh oh, `propsAnimated` appears not to be populated :("
    );

    // componentWillUnmount-ish
    React.useEffect(
      () => () => {
        isMountedRef.current = false;
        propsAnimatedRef.current && propsAnimatedRef.current.__detach();
      },
      []
    );

    // $FlowFixMe
    React.useImperativeHandle(ref, () => ({
      setNativeProps,
      getNode: () => componentRef.current
    }));

    const componentRefHandler = React.useCallback(
      (value: ?any) => {
        if (typeof ref === "function") {
          ref(value);
        } else if (ref != null && typeof ref === "object") {
          ref.current = value;
        }
        componentRef.current = value;
      },
      [componentRef, ref]
    );

    const { style, ...other } = propsAnimated.__getValue();

    return React.createElement(Component, {
      ...other,
      style: transformStyles(style),
      ref: componentRefHandler
    });
  });

  return AnimatedComponent;
}

export { createAnimatedComponent };
