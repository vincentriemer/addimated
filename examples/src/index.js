import "./global.css";

import { Link, Router } from "@reach/router";
import importAll from "import-all.macro";
import React from "react";
import ReactDOM from "react-dom";

import homeStyles from "./home.module.css";

const importedRoutes = importAll.deferred("./examples/*.js");

const routes = Object.keys(importedRoutes).map(routePath => {
  const splitRoutePath = routePath.split("/");
  const routeName = splitRoutePath[splitRoutePath.length - 1].slice(
    0,
    -1 * ".js".length
  );
  const componentGetter = importedRoutes[routePath];
  return {
    routeName,
    Component: React.lazy(componentGetter)
  };
});

const Home = () => {
  return (
    <div className={homeStyles.container}>
      <h1>Addimated Examples</h1>
      <ul>
        {routes.map(({ routeName }) => {
          return (
            <li key={routeName}>
              <Link to={`/${routeName}`}>{routeName}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const LoadingFallback = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <p>loading...</p>
  </div>
);

const App = () => {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Router>
        <Home path="/" />
        {routes.map(({ routeName, Component }) => {
          return <Component key={routeName} path={`/${routeName}`} />;
        })}
      </Router>
    </React.Suspense>
  );
};

const rootElem = document.getElementById("root");
const root = ReactDOM.createRoot(rootElem);
root.render(<App />);
