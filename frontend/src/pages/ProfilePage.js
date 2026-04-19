import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

// Clean up BASE_URL to ensure no trailing slashes interfere with path joining
const BASE_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '').replace(/\/$/, '')
    : 'https://thefolio-lw3l.onrender.com';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [pic, setPic] = useState(null);
    const [picPreview, setPicPreview] = useState(null);
    const [curPw, setCurPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [myPosts, setMyPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState("success");
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        setName(user.name || "");
        setBio(user.bio || "");

        API.get("/posts/mine")
            .then(r => setMyPosts(Array.isArray(r.data) ? r.data : []))
            .catch(() => setMyPosts([]))
            .finally(() => setPostsLoading(false));
    }, [user, navigate]);

    const flash = (text, type = "success") => {
        setMsg(text); setMsgType(type);
        setTimeout(() => setMsg(""), 4000);
    };

    const handleProfile = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append("name", name);
            fd.append("bio", bio);
            // 'profilePic' must match the key in your backend upload middleware
            if (pic) fd.append("profilePic", pic);

            const res = await API.put("/auth/profile", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // ✅ This calls the new updateUser logic in AuthContext to persist to LocalStorage
            if (updateUser) {
                updateUser(res.data);
            }

            // ✅ Reset local file states so the UI switches back to the server-hosted image
            setPic(null);
            setPicPreview(null);

            flash("Profile updated! 🌸");
            setShowEditProfile(false);
        } catch (err) {
            flash(err.response?.data?.message || "Update failed", "error");
        }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (newPw.length < 6) { flash("New password must be at least 6 characters", "error"); return; }
        try {
            await API.put("/auth/change-password", { currentPassword: curPw, newPassword: newPw });
            flash("Password changed successfully! 🔒");
            setCurPw(""); setNewPw("");
            setShowChangePassword(false);
        } catch (err) {
            flash(err.response?.data?.message || "Password change failed", "error");
        }
    };

    // Prioritize the preview if the user just selected a file, otherwise use the stored pic
    const picSrc = picPreview
        ? picPreview
        : (user?.profilePic ? `${BASE_URL}/uploads/${user.profilePic}` : null);

    const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: "10px", border: `1px solid ${t.border}`, fontSize: "14px", fontFamily: t.fontSans, background: t.input, color: t.text, outline: "none", boxSizing: "border-box", marginBottom: "14px" };
    const labelStyle = { display: "block", fontSize: "12px", fontWeight: "500", letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" };

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ borderBottom: `1px solid ${t.border}`, background: isDark ? "rgba(190,24,93,0.03)" : "rgba(190,24,93,0.02)", padding: "40px 24px" }}>
                <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", alignItems: "center", gap: "24px" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: t.pinkGrad, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "28px", fontWeight: "700", overflow: "hidden", boxShadow: "0 4px 20px rgba(190,24,93,0.25)", border: `2px solid ${t.bg}` }}>
                        {picSrc ? <img src={picSrc} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "28px", fontWeight: "400", color: t.text, margin: "0 0 4px" }}>{user?.name}</h1>
                        <p style={{ fontSize: "13px", color: t.textSub, margin: "0 0 4px", lineHeight: "1.5" }}>{user?.bio || "No bio yet."}</p>
                        <p style={{ fontSize: "12px", color: t.textMuted, margin: 0 }}>{user?.email}</p>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "36px 24px 0" }}>
                {msg && (
                    <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "24px", background: msgType === "success" ? (isDark ? "rgba(16,185,129,0.1)" : "#d1fae5") : (isDark ? "rgba(190,24,93,0.1)" : "#fef2f2"), border: `1px solid ${msgType === "success" ? "rgba(16,185,129,0.3)" : "rgba(190,24,93,0.2)"}`, fontSize: "13px", color: msgType === "success" ? t.success : t.danger }}>
                        {msg}
                    </div>
                )}

                <div style={{ background: t.card, borderRadius: "16px", padding: "24px 28px", boxShadow: t.shadowSm, border: `1px solid ${t.border}`, marginBottom: "16px" }}>
                    <h3 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "22px", fontWeight: "400", color: t.text, marginBottom: "20px" }}>📸 My Posts ({myPosts.length})</h3>
                    {postsLoading ? (
                        <p style={{ color: t.textMuted, fontSize: "14px" }}>Loading…</p>
                    ) : myPosts.length === 0 ? (
                        <p style={{ color: t.textMuted, fontSize: "14px" }}>No posts yet. <Link to="/create" style={{ color: t.pink, textDecoration: "none", fontWeight: "500" }}>Write your first one!</Link></p>
                    ) : (
                        myPosts.map(p => (
                            <div key={p._id || p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${t.border}`, padding: "12px 0" }}>
                                <Link to={`/post/${p._id || p.id}`} style={{ fontSize: "14px", fontWeight: "600", color: t.text, textDecoration: "none" }}>{p.title}</Link>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <Link to={`/post/${p._id || p.id}`} style={{ fontSize: "12px", color: t.pink, textDecoration: "none", fontWeight: "500" }}>View →</Link>
                                    <Link to={`/edit/${p._id || p.id}`} style={{ fontSize: "12px", color: t.textMuted, textDecoration: "none" }}>Edit</Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ background: t.card, borderRadius: "16px", boxShadow: t.shadowSm, border: `1px solid ${t.border}`, marginBottom: "16px", overflow: "hidden" }}>
                    <button onClick={() => setShowEditProfile(v => !v)} style={{ width: "100%", padding: "22px 28px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: t.fontSans }}>
                        <h3 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "20px", fontWeight: "400", color: t.text, margin: 0 }}>✏️ Edit Profile</h3>
                        <span style={{ fontSize: "18px", color: t.textMuted, transform: showEditProfile ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>▾</span>
                    </button>
                    {showEditProfile && (
                        <div style={{ padding: "0 28px 28px", borderTop: `1px solid ${t.border}` }}>
                            <form onSubmit={handleProfile} style={{ marginTop: "20px" }}>
                                <label style={labelStyle}>Display Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
                                <label style={labelStyle}>Bio</label>
                                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell something about yourself…" style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
                                <label style={labelStyle}>Profile Picture</label>
                                <input type="file" accept="image/*" onChange={e => {
                                    const f = e.target.files[0];
                                    if (f) {
                                        setPic(f);
                                        setPicPreview(URL.createObjectURL(f));
                                    }
                                }} style={{ marginBottom: "14px", color: t.textSub, fontSize: "13px" }} />
                                {picPreview && <img src={picPreview} alt="Preview" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", marginBottom: "14px", border: `2px solid ${t.pink}` }} />}
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button type="submit" style={{ padding: "11px 28px", borderRadius: "10px", border: "none", background: t.pinkGrad, color: "white", fontFamily: t.fontSans, fontWeight: "600", cursor: "pointer", boxShadow: "0 3px 12px rgba(190,24,93,0.25)" }}>Save Changes</button>
                                    <button type="button" onClick={() => { setShowEditProfile(false); setPicPreview(null); }} style={{ padding: "11px 22px", borderRadius: "10px", border: `1px solid ${t.border}`, background: "transparent", color: t.textSub, fontFamily: t.fontSans, cursor: "pointer" }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;