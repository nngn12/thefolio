import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

    useEffect(() => {
        localStorage.setItem("theme", isDark ? "dark" : "light");
        document.body.style.background = isDark
            ? "linear-gradient(160deg,#1c0d13 0%,#0f0a10 60%,#130b17 100%)"
            : "linear-gradient(160deg,#fdf7f5 0%,#fef0f3 50%,#f5f0fb 100%)";
        document.body.style.minHeight = "100vh";
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(p => !p) }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
