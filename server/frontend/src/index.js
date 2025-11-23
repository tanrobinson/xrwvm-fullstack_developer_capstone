/* -----------------------------------------------------------------
   REACT APPLICATION ENTRY POINT
   -----------------------------------------------------------------
   This file is the *only* place where the React component tree is
   attached to the real DOM. It also installs React Router’s
   BrowserRouter so that any component using <Routes>/<Route> can
   read the current URL and navigate programmatically.
   ----------------------------------------------------------------- */

import React from "react";                         // Core React library (JSX needs this import in older setups)
import ReactDOM from "react-dom/client";           // New ‘client’ API for React 18+ (ReactDOM.createRoot)
import App from "./App";                           // Root component that holds all routes & UI

/* -----------------------------------------------------------------
   React‑Router import – we use the HTML5 history API (pushState,
   popState) to keep the URL in sync with the UI without full page
   reloads.  BrowserRouter should wrap the entire app *once*.
   ----------------------------------------------------------------- */
import { BrowserRouter } from "react-router-dom";

/* -----------------------------------------------------------------
   1️⃣ Grab the HTML element that will host the React tree.
   The element with id="root" is normally defined in public/index.html.
   ----------------------------------------------------------------- */
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement   // Type‑assertion for TS; omit for plain JS
);

/* -----------------------------------------------------------------
   2️⃣ Render the React component tree.
   - `<BrowserRouter>` provides routing context to everything inside.
   - `<App />` is the top‑level component that contains the `<Routes>` tree.
   - No extra React.StrictMode wrapper is used here, but you can add it
     if you want extra development‑time warnings.
   ----------------------------------------------------------------- */
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
