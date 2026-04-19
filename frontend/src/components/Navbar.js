import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const BASE_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://thefolio-lw3l.onrender.com/';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [showModal, setShowModal] = useState(false);

    if (location.pathname === "/") return null;

    const go = (path) => navigate(path);
    const isActive = (path) => location.pathname === path;

    const navBg = isDark ? "rgba(15,5,15,0.90)" : "rgba(255,255,255,0.80)";
    const border = isDark ? "rgba(236,72,153,0.25)" : "rgba(236,72,153,0.18)";
    const mutedCol = isDark ? "#9ca3af" : "#6b7280";
    const textCol = isDark ? "#f3f4f6" : "#1f2937";

    const link = (path) => ({
        padding: "6px 12px", borderRadius: "8px", cursor: "pointer",
        fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap",
        background: isActive(path)
            ? (isDark ? "rgba(236,72,153,0.18)" : "linear-gradient(135deg,#fce7f3,#e0f2fe)")
            : "transparent",
        color: isActive(path) ? "#ec4899" : mutedCol,
        border: "none", transition: "all 0.2s",
    });

    const authBtn = (variant) => ({
        padding: "6px 16px", borderRadius: "20px", cursor: "pointer",
        fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap",
        border: variant === "outline" ? "2px solid #ec4899" : "none",
        background: variant === "fill" ? "linear-gradient(135deg,#ec4899,#f472b6)" : "transparent",
        color: variant === "fill" ? "white" : "#ec4899",
    });

    const profileSrc = user?.profile_pic ? `${BASE_URL}/uploads/${user.profile_pic}` : null;

    const publicLinks = (
        <>
            <span style={link("/home")} onClick={() => go("/home")}>Home</span>
            <span style={link("/about")} onClick={() => go("/about")}>About</span>
            <span style={link("/contact")} onClick={() => go("/contact")}>Contact</span>
        </>
    );

    return (
        <nav style={{ position: "sticky", top: 0, zIndex: 100, background: navBg, backdropFilter: "blur(14px)", borderBottom: `1px solid ${border}`, boxShadow: "0 2px 14px rgba(236,72,153,0.09)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 18px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                {/* Logo */}
                <div onClick={() => go("/home")} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <img src={`${BASE_URL}/uploads/logo.png`} alt="logo" style={{ width: "32px", height: "32px", borderRadius: "50%" }} onError={e => e.target.style.display = "none"} />
                    <span style={{ background: "linear-gradient(135deg,#ec4899,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "17px" }}>
                        Captured Memories
                    </span>
                </div>

                {/* Nav links */}
                <div style={{ display: "flex", alignItems: "center", gap: "2px", flexWrap: "nowrap" }}>
                    {user?.role === "admin" ? (
                        <>
                            <span style={link("/admin")} onClick={() => go("/admin")}>🛠 Dashboard</span>
                            {publicLinks}
                        </>
                    ) : (
                        <>
                            {publicLinks}
                            {user && <span style={link("/dashboard")} onClick={() => go("/dashboard")}>📊 Dashboard</span>}
                            {user && <span style={link("/create")} onClick={() => go("/create")}>+ New Post</span>}
                        </>
                    )}
                </div>

                {/* Right side */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    {/* Theme toggle */}
                    <button onClick={toggleTheme} title={isDark ? "Light Mode" : "Dark Mode"} style={{ width: "50px", height: "26px", borderRadius: "13px", border: "none", cursor: "pointer", position: "relative", background: isDark ? "linear-gradient(135deg,#ec4899,#f472b6)" : "rgba(0,0,0,0.13)", flexShrink: 0, transition: "background 0.3s" }}>
                        <div style={{ position: "absolute", top: "2px", left: isDark ? "24px" : "2px", width: "22px", height: "22px", borderRadius: "50%", background: "white", transition: "left 0.3s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>
                            {isDark ? "🌙" : "☀️"}
                        </div>
                    </button>

                    {user ? (
                        <>
                            <div onClick={() => go("/profile")} title="My Profile" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#ec4899,#f472b6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "13px", cursor: "pointer", overflow: "hidden", border: "2px solid rgba(236,72,153,0.35)", flexShrink: 0 }}>
                                {profileSrc ? <img src={profileSrc} alt="av" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: "13px", color: textCol, fontWeight: "600", whiteSpace: "nowrap" }}>{user.name?.split(" ")[0]}</span>
                            <button style={authBtn("outline")} onClick={() => setShowModal(true)}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button style={authBtn("outline")} onClick={() => go("/login")}>Login</button>
                            <button style={authBtn("fill")} onClick={() => go("/register")}>Register</button>
                        </>
                    )}
                </div>
            </div>

            {/* Logout modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                    <div style={{ background: isDark ? "#111" : "#fff", padding: "28px", borderRadius: "16px", maxWidth: "320px", width: "90%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "20px", color: textCol, marginBottom: "20px" }}>Are you sure you want to log out?</p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setShowModal(false)} style={{ ...authBtn("outline"), flex: 1, padding: "10px" }}>Cancel</button>
                            <button onClick={() => { logout(); setShowModal(false); navigate("/login"); }} style={{ ...authBtn("fill"), flex: 1, padding: "10px" }}>Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
