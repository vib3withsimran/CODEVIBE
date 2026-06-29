import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "./config/api";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

function loadAuthState() {
  if (typeof window === "undefined") return { user: null };
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      return { user };
    }
  } catch (error) {
    console.error("Error:", error);
    // ignore parse errors
  }
  localStorage.removeItem("user");
  return { user: null };
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => loadAuthState());

  const login = useCallback((userData) => {
    if (!userData) return;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userEmail", userData.email || userData.Email || "");
    setAuthState({ user: userData });
  }, []);

  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser) return;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("userEmail", updatedUser.email || updatedUser.Email || "");
    setAuthState({ user: updatedUser });
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error:", error);
      // clear local state regardless
    }
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    setAuthState({ user: null });
  }, []);

  const value = useMemo(
    () => ({ user: authState.user, login, updateUser, logout }),
    [authState.user, login, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
};

export const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
