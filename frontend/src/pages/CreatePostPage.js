import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const CreatePostPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [images, setImages] = useState([]); // ✅ Array for multiple files
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!user) { navigate("/login"); return null; }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !body) return setError("Title and content are required");
        setLoading(true); setError("");
        try {
            const fd = new FormData();
            fd.append("title", title);
            fd.append("body", body);

            // Change "images" to "image" here:
            images.forEach((file) => {
                fd.append("image", file);
            });

            await API.post("/posts", fd, { headers: { "Content-Type": "multipart/form-data" } });
            navigate("/home");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create post");
            setLoading(false);
        }
    };

    const inputStyle = { width: "100%", padding: "14px 0", borderRadius: "0", border: "none", borderBottom: `1px solid ${t.border}`, fontSize: "15px", fontFamily: t.fontSans, background: "transparent", color: t.text, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" };
    const labelStyle = { display: "block", fontSize: "11px", fontWeight: "500", letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted, marginBottom: "2px" };

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "52px 24px 0" }}>
                <button onClick={() => navigate("/home")} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "13px", fontFamily: t.fontSans, marginBottom: "40px", padding: "0" }}>
                    ← Cancel
                </button>

                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "36px", fontWeight: "400", color: t.text, marginBottom: "48px" }}>New Memory</h1>

                {error && <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "28px", background: isDark ? "rgba(190,24,93,0.1)" : "#fef2f2", border: `1px solid rgba(190,24,93,0.2)`, fontSize: "13px", color: t.danger }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div>
                        <label style={labelStyle}>Title</label>
                        <input type="text" placeholder="Give your memory a title…" value={title} onChange={e => setTitle(e.target.value)} style={{ ...inputStyle, fontSize: "22px", fontFamily: t.fontSerif, fontStyle: "italic" }} />
                    </div>
                    <div>
                        <label style={labelStyle}>Story</label>
                        <textarea placeholder="Tell the story of this memory…" value={body} onChange={e => setBody(e.target.value)}
                            style={{ ...inputStyle, minHeight: "200px", resize: "vertical", lineHeight: "1.8", borderBottom: `1px solid ${t.border}` }} />
                    </div>
                    <div>
                        <label style={labelStyle}>Photos</label>
                        <div style={{ marginTop: "10px" }}>
                            <label htmlFor="img-upload" style={{
                                display: "inline-flex", alignItems: "center", gap: "8px",
                                padding: "9px 20px", borderRadius: "8px", border: `1px solid ${t.border}`,
                                color: t.textSub, fontSize: "13px", cursor: "pointer", background: "transparent",
                            }}>
                                {previews.length ? "Add more photos" : "Choose photos"}
                            </label>
                            <input id="img-upload" type="file" accept="image/*,.jfif" multiple style={{ display: "none" }}
                                onChange={e => {
                                    const files = Array.from(e.target.files);
                                    if (files.length) {
                                        setImages(prev => [...prev, ...files]);
                                        const newPreviews = files.map(f => URL.createObjectURL(f));
                                        setPreviews(prev => [...prev, ...newPreviews]);
                                    }
                                }} />
                        </div>
                        {previews.length > 0 && (
                            <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px,1fr))", gap: "10px" }}>
                                {previews.map((p, idx) => (
                                    <div key={`${p}-${idx}`} style={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
                                        <img src={p} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "88px", objectFit: "cover" }} />
                                        <button type="button" onClick={() => {
                                            const newImages = images.filter((_, i) => i !== idx);
                                            const newPreviews = previews.filter((_, i) => i !== idx);
                                            setImages(newImages);
                                            setPreviews(newPreviews);
                                        }} style={{ position: "absolute", top: "6px", right: "6px", width: "22px", height: "22px", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "white", cursor: "pointer", fontSize: "12px" }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} style={{
                        alignSelf: "flex-start", padding: "13px 36px", borderRadius: "24px", border: "none",
                        background: loading ? t.border : t.pinkGrad,
                        color: "white", fontFamily: t.fontSans, fontWeight: "600", fontSize: "13px",
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: loading ? "none" : "0 4px 18px rgba(190,24,93,0.3)",
                    }}>{loading ? "Publishing…" : "Publish"}</button>
                </form>
            </div>
        </div>
    );
};

export default CreatePostPage;