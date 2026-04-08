import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

const ADMIN_EMAIL = "washingtonamedu@gmail.com";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [units, setUnits] = useState(0);

  // =========================
  // NORMALIZE USER
  // =========================
  const normalizeUser = (userData) => {
    if (!userData) return null;

    const normalized = {
      ...userData,
      id: userData.id || userData._id,
      units: userData.units || 0,
    };

    // 🔥 AUTO ADMIN FLAG
    normalized.isAdmin =
      normalized.email?.toLowerCase().trim() === ADMIN_EMAIL;

    return normalized;
  };

  // =========================
  // LOAD USER FROM STORAGE
  // =========================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      const normalized = normalizeUser(storedUser);

      setUser(normalized);
      setUnits(normalized.units);
    }
  }, []);

  // =========================
  // UPDATE USER (LOGIN / REGISTER)
  // =========================
  const updateUser = (userData) => {
    const normalized = normalizeUser(userData);

    setUser(normalized);
    setUnits(normalized.units);

    localStorage.setItem("user", JSON.stringify(normalized));
  };

  // =========================
  // UPDATE UNITS (SYNC SAFE)
  // =========================
  const updateUnits = (newUnits) => {
    setUnits(newUnits);

    setUser((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        units: newUnits,
      };

      localStorage.setItem("user", JSON.stringify(updated));

      return updated;
    });
  };

  // =========================
  // RESET USER (LOGOUT SAFE)
  // =========================
  const clearUser = () => {
    setUser(null);
    setUnits(0);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        units,
        setUnits: updateUnits,
        setUser: updateUser,
        clearUser,

        // 🔥 GLOBAL ADMIN ACCESS
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}