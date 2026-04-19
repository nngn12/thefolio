import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

// This removes '/api' from your URL so it points to the root /uploads folder
const BASE_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://thefolio-lw3l.onrender.com/';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/posts")
            .then(r => setPosts(Array.isArray(r.data) ? r.data : []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>

            {/* --- EXTRA HEADER REMOVED FROM HERE --- */}

            {/* Hero */}
            <div
                style={{
                    borderBottom: `1px solid ${t.border}`,
                    padding: "56px 24px 48px",
                    textAlign: "center",
                    background: isDark ? "rgba(190,24,93,0.03)" : "rgba(190,24,93,0.02)"
                }}
            >
                <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: t.pink, fontWeight: "500", marginBottom: "16px" }}>
                    Our Journal
                </p>
                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "clamp(36px, 5vw, 54px)", fontWeight: "400", color: t.text, letterSpacing: "-0.02em", marginBottom: "16px", lineHeight: 1.15 }}>
                    Latest Memories
                </h1>
                <p style={{ fontSize: "15px", color: t.textSub, maxWidth: "400px", margin: "0 auto 28px", lineHeight: 1.7 }}>
                    Every moment captured, every memory preserved.
                </p>
                {user && (
                    <button
                        onClick={() => navigate("/create")}
                        style={{
                            padding: "11px 28px", borderRadius: "24px", border: "none", background: t.pinkGrad, color: "white",
                            fontFamily: t.fontSans, fontWeight: "600", fontSize: "13px", letterSpacing: "0.06em", cursor: "pointer",
                            boxShadow: "0 4px 18px rgba(190,24,93,0.3)", textTransform: "uppercase"
                        }}
                    >
                        New Post
                    </button>
                )}
            </div>

            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 0" }}>
                {loading && (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${t.border}`, borderTop: `1px solid ${t.pink}`, margin: "0 auto", animation: "spin 1.2s linear infinite" }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {!loading && posts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <p style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "22px", color: t.textSub }}>No memories yet</p>
                        <p style={{ fontSize: "14px", color: t.textMuted, marginTop: "8px" }}>Be the first to share a moment ✦</p>
                    </div>
                )}

                <div style={{ display: "grid", gap: "2px" }}>
                    {posts.map((post, i) => {
                        const postImage = post.image ? `${BASE_URL}/uploads/${post.image}` : null;
                        const authorName = post.author_name || "Unknown";
                        const authorPic = post.author_pic ? `${BASE_URL}/uploads/${post.author_pic}` : null;
                        const formattedDate = post.created_at
                            ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "No date";

                        return (
                            <article
                                key={post.id}
                                onClick={() => navigate(`/post/${post.id}`)}
                                style={{
                                    display: "flex", gap: "24px", cursor: "pointer", borderBottom: `1px solid ${t.border}`,
                                    padding: "28px 0", transition: "opacity 0.2s", animation: `fadeUp 0.4s ease ${i * 0.06}s both`
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                        <div style={{
                                            width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0, background: t.pinkGrad,
                                            display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                                            fontSize: "10px", fontWeight: "700", overflow: "hidden"
                                        }}>
                                            {authorPic ? (
                                                <img src={authorPic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                authorName[0]?.toUpperCase()
                                            )}
                                        </div>
                                        <span style={{ fontSize: "12px", color: t.textMuted }}>{authorName} · {formattedDate}</span>
                                    </div>

                                    <h2 style={{ fontFamily: t.fontSerif, fontWeight: "500", fontSize: "22px", color: t.text, marginBottom: "8px", lineHeight: 1.3 }}>
                                        {post.title}
                                    </h2>

                                    <p style={{ fontSize: "14px", color: t.textSub, lineHeight: "1.65", margin: "0" }}>
                                        {post.body?.length > 120 ? post.body.slice(0, 120) + "…" : post.body}
                                    </p>
                                </div>

                                {postImage && (
                                    <div style={{ width: "120px", height: "90px", flexShrink: 0, borderRadius: "8px", overflow: "hidden", background: t.border }}>
                                        <img
                                            src={postImage}
                                            alt={post.title}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </div>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
};

export default HomePage;