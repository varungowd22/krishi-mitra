import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api.js";
import { saveProfile, setWorkspaceIdentity, startWorkspaceSync, syncCurrentWorkspace } from "../utils/workspace.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("km_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => startWorkspaceSync(), []);

  const login = async (phone, password, role) => {
    const { data } = await api.post("/auth/login", { phone, password, role });
    localStorage.setItem("km_token", data.token);
    localStorage.setItem("km_user", JSON.stringify(data.user));
    setWorkspaceIdentity(data.user);
    setUser(data.user);
    syncCurrentWorkspace();
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("km_token", data.token);
    localStorage.setItem("km_user", JSON.stringify(data.user));
    setWorkspaceIdentity(data.user);
    setUser(data.user);
    syncCurrentWorkspace();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("km_token");
    localStorage.removeItem("km_user");
    setUser(null);
  };

  const updateUser = async (payload) => {
    const updatedUser = await saveProfile(payload);
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
