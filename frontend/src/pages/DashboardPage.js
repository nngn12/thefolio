import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const BASE_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://thefolio-lw3l.onrender.com/';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [posts, setPosts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        if (!user) { navigate("/login"); return; }

        API.get("/posts/mine").then(r => setPosts(Array.isArray(r.data) ? r.data : []))
            .catch(() => setPosts([]))
            .finally(() => setPostsLoading(false));

        API.get("/messages/my").then(r => setMessages(Array.isArray(r.data) ? r.data : []))
            .catch(() => setMessages([]))
            .finally(() => setMessagesLoading(false));
    }, [user, navigate]);

    const profileSrc = user?.profile_pic
        ? `${BASE_URL}/uploads/${user.profile_pic}`
        : null;

    const unreadReplies = messages.filter(m => m.adminReply && m.adminReply.trim()).length;

    const tabStyle = (key) => ({
        padding: "10px 0", marginRight: "28px",
        background: "none", border: "none",
        borderBottom: activeTab === key ? `2px solid ${t.pink}` : "2px solid transparent",
        color: activeTab === key ? t.pink : t.textMuted,
        fontFamily: t.fontSans, fontSize: "13px", fontWeight: activeTab === key ? "600" : "400",
        letterSpacing: "0.05em", cursor: "pointer", transition: "all 0.2s",
        marginBottom: "-1px",
    });

    const cardStyle = {
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: "12px", padding: "20px 22px",
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: "16px",
        boxShadow: t.shadowSm,
    };

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "880px", margin: "0 auto", padding: "48px 24px 0" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "44px" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: t.pinkGrad, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "22px", overflow: "hidden", border: `2px solid ${t.border}` }}>
                        {profileSrc
                            ? <img src={profileSrc} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : user?.name?.[0]?.toUpperCase()
                        }
                    </div>
                    <div>
                        <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: t.pink, fontWeight: "500", marginBottom: "4px" }}>Member Dashboard</p>
                        <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "32px", fontWeight: "400", color: t.text, margin: 0 }}>{user?.name}</h1>
                        <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "2px" }}>{user?.email}</p>
                        <Link to="/profile" style={{ fontSize: "12px", color: t.pink, textDecoration: "none" }}>Edit profile →</Link>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "14px", marginBottom: "40px" }}>
                    {[
                        { label: "My Posts", val: posts.length, color: t.pink },
                        { label: "Admin Replies", val: unreadReplies, color: t.success },
                        { label: "Messages Sent", val: messages.length, color: "#a78bfa" },
                    ].map(s => (
                        <div key={s.label} style={{ padding: "18px 20px", borderRadius: "10px", background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowSm }}>
                            <div style={{ fontFamily: t.fontSerif, fontSize: "28px", fontWeight: "400", color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: "12px", color: t.textMuted }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: `1px solid ${t.border}`, marginBottom: "32px" }}>
                    <button style={tabStyle("posts")} onClick={() => setActiveTab("posts")}>
                        My Posts ({posts.length})
                    </button>
                    <button style={tabStyle("messages")} onClick={() => setActiveTab("messages")}>
                        Messages {unreadReplies > 0 ? `· ${unreadReplies} repl${unreadReplies > 1 ? "ies" : "y"}` : ""}
                    </button>
                </div>

                {/* POSTS TAB */}
                {activeTab === "posts" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <p style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: t.textMuted, fontWeight: "600", margin: 0 }}>Your Captured Memories</p>
                            <Link to="/create" style={{ padding: "9px 22px", borderRadius: "20px", background: t.pinkGrad, color: "white", fontSize: "12px", fontWeight: "600", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase", boxShadow: "0 3px 12px rgba(190,24,93,0.3)" }}>
                                + New Post
                            </Link>
                        </div>

                        {postsLoading ? (
                            <div style={{ textAlign: "center", padding: "48px 0" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `1px solid ${t.border}`, borderTop: `1px solid ${t.pink}`, margin: "0 auto", animation: "spin 1.2s linear infinite" }} />
                                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                            </div>
                        ) : posts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 0" }}>
                                <p style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "20px", color: t.textSub }}>No memories yet</p>
                                <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "8px", marginBottom: "24px" }}>Be the first to share a moment ✦</p>
                                <Link to="/create" style={{ padding: "11px 28px", borderRadius: "20px", background: t.pinkGrad, color: "white", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Write your first post</Link>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {posts.map(post => (
                                    <div key={post.id || post._id} style={cardStyle}>
                                        <div style={{ flex: 1 }}>
                                            <Link to={`/post/${post.id || post._id}`} style={{ textDecoration: "none" }}>
                                                <h3 style={{ fontFamily: t.fontSerif, fontWeight: "500", fontSize: "18px", color: t.text, margin: "0 0 6px", lineHeight: 1.3 }}>{post.title}</h3>
                                            </Link>
                                            <p style={{ margin: 0, fontSize: "12px", color: t.textMuted }}>
                                                {new Date(post.created_at || post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
                                            <Link to={`/edit/${post.id || post._id}`} style={{ fontSize: "12px", color: t.pink, textDecoration: "none", fontWeight: "600" }}>Edit</Link>
                                            <Link to={`/post/${post.id || post._id}`} style={{ fontSize: "12px", color: t.textMuted, textDecoration: "none" }}>View →</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MESSAGES TAB */}
                {activeTab === "messages" && (
                    <div>
                        <p style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: t.textMuted, fontWeight: "600", marginBottom: "20px" }}>
                            Your Messages to Admin
                        </p>

                        {messagesLoading ? (
                            <div style={{ textAlign: "center", padding: "48px 0" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `1px solid ${t.border}`, borderTop: `1px solid ${t.pink}`, margin: "0 auto", animation: "spin 1.2s linear infinite" }} />
                            </div>
                        ) : messages.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 0" }}>
                                <p style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "20px", color: t.textSub }}>No messages yet</p>
                                <Link to="/contact" style={{ display: "inline-block", marginTop: "16px", padding: "11px 28px", borderRadius: "20px", background: t.pinkGrad, color: "white", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>Contact Admin</Link>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {messages.map(msg => (
                                    <div key={msg.id || msg._id} style={{
                                        background: t.card,
                                        border: `1px solid ${t.border}`,
                                        borderLeft: `3px solid ${msg.adminReply ? t.pink : t.border}`,
                                        borderRadius: "12px", padding: "20px",
                                        boxShadow: t.shadowSm,
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                            <span style={{ fontSize: "11px", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your message</span>
                                            <span style={{ fontSize: "12px", color: t.textMuted }}>
                                                {new Date(msg.created_at || msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "14px", color: t.textSub, lineHeight: "1.65", margin: "0 0 14px" }}>{msg.message}</p>

                                        {msg.adminReply || msg.reply_text ? (
                                            <div style={{ background: isDark ? "rgba(190,24,93,0.08)" : "rgba(190,24,93,0.04)", border: `1px solid ${t.border}`, borderRadius: "10px", padding: "14px 16px" }}>
                                                <span style={{ fontSize: "11px", fontWeight: "700", color: t.pink, textTransform: "uppercase", letterSpacing: "0.08em" }}>✉ Admin replied</span>
                                                <p style={{ margin: "8px 0 0", fontSize: "14px", color: t.textSub, lineHeight: "1.65" }}>
                                                    {msg.adminReply || msg.reply_text}
                                                </p>
                                            </div>
                                        ) : (
                                            <p style={{ margin: 0, fontSize: "12px", color: t.textMuted, fontStyle: "italic" }}>Waiting for admin reply…</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default DashboardPage;
