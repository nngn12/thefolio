import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // On startup: verify token is still valid & get fresh user data
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");
            if (!token) { setAuthLoading(false); return; }
            try {
                const res = await API.get("/auth/me");
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            } catch {
                // Token expired or invalid — clear everything
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            } finally {
                setAuthLoading(false);
            }
        };
        init();
    }, []);

    const login = async ({ email, password }) => {
        try {
            const res = await API.post("/auth/login", { email, password });
            const { token, user: userData } = res.data;
            setUser(userData);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Login failed" };
        }
    };

    const register = async ({ name, email, password }) => {
        try {
            const res = await API.post("/auth/register", { name, email, password });
            const { token, user: userData } = res.data;
            setUser(userData);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Registration failed" };
        }
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, authLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
