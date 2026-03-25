import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);

  // 🔥 CENTRAL FUNCTION (IMPORTANT)
  const fetchBalance = async (userId) => {
    try {
      const res = await fetch("https://xcombinator.onrender.com/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error("Balance fetch error:", error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      setUser(storedUser);
      fetchBalance(storedUser.id);
    }
  }, []);

  // 🔥 AUTO SYNC (VERY IMPORTANT)
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchBalance(user.id);
      }, 5000); // every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        balance,
        setBalance,
        refreshBalance: () => fetchBalance(user?.id), // 🔥 manual trigger
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}