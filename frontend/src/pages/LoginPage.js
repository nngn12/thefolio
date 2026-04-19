import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return setError("Please fill in all fields");

        if (loading) return; // prevent double click
        setLoading(true);
        setError("");

        try {
            const result = await login({ email, password });

            if (result?.success) {
                navigate("/home");
            } else {
                setError(result?.message || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%", padding: "13px 16px",
        borderRadius: "10px",
        border: `1px solid ${t.border}`,
        fontSize: "14px", fontFamily: t.fontSans,
        background: t.input, color: t.text,
        outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box",
    };

    return (
        <div style={{
            fontFamily: t.fontSans, background: t.bg,
            minHeight: "100vh", display: "flex",
            justifyContent: "center", alignItems: "center",
            padding: "20px",
        }}>
            <div style={{
                position: "fixed", top: "20%", right: "15%",
                width: "340px", height: "340px", borderRadius: "50%",
                background: isDark ? "rgba(190,24,93,0.04)" : "rgba(190,24,93,0.05)",
                filter: "blur(80px)", pointerEvents: "none",
            }} />

            <div style={{
                width: "100%", maxWidth: "400px",
                background: t.card,
                border: `1px solid ${t.border}`,
                padding: "48px 40px",
                borderRadius: "16px",
                boxShadow: t.shadow,
                animation: "fadeUp 0.5s ease both",
            }}>
                <div style={{ textAlign: "center", marginBottom: "36px" }}>
                    <h1 style={{
                        fontFamily: t.fontSerif, fontStyle: "italic",
                        fontSize: "32px", fontWeight: "400",
                        color: t.text, marginBottom: "8px",
                    }}>Welcome back</h1>
                    <p style={{ fontSize: "13px", color: t.textMuted, letterSpacing: "0.02em" }}>
                        Sign in to your account
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: "11px 14px", borderRadius: "8px", marginBottom: "20px",
                        background: isDark ? "rgba(190,24,93,0.1)" : "#fef2f2",
                        border: `1px solid rgba(190,24,93,0.2)`,
                        fontSize: "13px", color: t.danger,
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "500", letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" }}>Email</label>
                        <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: "block", fontSize: "12px", fontWeight: "500", letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" }}>Password</label>
                        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: "100%", padding: "13px",
                        borderRadius: "10px", border: "none",
                        background: loading ? t.border : t.pinkGrad,
                        color: "white", fontFamily: t.fontSans,
                        fontWeight: "600", fontSize: "14px",
                        letterSpacing: "0.04em",
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: loading ? "none" : "0 4px 16px rgba(190,24,93,0.3)",
                        transition: "all 0.2s", marginTop: "4px",
                    }}>
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "28px", fontSize: "13px", color: t.textMuted }}>
                    No account?{" "}
                    <Link to="/register" style={{ color: t.pink, fontWeight: "500", textDecoration: "none" }}>Create one</Link>
                </p>
            </div>

            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
};

export default LoginPage;