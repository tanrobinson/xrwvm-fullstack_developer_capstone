import React, { useState, useEffect } from "react"; // ⬅️ IMPORT useEffect
import "./Register.css";
import user_icon from "../assets/person.png";
import email_icon from "../assets/email.png";
import password_icon from "../assets/password.png";
import close_icon from "../assets/close.png";

const Register = () => {
  // State variables for form inputs
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect to home
  const gohome = () => {
    window.location.href = window.location.origin;
  };

  // 🔑 NEW: useEffect for Reliable Comparison
  // This hook runs *after* password or confirmPassword state has been updated,
  // guaranteeing the comparison uses the latest values.
  useEffect(() => {
    // Only check if at least one field has content to avoid initial green borders
    if (password !== "" || confirmPassword !== "") {
      setPasswordMatch(password === confirmPassword);
    } else {
      // If both are empty, default to true for a neutral look (handled by getPasswordClass)
      setPasswordMatch(true);
    }
  }, [password, confirmPassword]); // ⬅️ Dependencies: runs when these states change

  // 1. Simplified Handlers (No more setPasswordMatch logic here)
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrorMessage("");
    // The comparison is now handled by useEffect
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setErrorMessage("");
    // The comparison is now handled by useEffect
  };

  // Helper function to get the correct class for the input field
  const getPasswordClass = (input_value) => {
    // ➡️ EXPLANATION: This logic controls the border color.
    // It returns the colored border class only if the field is not empty.
    if (input_value === "") {
      return "input_field";
    }

    return passwordMatch
      ? "input_field input_match"
      : "input_field input_mismatch";
  };

  // Handle form submission
  const register = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Mandatory Password Match Check and Empty Field Check
    // This part runs with the most recent state before submission
    if (password === "" || confirmPassword === "") {
      setErrorMessage("Password cannot be empty");
      setPasswordMatch(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Password Mismatch");
      setPasswordMatch(false);
      return;
    }

    let register_url = "/djangoapp/register/";
    // ... (rest of the registration fetch logic)

    const res = await fetch(register_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: userName,
        password: password,
        firstName: firstName,
        lastName: lastName,
        email: email,
      }),
    });

    const json = await res.json();
    if (json.status === "success") {
      sessionStorage.setItem("username", json.userName);
      window.location.href = window.location.origin;
    } else if (json.error) {
      setErrorMessage(json.error);
    } else {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register_container">
      <div className="header">
        <h3 className="header_title">Register</h3>
        <img
          src={close_icon}
          className="close_icon"
          alt="Close"
          onClick={gohome}
        />
      </div>
      <form onSubmit={register}>
        <div className="inputs">
          {/* ... other input fields ... */}
          <div className="input">
            <img src={user_icon} className="img_icon" alt="Username" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="input_field"
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
              required
            />
          </div>

          <div className="input">
            <img src={user_icon} className="img_icon" alt="First Name" />
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              className="input_field"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
          </div>

          <div className="input">
            <img src={user_icon} className="img_icon" alt="Last Name" />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              className="input_field"
              onChange={(e) => setlastName(e.target.value)}
              value={lastName}
            />
          </div>

          <div className="input">
            <img src={email_icon} className="img_icon" alt="Email" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="input_field"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          {/* 1. Password Field */}
          <div className="input">
            <img src={password_icon} className="img_icon" alt="password" />
            <input
              name="psw"
              type="password"
              placeholder="Password"
              className={getPasswordClass(password)}
              onChange={handlePasswordChange}
              value={password}
              required
            />
          </div>

          {/* 2. Confirm Password Field */}
          <div className="input">
            <img
              src={password_icon}
              className="img_icon"
              alt="Confirm Password"
            />
            <input
              name="psw_confirm"
              type="password"
              placeholder="Confirm Password"
              className={getPasswordClass(confirmPassword)}
              onChange={handleConfirmPasswordChange}
              value={confirmPassword}
              required
            />
          </div>
        </div>

        <div className="submit_panel">
          <div className="error_message_container">
            {errorMessage && (
              <span className="error_message">{errorMessage}</span>
            )}
          </div>
          <input className="submit" type="submit" value="Register" />
        </div>
      </form>
    </div>
  );
};

export default Register;
