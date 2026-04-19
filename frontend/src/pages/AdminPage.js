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

    // Define Admin ID for chat alignment
    const adminId = user?.id || user?._id;

    useEffect(() => {
        if (!user || user.role !== "admin") { navigate("/home"); return; }

        const fetchData = async () => {
            const extractArray = (data, keyword) => {
                if (!data) return [];
                if (Array.isArray(data)) return data;
                if (Array.isArray(data.data)) return data.data;
                if (Array.isArray(data[keyword])) return data[keyword];
                return [];
            };

            try {
                const [mRes, pRes, msgRes] = await Promise.all([
                    API.get("/admin/users"),
                    API.get("/posts"),
                    API.get("/admin/messages")
                ]);

                setMembers(extractArray(mRes.data, "users"));
                setPosts(extractArray(pRes.data, "posts"));
                setMessages(extractArray(msgRes.data, "messages"));
            } catch (err) {
                console.error("Dashboard fetch error:", err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    // ── ACTION HANDLERS ──

    const handleAdminReply = async (msgId) => {
        const replyInput = document.getElementById(`reply-${msgId}`);
        const text = replyInput?.value;

        if (!text?.trim()) return alert("Please enter a reply");

        try {
            // Note: Updated to handle the conversation thread logic
            const { data } = await API.post(`/admin/messages/${msgId}/reply`, { reply: text });
            const updatedMsg = data.data || data;

            setMessages(prev => prev.map(m => (m._id === msgId || m.id === msgId) ? updatedMsg : m));
            replyInput.value = "";
            alert("Reply sent to thread!");
        } catch (err) {
            alert("Failed to send reply. Ensure your backend route matches.");
        }
    };

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

    // ── STYLES ──

    const tabStyle = (key) => ({
        padding: "8px 0", marginRight: "28px", background: "none", border: "none",
        borderBottom: tab === key ? `2px solid ${t.pink}` : "2px solid transparent",
        color: tab === key ? t.pink : t.textMuted,
        fontFamily: t.fontSans, fontSize: "13px", fontWeight: "500",
        cursor: "pointer", transition: "all 0.2s",
    });

    const btnStyle = (variant) => ({
        padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px",
        border: variant === "primary" ? "none" : `1px solid ${t.border}`,
        background: variant === "primary" ? t.pink : variant === "danger" ? (isDark ? "#450a0a" : "#fef2f2") : "transparent",
        color: variant === "primary" ? "white" : variant === "danger" ? "#ef4444" : t.text,
    });

    if (loading) return <div style={{ background: t.bg, minHeight: "100vh" }} />;

    return (
        <div style={{ background: t.bg, minHeight: "100vh", paddingBottom: "80px", color: t.text }}>
            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 0" }}>
                <h1 style={{ fontFamily: t.fontSerif, fontSize: "40px", marginBottom: "36px" }}>Dashboard</h1>

                {/* Tabs */}
                <div style={{ borderBottom: `1px solid ${t.border}`, marginBottom: "32px", display: "flex" }}>
                    <button style={tabStyle("members")} onClick={() => setTab("members")}>Members</button>
                    <button style={tabStyle("posts")} onClick={() => setTab("posts")}>Posts</button>
                    <button style={tabStyle("messages")} onClick={() => setTab("messages")}>Messages</button>
                </div>

                {/* MEMBERS TAB */}
                {tab === "members" && members.map(u => (
                    <div key={u._id || u.id} style={{ borderBottom: `1px solid ${t.border}`, padding: "15px 0", display: "flex", justifyContent: "space-between" }}>
                        <div>{u.name} ({u.email})</div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button style={btnStyle("secondary")} onClick={() => toggleStatus(u._id || u.id)}>{u.status}</button>
                            <button style={btnStyle("danger")} onClick={() => deleteUser(u._id || u.id, u.name)}>Delete</button>
                        </div>
                    </div>
                ))}

                {/* MESSAGES TAB (With Threads) */}
                {tab === "messages" && messages.map(m => {
                    const mid = m._id || m.id;
                    return (
                        <div key={mid} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", marginBottom: "15px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <strong>{m.name}</strong>
                                <span style={{ fontSize: "12px", color: t.textMuted }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ fontSize: "14px", marginBottom: "15px" }}>{m.message}</p>

                            {/* Conversation Thread */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                                {m.replies?.map((r, i) => (
                                    <div key={i} style={{
                                        alignSelf: (r.sender === adminId || r.sender?._id === adminId) ? 'flex-end' : 'flex-start',
                                        background: (r.sender === adminId || r.sender?._id === adminId) ? t.pink : (isDark ? '#334155' : '#f3f4f6'),
                                        color: (r.sender === adminId || r.sender?._id === adminId) ? 'white' : t.text,
                                        padding: '8px 12px', borderRadius: '10px', maxWidth: '80%', fontSize: '13px'
                                    }}>
                                        {r.text}
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" id={`reply-${mid}`} placeholder="Type reply..." style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${t.border}`, background: t.input, color: t.text }} />
                                <button onClick={() => handleAdminReply(mid)} style={btnStyle("primary")}>Send</button>
                                <button onClick={() => deleteMsg(mid)} style={btnStyle("danger")}>Delete</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminPage;