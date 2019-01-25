// @flow

import * as React from "react";

import { throttle } from "./throttle";

const mediaQueryList = window.matchMedia("(orientation: portrait)");

const events = new Set();
const onResize = () => events.forEach(fn => fn());

const doc = document.documentElement;
const body = document.body;
const root = document.getElementById("root");

const windowResize = () => {
  // $FlowFixMe
  const newStyle = navigator.standalone
    ? {
        width: "100vw",
        height: "100vh"
      }
    : {
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`
      };
  doc && Object.assign(doc.style, newStyle);
  body && Object.assign(body.style, newStyle);
  root && Object.assign(root.style, newStyle);
};

window.addEventListener("resize", windowResize, true);
windowResize();

// $FlowFixMe
if (navigator.standalone) {
  setTimeout(() => {
    onResize();
    windowResize();
  }, 250);
}

export const useLayoutViewportSize = (
  options: { throttleMs?: number } = {}
) => {
  const { throttleMs = 100 } = options;
  const [size, setSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const handle = throttle(() => {
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, throttleMs);

  React.useEffect(() => {
    if (events.size === 0) {
      window.addEventListener("resize", onResize, true);
      mediaQueryList.addListener(onResize);
    }

    events.add(handle);

    return () => {
      events.delete(handle);

      if (events.size === 0) {
        window.removeEventListener("resize", onResize, true);
        mediaQueryList.removeListener(onResize);
      }
    };
  }, []);

  return size;
};
