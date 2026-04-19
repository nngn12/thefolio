import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // On startup: verify token & get fresh user data
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            // Pre-fill state from storage to prevent "Unknown" flashes during refresh
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            if (!token) {
                setAuthLoading(false);
                return;
            }

            try {
                const res = await API.get("/auth/me");
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
            } catch (err) {
                // Token expired or invalid — clear everything
                logout();
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
            // Note: register in your backend logic sends OTP first, 
            // so this should match your frontend flow (VerifyOTP page)
            const res = await API.post("/auth/register", { name, email, password });
            return { success: true, message: res.data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Registration failed" };
        }
    };

    // This handles the persistent update you need for profile pictures
    const updateUser = (updatedData) => {
        // Ensure we are saving the correct user object if backend wraps it
        const newUser = updatedData.user ? updatedData.user : updatedData;
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
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