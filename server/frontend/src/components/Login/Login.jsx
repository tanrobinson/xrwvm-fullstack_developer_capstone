import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import Header from "../Header/Header";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  let login_url = "/djangoapp/login";

  const login = async (e) => {
    e.preventDefault();

    const res = await fetch(login_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: userName,
        password: password,
      }),
    });

    const json = await res.json();
    if (json.status != null && json.status === "Authenticated") {
      sessionStorage.setItem("username", json.userName);
      window.location.href = "/";
    } else {
      alert("The user could not be authenticated.");
    }
  };

  return (
    <div>
      <Header />
      <form className="login_panel" onSubmit={login}>
        <h1>Login</h1>
        <div>
          <span className="input_field">Username </span>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="input_field"
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div>
          <span className="input_field">Password </span>
          <input
            name="psw"
            type="password"
            placeholder="Password"
            className="input_field"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <input className="action_button" type="submit" value="Login" />
          <Link to="/register">
            <input
              className="action_button"
              type="button"
              value="Register Now"
            />
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
