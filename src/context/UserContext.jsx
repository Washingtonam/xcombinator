import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [units, setUnits] = useState(0);

  // =========================
  // NORMALIZE USER
  // =========================
  const normalizeUser = (userData) => {
    if (!userData) return null;

    return {
      ...userData,
      id: userData.id || userData._id, // 🔥 FIX HERE
      units: userData.units || 0,
    };
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
  // UPDATE UNITS
  // =========================
  const updateUnits = (newUnits) => {
    setUnits(newUnits);

    const updatedUser = {
      ...user,
      units: newUnits,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        units,
        setUnits: updateUnits,
        setUser: updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}