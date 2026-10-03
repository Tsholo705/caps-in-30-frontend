import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read the saved (mock) user once the page is running in the browser.
  useEffect(function () {
    setUser(api.getCurrentUser());
    setLoading(false);
  }, []);

  function login(username, password) {
    return api.loginUser(username, password).then(function (loggedIn) {
      setUser(loggedIn);
      return loggedIn;
    });
  }

  function register(details) {
    return api.registerUser(details).then(function (created) {
      setUser(created);
      return created;
    });
  }

  function logout() {
    api.logoutUser();
    setUser(null);
  }

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return context;
}
