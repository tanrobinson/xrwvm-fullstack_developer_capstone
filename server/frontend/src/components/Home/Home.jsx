/**
 * @file This file contains the `Home` component, which redirects the user to the static `Home.html` page.
 *
 * @module Home
 */
import React from "react";
import { Navigate } from "react-router-dom";

const Home = () => {
  return <Navigate to="/static/Home.html" replace />;
};

export default Home;
