import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, unwrap, setSessionExpiredHandler } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | anonymous

  const loadUser = useCallback(async () => {
    try {
      const me = await unwrap(api.get("/auth/me"));
      setUser(me);
      setStatus("authenticated");
    } catch (err) {
      // The access cookie may simply have expired: try the refresh cookie once.
      if (err.response?.status === 401) {
        try {
          const { user: refreshed } = await unwrap(api.post("/auth/refresh"));
          setUser(refreshed);
          setStatus("authenticated");
          return;
        } catch { /* fall through */ }
      }
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  useEffect(() => {
    loadUser();
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus("anonymous");
    });
  }, [loadUser]);

  const login = useCallback(async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    setUser(res.data.data.user);
    setStatus("authenticated");
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch { /* signing out locally anyway */ }
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    login,
    logout,
    isManager: user?.role === "Manager",
  }), [user, status, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
