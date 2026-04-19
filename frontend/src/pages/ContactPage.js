import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const BASE_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'https://thefolio-lw3l.onrender.com/';

const ContactPage = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const t = getTheme(isDark);
    const [formData, setFormData] = useState({ name: user?.name || "", email: user?.email || "", message: "" });
    const [errors, setErrors] = useState({});
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [serverError, setServerError] = useState("");

    const emailPattern = /^[^\s]+@[^\s]+\.[a-z]{2,}$/i;
    const validate = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = "Name is required";
        if (!formData.email.trim()) errs.email = "Email is required";
        else if (!emailPattern.test(formData.email)) errs.email = "Invalid email format";
        if (!formData.message.trim()) errs.message = "Message cannot be empty";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setServerError("");
        const errs = validate(); setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setSending(true);
        try {
            await API.post("/admin/messages", formData);
            setSent(true);
            setFormData(prev => ({ ...prev, message: "" }));
            setTimeout(() => setSent(false), 5000);
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to send message. Please try again.");
        } finally { setSending(false); }
    };

    const inputStyle = {
        width: "100%", padding: "12px 14px", borderRadius: "10px",
        border: `1px solid ${t.border}`, fontSize: "14px", fontFamily: t.fontSans,
        background: t.input, color: t.text, outline: "none",
        transition: "border-color 0.2s", boxSizing: "border-box",
    };
    const labelStyle = { display: "block", fontSize: "12px", fontWeight: "500", letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" };
    const errorStyle = { fontSize: "12px", color: t.danger, marginTop: "4px", display: "block" };

    const card = { background: t.card, borderRadius: "16px", padding: "32px", boxShadow: t.shadowSm, border: `1px solid ${t.border}`, marginBottom: "24px" };

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto", padding: "52px 24px 0" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: t.pink, fontWeight: "500", marginBottom: "12px" }}>Get in Touch</p>
                <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "40px", fontWeight: "400", color: t.text, marginBottom: "8px" }}>Contact Us</h1>
                <p style={{ fontSize: "14px", color: t.textMuted, marginBottom: "40px" }}>Have a question or just want to say hello? We'd love to hear from you.</p>

                {/* Contact Form */}
                <div style={card}>
                    {sent ? (
                        <div style={{ padding: "20px", borderRadius: "12px", background: isDark ? "rgba(16,185,129,0.1)" : "#d1fae5", border: "1px solid rgba(16,185,129,0.3)", textAlign: "center" }}>
                            <p style={{ fontSize: "16px", color: t.success, margin: 0, fontFamily: t.fontSerif, fontStyle: "italic" }}>Message sent! 🌸</p>
                            <p style={{ fontSize: "13px", color: t.textMuted, marginTop: "6px" }}>We'll get back to you soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }} noValidate>
                            {serverError && <div style={{ padding: "11px 14px", borderRadius: "8px", background: isDark ? "rgba(190,24,93,0.1)" : "#fef2f2", border: `1px solid rgba(190,24,93,0.2)`, fontSize: "13px", color: t.danger }}>{serverError}</div>}
                            {[
                                { name: "name", label: "Name", type: "text", ph: "Your full name" },
                                { name: "email", label: "Email", type: "email", ph: "you@example.com" },
                            ].map(f => (
                                <div key={f.name}>
                                    <label style={labelStyle}>{f.label}</label>
                                    <input type={f.type} name={f.name} placeholder={f.ph} value={formData[f.name]}
                                        onChange={e => { setFormData({ ...formData, [f.name]: e.target.value }); if (errors[f.name]) setErrors(p => ({ ...p, [f.name]: "" })); }}
                                        style={{ ...inputStyle, borderColor: errors[f.name] ? t.danger : undefined }} />
                                    {errors[f.name] && <span style={errorStyle}>{errors[f.name]}</span>}
                                </div>
                            ))}
                            <div>
                                <label style={labelStyle}>Message</label>
                                <textarea name="message" placeholder="What's on your mind?" value={formData.message} rows={5}
                                    onChange={e => { setFormData({ ...formData, message: e.target.value }); if (errors.message) setErrors(p => ({ ...p, message: "" })); }}
                                    style={{ ...inputStyle, resize: "vertical", minHeight: "110px", borderColor: errors.message ? t.danger : undefined }} />
                                {errors.message && <span style={errorStyle}>{errors.message}</span>}
                            </div>
                            <button type="submit" disabled={sending} style={{ padding: "13px", borderRadius: "10px", border: "none", background: sending ? t.border : t.pinkGrad, color: "white", fontFamily: t.fontSans, fontWeight: "600", fontSize: "14px", cursor: sending ? "not-allowed" : "pointer", boxShadow: sending ? "none" : "0 4px 16px rgba(190,24,93,0.3)", letterSpacing: "0.04em" }}>
                                {sending ? "Sending…" : "Send Message"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Resources Table */}
                <div style={card}>
                    <h3 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "22px", fontWeight: "400", color: t.text, marginBottom: "20px" }}>Web Dev Resources</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                                <th style={{ textAlign: "left", padding: "8px 12px 12px", fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted }}>Resource</th>
                                <th style={{ textAlign: "left", padding: "8px 12px 12px", fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: t.textMuted }}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { href: "https://developer.mozilla.org", name: "MDN Web Docs", desc: "Authoritative reference for HTML, CSS and JavaScript" },
                                { href: "https://www.w3schools.com", name: "W3Schools", desc: "Beginner-friendly tutorials and live examples" },
                                { href: "https://www.freecodecamp.org", name: "freeCodeCamp", desc: "Free interactive curriculum for web technologies" },
                                { href: "https://css-tricks.com", name: "CSS-Tricks", desc: "Deep dives into CSS and modern techniques" },
                            ].map((r, i) => (
                                <tr key={r.name} style={{ borderBottom: i < 3 ? `1px solid ${t.border}` : "none" }}>
                                    <td style={{ padding: "14px 12px" }}>
                                        <a href={r.href} target="_blank" rel="noreferrer" style={{ color: t.pink, fontWeight: "500", textDecoration: "none" }}>{r.name}</a>
                                    </td>
                                    <td style={{ padding: "14px 12px", color: t.textSub }}>{r.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Map */}
                <div style={card}>
                    <h3 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "22px", fontWeight: "400", color: t.text, marginBottom: "8px" }}>Location</h3>
                    <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: "16px" }}>General location for reference only.</p>
                    <img src={`${BASE_URL}/uploads/map.png`} alt="Map" style={{ width: "100%", borderRadius: "10px" }} onError={e => e.target.style.display = "none"} />
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
