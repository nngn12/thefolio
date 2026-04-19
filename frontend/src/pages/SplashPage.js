import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

const SplashPage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 2600);
        const t2 = setTimeout(() => navigate("/home"), 3200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [navigate]);

    return (
        <div style={{
            fontFamily: t.fontSans,
            background: t.bg,
            height: "100vh",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center",
            gap: "0",
            opacity: phase === 1 ? 0 : 1,
            transition: "opacity 0.6s ease",
        }}>
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} style={{
                        position: "absolute",
                        width: "1px",
                        height: "40%",
                        background: `linear-gradient(to bottom, transparent, rgba(190,24,93,${0.04 + i * 0.015}), transparent)`,
                        left: `${15 + i * 18}%`,
                        top: "30%",
                        transform: `rotate(${-10 + i * 5}deg)`,
                    }} />
                ))}
            </div>

            <div style={{ textAlign: "center", animation: "fadeUp 0.9s ease both" }}>
                {/* ✅ FIXED: Points directly to the logo in your public folder */}
                <img src="/logo.png" alt="logo"
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        marginBottom: "28px",
                        animation: "float 3s ease-in-out infinite",
                        boxShadow: "0 8px 32px rgba(190,24,93,0.2)",
                        objectFit: "cover"
                    }}
                    onError={e => { e.target.style.display = "none"; }}
                />

                <h1 style={{
                    fontFamily: t.fontSerif,
                    fontSize: "clamp(36px, 6vw, 56px)",
                    fontWeight: "400",
                    fontStyle: "italic",
                    color: t.text,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    marginBottom: "12px",
                }}>
                    Captured Memories
                </h1>
                <p style={{
                    fontSize: "13px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: t.textMuted,
                    fontWeight: "400",
                    marginBottom: "48px",
                }}>
                    Preserve your moments beautifully
                </p>

                <div style={{
                    width: "36px", height: "36px",
                    borderRadius: "50%",
                    border: `1px solid ${t.border}`,
                    borderTop: `1px solid ${t.pink}`,
                    margin: "0 auto",
                    animation: "spin 1.2s linear infinite",
                }} />
            </div>

            <style>{`
                @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes float  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
                @keyframes spin   { to { transform:rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SplashPage;