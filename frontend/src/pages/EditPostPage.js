import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const EditPostPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [images, setImages] = useState([]); // new images
    const [existingImages, setExistingImages] = useState([]); // already saved images
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        API.get(`/posts/${id}`)
            .then(r => {
                setTitle(r.data.title);
                setBody(r.data.body);
                const imgs = Array.isArray(r.data.image) ? r.data.image : (r.data.image ? [r.data.image] : []);
                setExistingImages(imgs);
            })
            .catch(() => setError("Failed to load post"))
            .finally(() => setLoading(false));
    }, [id]);

    if (!user) { navigate("/login"); return null; }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !body) return setError("Title and content are required");

        setSaving(true); setError("");
        try {
            const fd = new FormData();
            fd.append("title", title);
            fd.append("body", body);
            fd.append("existingImages", JSON.stringify(existingImages)); // send existing images to keep
            images.forEach(img => fd.append("images", img)); // new images
            await API.put(`/posts/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            navigate(`/post/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed");
            setSaving(false);
        }
    };

    const inputStyle = { width: "100%", padding: "14px 0", border: "none", borderBottom: `1px solid ${t.border}`, fontSize: "15px", fontFamily: t.fontSans, background: "transparent", color: t.text, outline: "none", boxSizing: "border-box" };
    const labelStyle = { display: "block", fontSize: "11px", fontWeight: "500", letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted, marginBottom: "2px" };

    if (loading) return (
        <div style={{ background: t.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${t.border}`, borderTop: `1px solid ${t.pink}`, animation: "spin 1.2s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "52px 24px 0" }}>
                <button onClick={() => navigate(`/post/${id}`)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "13px", fontFamily: t.fontSans, marginBottom: "40px", padding: "0" }}>← Cancel</button>
                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "36px", fontWeight: "400", color: t.text, marginBottom: "48px" }}>Edit Memory</h1>

                {error && <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "28px", background: isDark ? "rgba(190,24,93,0.1)" : "#fef2f2", border: `1px solid rgba(190,24,93,0.2)`, fontSize: "13px", color: t.danger }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div>
                        <label style={labelStyle}>Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...inputStyle, fontSize: "22px", fontFamily: t.fontSerif, fontStyle: "italic" }} />
                    </div>
                    <div>
                        <label style={labelStyle}>Story</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} style={{ ...inputStyle, minHeight: "200px", resize: "vertical", lineHeight: "1.8" }} />
                    </div>
                    <div>
                        <label style={labelStyle}>Photos</label>
                        <label htmlFor="edit-img" style={{ display: "inline-flex", marginTop: "10px", padding: "9px 20px", borderRadius: "8px", border: `1px solid ${t.border}`, color: t.textSub, fontSize: "13px", cursor: "pointer" }}>
                            {previews.length || existingImages.length ? "Change photos" : "Choose photos"}
                        </label>
                        <input id="edit-img" type="file" accept="image/*,.jfif" multiple style={{ display: "none" }}
                            onChange={e => {
                                const files = Array.from(e.target.files);
                                if (files.length) {
                                    setImages(prev => [...prev, ...files]);
                                    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                                }
                            }} />

                        {(previews.length || existingImages.length) && (
                            <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px,1fr))", gap: "10px" }}>
                                {/* New image previews */}
                                {previews.map((p, idx) => (
                                    <div key={`preview-${idx}`} style={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
                                        <img src={p} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "88px", objectFit: "cover" }} />
                                        <button type="button" onClick={() => {
                                            setImages(images.filter((_, i) => i !== idx));
                                            setPreviews(previews.filter((_, i) => i !== idx));
                                        }} style={{ position: "absolute", top: "6px", right: "6px", width: "22px", height: "22px", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "white", cursor: "pointer", fontSize: "12px" }}>×</button>
                                    </div>
                                ))}
                                {/* Existing images */}
                                {existingImages.map((img, idx) => (
                                    <div key={`existing-${idx}`} style={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
                                        <img src={`https://thefolio-lw3l.onrender.com//uploads/${img}`} alt={`Existing ${idx + 1}`} style={{ width: "100%", height: "88px", objectFit: "cover" }} />
                                        <button type="button" onClick={() => {
                                            setExistingImages(existingImages.filter((_, i) => i !== idx));
                                        }} style={{ position: "absolute", top: "6px", right: "6px", width: "22px", height: "22px", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "white", cursor: "pointer", fontSize: "12px" }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" disabled={saving} style={{
                        alignSelf: "flex-start", padding: "13px 36px", borderRadius: "24px", border: "none",
                        background: saving ? t.border : t.pinkGrad, color: "white",
                        fontFamily: t.fontSans, fontWeight: "600", fontSize: "13px",
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        cursor: saving ? "not-allowed" : "pointer",
                        boxShadow: saving ? "none" : "0 4px 18px rgba(190,24,93,0.3)",
                    }}>{saving ? "Saving…" : "Save Changes"}</button>
                </form>
            </div>
        </div>
    );
};

export default EditPostPage;