/* -----------------------------------------------------------------
   APP ENTRY POINT
   -----------------------------------------------------------------
   This file is the root of the React application. It only contains
   the routing configuration. All UI is delegated to the individual
   page components imported below.
   ----------------------------------------------------------------- */

import React from "react"; // (optional but useful for JSX typing)
import { Routes, Route } from "react-router-dom";

/* -----------------------------------------------------------------
   Page‑level components – each lives in its own folder under
   src/components/.  The naming convention is PascalCase (e.g. Login)
   ----------------------------------------------------------------- */
import Login from "./components/Login/Login";
import Dealers from "./components/Dealers/Dealers";
import Dealer from "./components/Dealers/Dealer";
import PostReview from "./components/Dealers/PostReview";
import Register from "./components/Register/Register";

/* -----------------------------------------------------------------
   App – functional component that returns the routing tree.
   React Router v6 uses <Routes> (instead of <Switch>) and the
   `element` prop to render a component for a given location.
   ----------------------------------------------------------------- */
function App() {
  return (
    /* -------------------------------------------------------------
       The <Routes> component scans its children <Route> elements
       and renders the first one that matches the current URL.
       ------------------------------------------------------------- */
    <Routes>
      {/* ---------------------------------------------------------
          Public routes (no auth guard added here – could be added later)
          --------------------------------------------------------- */}

      {/* Login page – reachable at /login */}
      <Route path="/login" element={<Login />} />

      {/* Register page – reachable at /register */}
      <Route path="/register" element={<Register />} />

      {/* -----------------------------------------------------------------
          Dealer‑related pages – all sit under the "/dealers" base path.
          ----------------------------------------------------------------- */}

      {/* List of all dealers – /dealers */}
      <Route path="/dealers" element={<Dealers />} />

      {/* Individual dealer details – /dealer/:id
          :id is a URL param that will be accessible inside <Dealer>
          via the `useParams` hook (e.g. const { id } = useParams();).
        --------------------------------------------------------------- */}
      <Route path="/dealer/:id" element={<Dealer />} />

      {/* Review‑submission page – /postreview/:id
          The :id param usually represents the dealer ID for which the
          review is being posted.
        --------------------------------------------------------------- */}
      <Route path="/postreview/:id" element={<PostReview />} />

      {/* -----------------------------------------------------------------
          OPTIONAL: a catch‑all 404 route could be added here:
          <Route path="*" element={<NotFound />} />
          ----------------------------------------------------------------- */}
    </Routes>
  );
}

/* -----------------------------------------------------------------
   Export the component so the root `index.js` can render it.
   ----------------------------------------------------------------- */
export default App;
