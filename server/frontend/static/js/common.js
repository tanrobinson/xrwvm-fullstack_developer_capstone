/**
 * Authentication and Session Management
 *
 * This module handles client-side authentication state and coordinates with
 * Django's authentication system. The actual authentication logic happens
 * server-side in Django, while this code handles UI updates and client state.
 */

/**
 * Logs out the user by:
 * 1. Calling Django's logout endpoint to clear server-side session
 * 2. Clearing client-side session storage
 * 3. Redirecting to home page
 *
 * Note: The security-critical logout happens server-side in Django.
 * This function just handles the client-side cleanup.
 */
const logout = async (e) => {
  try {
    // First, call Django's logout endpoint to handle server-side session termination
    const logout_url = window.location.origin + "/djangoapp/logout";
    const res = await fetch(logout_url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();

    if (json && json.status === "success") {
      // Get username before clearing session
      const username = sessionStorage.getItem("username");

      // Clear client-side session data
      sessionStorage.clear(); // Clear all session data, not just username

      // Log the logout event (for debugging)
      console.log(`User ${username} logged out successfully`);

      // Notify user
      alert(`Logging out ${username}...`);

      // Redirect to home page
      window.location.href = window.location.origin + "/static/Home.html";
    } else {
      throw new Error("Logout was not successful");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert(
      "There was a problem logging out. Please try again or contact support if the problem persists."
    );
  }
};

/**
 * Checks the current session state and updates the UI accordingly.
 * This function is called when pages load to ensure the UI matches
 * the authentication state.
 *
 * Note: This only checks client-side session state. The actual
 * authentication state is maintained server-side by Django.
 */
const checkSession = () => {
  try {
    const curr_user = sessionStorage.getItem("username");
    const loginLogoutDiv = document.getElementById("loginlogout");

    if (!loginLogoutDiv) {
      console.error("Login/logout container not found in the page");
      return;
    }

    if (curr_user && curr_user !== "") {
      // User is logged in
      loginLogoutDiv.innerHTML = `
                <span class="homepage_links">${escapeHtml(curr_user)}</span>
                <a class="homepage_links" onclick="logout()" href="#" role="button">Logout</a>
            `;
      console.log(`Session active for user: ${curr_user}`);
    } else {
      // No user logged in
      loginLogoutDiv.innerHTML = `
                <a class="homepage_links" href="/login">Login</a>
                <a class="homepage_links" href="/register">Register</a>
            `;
      console.log("No active session found");
    }
  } catch (error) {
    console.error("Error checking session:", error);
  }
};

/**
 * Utility function to prevent XSS when displaying user input
 * @param {string} text - The text to escape
 * @returns {string} - Escaped HTML string
 */
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};
