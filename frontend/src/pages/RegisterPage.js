import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendMsg, setResendMsg] = useState("");

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return setError("Please fill in all fields");
        if (form.password.length < 6) return setError("Password must be at least 6 characters");
        setError(""); setLoading(true);
        try {
            await API.post("/auth/register", form);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const res = await API.post("/auth/verify-otp", { email: form.email, otp });
            localStorage.setItem("token", res.data.token);
            if (setUser) setUser(res.data.user);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed. Check the code and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError(""); setResendMsg("");
        try {
            await API.post("/auth/resend-otp", { email: form.email });
            setResendMsg("A new code has been sent to your email.");
        } catch (err) {
            setError(err.response?.data?.message || "Could not resend the code.");
        }
    };

    const inputStyle = {
        width: "100%", padding: "13px 16px", borderRadius: "10px",
        border: `1px solid ${t.border}`, fontSize: "14px", fontFamily: t.fontSans,
        background: t.input, color: t.text, outline: "none",
        transition: "border-color 0.2s", boxSizing: "border-box",
    };
    const labelStyle = {
        display: "block", fontSize: "12px", fontWeight: "500",
        letterSpacing: "0.06em", textTransform: "uppercase",
        color: t.textMuted, marginBottom: "6px",
    };

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
            <div style={{ position: "fixed", top: "15%", left: "12%", width: "300px", height: "300px", borderRadius: "50%", background: isDark ? "rgba(190,24,93,0.04)" : "rgba(190,24,93,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />

            <div style={{ width: "100%", maxWidth: "420px", background: t.card, border: `1px solid ${t.border}`, padding: "48px 40px", borderRadius: "16px", boxShadow: t.shadow, animation: "fadeUp 0.5s ease both" }}>

                {step === 1 ? (
                    <>
                        <div style={{ textAlign: "center", marginBottom: "36px" }}>
                            <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "32px", fontWeight: "400", color: t.text, marginBottom: "8px" }}>Create account</h1>
                            <p style={{ fontSize: "13px", color: t.textMuted }}>Join Captured Memories today</p>
                        </div>

                        {error && <div style={{ padding: "11px 14px", borderRadius: "8px", marginBottom: "20px", background: isDark ? "rgba(190,24,93,0.1)" : "#fef2f2", border: `1px solid rgba(190,24,93,0.2)`, fontSize: "13px", color: t.danger }}>{error}</div>}

                        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {[
                                { name: "name", label: "Full Name", type: "text", ph: "Your full name" },
                                { name: "email", label: "Email", type: "email", ph: "you@example.com" },
                                { name: "password", label: "Password", type: "password", ph: "Min. 6 characters" },
                            ].map(f => (
                                <div key={f.name}>
                                    <label style={labelStyle}>{f.label}</label>
                                    <input name={f.name} type={f.type} placeholder={f.ph} value={form[f.name]} onChange={handleChange} style={inputStyle} />
                                </div>
                            ))}
                            <button type="submit" disabled={loading} style={{
                                width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                                background: loading ? t.border : t.pinkGrad, color: "white",
                                fontFamily: t.fontSans, fontWeight: "600", fontSize: "14px",
                                letterSpacing: "0.04em", cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: loading ? "none" : "0 4px 16px rgba(190,24,93,0.3)", marginTop: "4px",
                            }}>{loading ? "Sending verification code…" : "Continue →"}</button>
                        </form>

                        <p style={{ textAlign: "center", marginTop: "28px", fontSize: "13px", color: t.textMuted }}>
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: t.pink, fontWeight: "500", textDecoration: "none" }}>Sign in</Link>
                        </p>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: t.pinkGrad, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "24px" }}>✉️</div>
                            <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "28px", fontWeight: "400", color: t.text, marginBottom: "8px" }}>Check your email</h1>
                            <p style={{ fontSize: "13px", color: t.textMuted, lineHeight: "1.6" }}>
                                Enter the 6-digit code sent to<br />
                                <strong style={{ color: t.pink }}>{form.email}</strong>
                            </p>
                        </div>

                        {error && <div style={{ padding: "11px 14px", borderRadius: "8px", marginBottom: "20px", background: isDark ? "rgba(190,24,93,0.1)" : "#fef2f2", border: `1px solid rgba(190,24,93,0.2)`, fontSize: "13px", color: t.danger }}>{error}</div>}
                        {resendMsg && <div style={{ padding: "11px 14px", borderRadius: "8px", marginBottom: "20px", background: isDark ? "rgba(16,185,129,0.1)" : "#d1fae5", border: "1px solid rgba(16,185,129,0.3)", fontSize: "13px", color: t.success }}>{resendMsg}</div>}

                        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={labelStyle}>Verification Code</label>
                                <input
                                    type="text" inputMode="numeric" maxLength={6} placeholder="——————"
                                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                    style={{ ...inputStyle, letterSpacing: "12px", fontSize: "24px", textAlign: "center", fontFamily: t.fontSerif }}
                                />
                            </div>
                            <button type="submit" disabled={loading} style={{
                                width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                                background: loading ? t.border : t.pinkGrad, color: "white",
                                fontFamily: t.fontSans, fontWeight: "600", fontSize: "14px",
                                cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: loading ? "none" : "0 4px 16px rgba(190,24,93,0.3)",
                            }}>{loading ? "Verifying…" : "Verify & Create Account"}</button>
                        </form>

                        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: t.textMuted }}>
                            Didn't get it?{" "}
                            <button onClick={handleResend} style={{ background: "none", border: "none", color: t.pink, cursor: "pointer", fontFamily: t.fontSans, fontSize: "13px", fontWeight: "500", textDecoration: "underline", padding: 0 }}>Resend code</button>
                            {" · "}
                            <button onClick={() => { setStep(1); setOtp(""); setError(""); }} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontFamily: t.fontSans, fontSize: "13px", textDecoration: "underline", padding: 0 }}>Change email</button>
                        </p>
                    </>
                )}
            </div>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
};

export default RegisterPage;
