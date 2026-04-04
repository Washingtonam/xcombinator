import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      if (theme === "dark") {
        root.classList.add("dark");
      } 
      else if (theme === "light") {
        root.classList.remove("dark");
      } 
      else {
        // system mode
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemDark) root.classList.add("dark");
        else root.classList.remove("dark");
      }
    };

    applyTheme();

    // listen to system change ONLY if system mode
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (theme === "system") applyTheme();
    };

    media.addEventListener("change", listener);

    localStorage.setItem("theme", theme);

    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev =>
      prev === "dark" ? "light" : "dark"
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);