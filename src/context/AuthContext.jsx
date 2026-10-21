import { createContext, useContext, useEffect, useState } from "react";

import * as api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    if (api.isTokenExpired()) {
      api.logoutUser();
      setUser(null);
    } else {
      setUser(api.getCurrentUser());
    }

    setLoading(false);
  }, []);

  // Check periodically whether the JWT has expired.
  useEffect(function () {
    const intervalId = setInterval(function () {
      if (api.isTokenExpired()) {
        api.logoutUser();
        setUser(null);
      }
    }, 10000);

    return function () {
      clearInterval(intervalId);
    };
  }, []);

  function login(username, password) {
    return api.loginUser(username, password).then(function (loggedIn) {
      setUser(loggedIn);
      return loggedIn;
    });
  }

  function register(details) {
    return api.registerUser(details);
  }

  function logout() {
    api.logoutUser();
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}