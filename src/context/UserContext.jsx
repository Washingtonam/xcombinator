import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [units, setUnits] = useState(0);

  // =========================
  // LOAD USER FROM STORAGE
  // =========================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      setUser(storedUser);
      setUnits(storedUser.units || 0); // 🔥 IMPORTANT
    }
  }, []);

  // =========================
  // UPDATE USER (LOGIN / REGISTER)
  // =========================
  const updateUser = (userData) => {
    setUser(userData);
    setUnits(userData.units || 0);

    localStorage.setItem("user", JSON.stringify(userData));
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
        setUnits: updateUnits, // 🔥 USE THIS EVERYWHERE
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