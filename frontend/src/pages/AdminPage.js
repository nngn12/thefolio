import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const AdminPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [members, setMembers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [tab, setTab] = useState("members");
    const [loading, setLoading] = useState(true);
    const [replyState, setReplyState] = useState({});

    useEffect(() => {
        if (!user || user.role !== "admin") { navigate("/home"); return; }

        const fetchData = async () => {
            try {
                const [mRes, pRes, msgRes] = await Promise.all([
                    API.get("/admin/users"),
                    API.get("/admin/posts"),
                    API.get("/admin/messages"),
                ]);

                // 🕵️ DEBUGGING: Let's see exactly what the backend is sending
                console.log("Raw Members Response:", mRes.data);
                console.log("Raw Posts Response:", pRes.data);
                console.log("Raw Messages Response:", msgRes.data);

                // 🛡️ SUPER BULLETPROOF EXTRACTOR
                // This will hunt down the array no matter how the backend packages it
                const extractArray = (data, keyword) => {
                    if (!data) return [];
                    if (Array.isArray(data)) return data; // If it's already a clean array
                    if (Array.isArray(data.data)) return data.data; // If it's wrapped in { data: [...] }
                    if (Array.isArray(data[keyword])) return data[keyword]; // If it's wrapped in { users: [...] }

                    // If it's deeply nested like { success: true, data: { users: [...] } }
                    if (data.data && Array.isArray(data.data[keyword])) return data.data[keyword];

                    return []; // Safe fallback so .length never crashes
                };

                setMembers(extractArray(mRes.data, "users"));
                setPosts(extractArray(pRes.data, "posts"));
                setMessages(extractArray(msgRes.data, "messages"));

            } catch (err) {
                console.error("Admin fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const toggleStatus = async (id) => {
        try {
            const r = await API.put(`/admin/users/${id}/status`);
            setMembers(prev => prev.map(m => (m.id || m._id) === id ? (r.data.user || r.data) : m));
        } catch { alert("Failed to update status"); }
    };

    const deleteUser = async (id, name) => {
        if (!window.confirm(`Permanently delete "${name}"?`)) return;
        try { await API.delete(`/admin/users/${id}`); setMembers(prev => prev.filter(m => (m.id || m._id) !== id)); }
        catch { alert("Delete failed"); }
    };

    const deletePost = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try { await API.delete(`/posts/${id}`); setPosts(prev => prev.filter(p => (p.id || p._id) !== id)); }
        catch { alert("Delete failed"); }
    };

    const markRead = async (id) => {
        try {
            const { data } = await API.put(`/admin/messages/${id}/read`);
            setMessages(prev => prev.map(m => (m.id || m._id) === id ? data : m));
        } catch { alert("Failed to mark as read"); }
    };

    const deleteMsg = async (id) => {
        if (!window.confirm("Delete this message?")) return;
        try { await API.delete(`/admin/messages/${id}`); setMessages(prev => prev.filter(m => (m.id || m._id) !== id)); }
        catch { alert("Delete failed"); }
    };

    const openReply = (id) => setReplyState(prev => ({ ...prev, [id]: { open: true, text: prev[id]?.text || "", loading: false, sent: false, error: "" } }));
    const closeReply = (id) => setReplyState(prev => ({ ...prev, [id]: { ...prev[id], open: false } }));
    const updateReplyText = (id, text) => setReplyState(prev => ({ ...prev, [id]: { ...prev[id], text } }));

    const sendReply = async (msgId) => {
        const rs = replyState[msgId];
        if (!rs?.text?.trim()) return;
        setReplyState(prev => ({ ...prev, [msgId]: { ...prev[msgId], loading: true, error: "" } }));
        try {
            const endpoint = `/admin/messages/${msgId}/reply`;
            const body = rs.text.trim();
            let updated;
            try {
                const { data } = await API.post(endpoint, { reply: body });
                updated = data.data || data;
            } catch {
                const { data } = await API.put(endpoint, { reply_text: body });
                updated = data;
            }
            setMessages(prev => prev.map(m => (m.id || m._id) === msgId ? { ...m, ...updated, adminReply: body, reply_text: body } : m));
            setReplyState(prev => ({ ...prev, [msgId]: { open: false, text: "", loading: false, sent: true, error: "" } }));
        } catch (err) {
            setReplyState(prev => ({ ...prev, [msgId]: { ...prev[msgId], loading: false, error: err.response?.data?.message || "Failed to send reply" } }));
        }
    };

    const tabStyle = (key) => ({
        padding: "8px 0", marginRight: "28px", background: "none", border: "none",
        borderBottom: tab === key ? `2px solid ${t.pink}` : "2px solid transparent",
        color: tab === key ? t.pink : t.textMuted,
        fontFamily: t.fontSans, fontSize: "13px", fontWeight: "500",
        letterSpacing: "0.05em", cursor: "pointer", transition: "all 0.2s",
    });
    const btnStyle = (variant) => ({
        padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontFamily: t.fontSans, fontSize: "12px",
        border: variant === "primary" ? "none" : `1px solid ${t.border}`,
        background: variant === "primary" ? t.pink : variant === "danger" ? (isDark ? "rgba(190,18,60,0.15)" : "#fef2f2") : "transparent",
        color: variant === "primary" ? "white" : variant === "danger" ? t.danger : t.text,
        transition: "opacity 0.2s",
    });
    const unreadCount = messages.filter(m => !m.read).length;
    const emptyState = { padding: "40px 0", textAlign: "center", color: t.textMuted, fontSize: "14px", fontStyle: "italic", border: `1px dashed ${t.border}`, borderRadius: "12px", marginTop: "20px" };

    if (loading) return <div style={{ background: t.bg, minHeight: "100vh" }} />;

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 0" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: t.pink, fontWeight: "500", marginBottom: "12px" }}>Admin</p>
                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "40px", fontWeight: "400", color: t.text, marginBottom: "36px" }}>Dashboard</h1>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "14px", marginBottom: "48px" }}>
                    {[
                        { label: "Members", val: members.length, color: t.pink },
                        {
                            label: "Active",
                            // Include "active" OR users who don't have a status explicitly set yet
                            val: members.filter(m => m.status === "active" || !m.status).length,
                            color: t.success
                        },
                        { label: "Posts", val: posts.length, color: "#60a5fa" },
                        { label: "Unread msgs", val: unreadCount, color: "#a78bfa" },
                    ].map(s => (
                        <div key={s.label} style={{ padding: "20px 22px", borderRadius: "10px", background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadowSm }}>
                            <div style={{ fontFamily: t.fontSerif, fontSize: "30px", fontWeight: "400", color: s.color }}>{s.val}</div>
                            <div style={{ fontSize: "12px", color: t.textMuted }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: `1px solid ${t.border}`, marginBottom: "32px", display: "flex" }}>
                    <button style={tabStyle("members")} onClick={() => setTab("members")}>Members</button>
                    <button style={tabStyle("posts")} onClick={() => setTab("posts")}>Posts</button>
                    <button style={{ ...tabStyle("messages"), position: "relative" }} onClick={() => setTab("messages")}>
                        Messages
                        {unreadCount > 0 && <span style={{ marginLeft: "6px", background: t.pink, color: "white", fontSize: "10px", padding: "1px 7px", borderRadius: "99px", fontWeight: "700" }}>{unreadCount}</span>}
                    </button>
                </div>

                {/* MEMBERS */}
                {tab === "members" && (
                    members.length > 0 ? members.map(u => (
                        <div key={u.id || u._id} style={{ borderBottom: `1px solid ${t.border}`, padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: "500", color: u.status !== "active" ? t.textMuted : t.text }}>{u.name}</p>
                                <p style={{ margin: 0, fontSize: "12px", color: t.textMuted }}>{u.email} · {new Date(u.created_at || u.createdAt).toLocaleDateString()}</p>
                                <span style={{ display: "inline-block", marginTop: "4px", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", background: u.status === "active" ? (isDark ? "rgba(16,185,129,0.15)" : "#d1fae5") : (isDark ? "rgba(239,68,68,0.15)" : "#fee2e2"), color: u.status === "active" ? t.success : t.danger }}>{u.status || "active"}</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => toggleStatus(u.id || u._id)} style={btnStyle("secondary")}>{u.status === "active" ? "Deactivate" : "Activate"}</button>
                                {u.role !== "admin" && <button onClick={() => deleteUser(u.id || u._id, u.name)} style={btnStyle("danger")}>Remove</button>}
                            </div>
                        </div>
                    )) : <div style={emptyState}>No members found 👥</div>
                )}

                {/* POSTS */}
                {tab === "posts" && (
                    posts.length > 0 ? posts.map(p => (
                        <div key={p.id || p._id} style={{ borderBottom: `1px solid ${t.border}`, padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: "500", color: t.text }}>{p.title}</p>
                                <p style={{ margin: 0, fontSize: "12px", color: t.textMuted }}>By: {p.author_name || p.author?.name} · {new Date(p.created_at || p.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => navigate(`/post/${p.id || p._id}`)} style={btnStyle("secondary")}>View</button>
                                <button onClick={() => deletePost(p.id || p._id)} style={btnStyle("danger")}>Delete</button>
                            </div>
                        </div>
                    )) : <div style={emptyState}>No posts available 📝</div>
                )}

                {/* MESSAGES */}
                {tab === "messages" && (
                    messages.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {messages.map(m => {
                                const mid = m.id || m._id;
                                const rs = replyState[mid] || {};
                                const hasReply = m.adminReply || m.reply_text;
                                return (
                                    <div key={mid} style={{ background: t.card, border: `1px solid ${t.border}`, borderLeft: `3px solid ${hasReply ? t.pink : !m.read ? "#f59e0b" : t.border}`, borderRadius: "12px", padding: "20px", boxShadow: t.shadowSm, opacity: m.read && !hasReply ? 0.75 : 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                <span style={{ fontWeight: m.read ? 500 : 700, color: t.text }}>{m.name}</span>
                                                <span style={{ fontSize: "13px", color: t.textMuted }}>{m.email}</span>
                                                {!m.read && <span style={{ background: "#f59e0b", color: "white", fontSize: "10px", padding: "2px 8px", borderRadius: "99px", fontWeight: "700" }}>NEW</span>}
                                                {hasReply && <span style={{ background: t.pink, color: "white", fontSize: "10px", padding: "2px 8px", borderRadius: "99px", fontWeight: "700" }}>REPLIED</span>}
                                            </div>
                                            <span style={{ fontSize: "12px", color: t.textMuted }}>{new Date(m.created_at || m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                        </div>

                                        <p style={{ fontSize: "14px", color: t.textSub, lineHeight: "1.65", margin: "0 0 14px" }}>{m.message}</p>

                                        {hasReply && (
                                            <div style={{ background: isDark ? "rgba(190,24,93,0.08)" : "rgba(190,24,93,0.04)", border: `1px solid ${t.border}`, borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
                                                <span style={{ fontSize: "11px", fontWeight: "700", color: t.pink, textTransform: "uppercase", letterSpacing: "0.08em" }}>✉ Your reply</span>
                                                <p style={{ margin: "6px 0 0", fontSize: "13px", color: t.textSub }}>{m.adminReply || m.reply_text}</p>
                                            </div>
                                        )}

                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                                            {!m.read && <button onClick={() => markRead(mid)} style={btnStyle("secondary")}>✓ Mark Read</button>}
                                            <button onClick={() => rs.open ? closeReply(mid) : openReply(mid)} style={btnStyle("primary")}>{hasReply ? "✏️ Edit Reply" : "✉ Reply"}</button>
                                            <button onClick={() => deleteMsg(mid)} style={btnStyle("danger")}>Delete</button>
                                        </div>

                                        {rs.open && (
                                            <div style={{ marginTop: "14px", borderTop: `1px solid ${t.border}`, paddingTop: "14px" }}>
                                                <label style={{ fontSize: "12px", fontWeight: "600", color: t.textMuted, display: "block", marginBottom: "8px" }}>
                                                    Reply to {m.name} — visible in their dashboard
                                                </label>
                                                <textarea rows={4} placeholder="Type your reply…" value={rs.text} onChange={e => updateReplyText(mid, e.target.value)}
                                                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${t.border}`, background: t.input, color: t.text, fontFamily: t.fontSans, fontSize: "14px", resize: "vertical" }} />
                                                {rs.error && <p style={{ color: t.danger, fontSize: "12px", margin: "4px 0" }}>{rs.error}</p>}
                                                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                                                    <button onClick={() => sendReply(mid)} disabled={rs.loading || !rs.text?.trim()} style={{ ...btnStyle("primary"), opacity: rs.loading || !rs.text?.trim() ? 0.5 : 1 }}>
                                                        {rs.loading ? "Sending…" : "Send Reply"}
                                                    </button>
                                                    <button onClick={() => closeReply(mid)} style={btnStyle("secondary")}>Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                        {rs.sent && !rs.open && <p style={{ marginTop: "8px", fontSize: "12px", color: t.success }}>✅ Reply sent.</p>}
                                    </div>
                                );
                            })}
                        </div>
                    ) : <div style={{ padding: "40px 0", textAlign: "center", color: t.textMuted, fontSize: "14px", fontStyle: "italic", border: `1px dashed ${t.border}`, borderRadius: "12px", marginTop: "20px" }}>No messages yet 💌</div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;
