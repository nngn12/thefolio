import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios"; // make sure your API helper exists

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Load user from localStorage on startup
    useEffect(() => {
        const saved = localStorage.getItem("user");
        if (saved) setUser(JSON.parse(saved));
    }, []);

    // Login function
    const login = async ({ email, password }) => {
        try {
            const res = await API.post("/auth/login", { email, password });
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
        } catch (err) {
            alert("Login failed");
        }
    };

    // Register function
    const register = async ({ name, email, password }) => {
        try {
            const res = await API.post("/auth/register", { name, email, password });
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
        } catch (err) {
            alert("Registration failed");
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);