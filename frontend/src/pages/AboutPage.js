import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

const quizData = [
    { question: "What is the main theme of this website?", options: ["Competitive online gaming", "Photography and shared memories", "Programming tutorials", "Travel blogging"], answer: 1 },
    { question: "What does the 📸 emoji in the title represent?", options: ["A random decoration", "Gaming achievements", "Capturing meaningful moments", "Camera reviews"], answer: 2 },
    { question: "Who is this portfolio about?", options: ["Only the website owner", "A group of friends", "A public community", "The owner and their partner"], answer: 3 },
    { question: "What kind of design does this website use?", options: ["Light, soft, and lively", "Dark and cyberpunk", "Plain with no styling", "Old-school retro"], answer: 0 },
    { question: "What can visitors do on the Register page?", options: ["Play a game", "Sign up for updates", "Download photos", "Chat live"], answer: 1 },
    { question: "What is shown on the Contact page?", options: ["Only a photo gallery", "A login form", "A contact form, resources, and a map", "Game rankings"], answer: 2 },
    { question: "Why was this website created?", options: ["For selling products", "For a school portfolio project", "To copy another site", "For advertising"], answer: 1 },
    { question: "What kind of content is shared on this site?", options: ["Random internet content", "Professional business services", "Personal experiences and memories", "News articles"], answer: 2 },
];

const AboutPage = () => {
    const { isDark } = useTheme();
    const t = getTheme(isDark);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [result, setResult] = useState("");
    const [finished, setFinished] = useState(false);
    const [answered, setAnswered] = useState(false);

    useEffect(() => { setSelected(null); setResult(""); setAnswered(false); }, [currentIndex]);

    const submitAnswer = () => {
        if (selected === null || answered) return;
        setAnswered(true);
        const correct = quizData[currentIndex].answer;
        const isCorrect = selected === correct;
        if (isCorrect) setScore(prev => prev + 1);
        setResult(isCorrect ? "correct" : `wrong:${quizData[currentIndex].options[correct]}`);
        setTimeout(() => {
            if (currentIndex < quizData.length - 1) setCurrentIndex(prev => prev + 1);
            else setFinished(true);
        }, 1600);
    };

    const restart = () => { setCurrentIndex(0); setScore(0); setFinished(false); setAnswered(false); };

    const card = {
        background: t.card, backdropFilter: "blur(10px)",
        borderRadius: "20px", padding: "30px",
        boxShadow: t.shadow, marginBottom: "24px",
    };

    const optionStyle = (idx) => {
        let bg = t.cardAlt;
        let border = `1px solid ${t.border}`;
        let color = t.text;

        if (answered) {
            if (idx === quizData[currentIndex].answer) {
                bg = isDark ? "rgba(16,185,129,0.2)" : "#d1fae5";
                border = "1px solid #10b981";
                color = isDark ? "#6ee7b7" : "#065f46";
            } else if (idx === selected && selected !== quizData[currentIndex].answer) {
                bg = isDark ? "rgba(239,68,68,0.2)" : "#fee2e2";
                border = "1px solid #ef4444";
                color = isDark ? "#fca5a5" : "#991b1b";
            }
        } else if (idx === selected) {
            bg = isDark ? "rgba(236,72,153,0.2)" : "#fce7f3";
            border = "1px solid #ec4899";
            color = t.pink;
        }

        return {
            padding: "12px 16px", borderRadius: "10px", border, background: bg, color,
            cursor: answered ? "default" : "pointer", fontSize: "14px", fontWeight: "500",
            marginBottom: "10px", transition: "all 0.2s",
        };
    };

    const progress = ((currentIndex) / quizData.length) * 100;

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, minHeight: "100vh", paddingBottom: "40px" }}>
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "30px 20px" }}>

                {/* ABOUT SECTION */}
                <div style={card}>
                    <h2 style={{ fontSize: "26px", fontWeight: "800", color: t.text, marginBottom: "10px" }}>About Us 💕</h2>
                    <p style={{ color: t.textSub, lineHeight: "1.8", marginBottom: "20px" }}>
                        This page shares a little about us as individuals and as a couple.
                        We believe that sharing interests and supporting each other helps strengthen our bond.
                    </p>

                    <h3 style={{ color: t.pink, fontSize: "17px", marginBottom: "10px" }}>What We Enjoy Together</h3>
                    <ul style={{ color: t.textSub, lineHeight: "2", paddingLeft: "20px", marginBottom: "20px" }}>
                        {["Online gaming and teamwork", "Spending quality time together", "Supporting each other's goals", "Learning and growing together"].map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>

                    <h3 style={{ color: t.pink, fontSize: "17px", marginBottom: "10px" }}>Our Journey</h3>
                    <ol style={{ color: t.textSub, lineHeight: "2", paddingLeft: "20px", marginBottom: "20px" }}>
                        {["We met and became friends", "We discovered shared interests", "We started spending time together", "We continue to grow and support each other"].map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ol>

                    <img src="5.jpg" alt="At DMMMSU"
                        style={{ width: "100%", borderRadius: "14px", objectFit: "cover", maxHeight: "300px" }}
                        onError={e => e.target.style.display = "none"}
                    />
                </div>

                {/* QUOTE */}
                <div style={{
                    background: isDark ? "rgba(236,72,153,0.1)" : "linear-gradient(135deg, #fce7f3, #e0f2fe)",
                    borderLeft: "4px solid #ec4899",
                    borderRadius: "12px", padding: "20px 24px",
                    marginBottom: "24px", fontStyle: "italic",
                    fontSize: "16px", color: t.textSub, lineHeight: "1.7",
                }}>
                    "Growing together means supporting each other every step of the way."
                </div>

                {/* QUIZ SECTION */}
                <div style={card}>
                    <h2 style={{ fontSize: "22px", fontWeight: "800", color: t.text, marginBottom: "6px" }}>🎯 Fun Quiz About Us</h2>
                    <p style={{ color: t.textSub, fontSize: "14px", marginBottom: "20px" }}>Test how well you know our memories and website!</p>

                    {!finished ? (
                        <div>
                            {/* Progress bar */}
                            <div style={{ marginBottom: "18px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>
                                    <span>Question {currentIndex + 1} of {quizData.length}</span>
                                    <span>Score: {score}</span>
                                </div>
                                <div style={{ height: "6px", background: t.border, borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${progress}%`, background: t.pinkGrad, borderRadius: "3px", transition: "width 0.4s ease" }} />
                                </div>
                            </div>

                            <h3 style={{ fontSize: "16px", fontWeight: "700", color: t.text, marginBottom: "16px", lineHeight: "1.5" }}>
                                {quizData[currentIndex].question}
                            </h3>

                            <div>
                                {quizData[currentIndex].options.map((option, idx) => (
                                    <div key={idx} style={optionStyle(idx)} onClick={() => !answered && setSelected(idx)}>
                                        <span style={{ marginRight: "10px", fontWeight: "700", color: t.pink }}>
                                            {["A", "B", "C", "D"][idx]}.
                                        </span>
                                        {option}
                                    </div>
                                ))}
                            </div>

                            {result && (
                                <div style={{
                                    padding: "10px 16px", borderRadius: "10px", marginTop: "10px", fontSize: "14px", fontWeight: "600",
                                    background: result === "correct" ? (isDark ? "rgba(16,185,129,0.15)" : "#d1fae5") : (isDark ? "rgba(239,68,68,0.15)" : "#fee2e2"),
                                    color: result === "correct" ? "#10b981" : "#ef4444",
                                }}>
                                    {result === "correct" ? "Correct! 💕" : `Wrong 💔 Correct answer: ${result.split(":")[1]}`}
                                </div>
                            )}

                            <button
                                onClick={submitAnswer}
                                disabled={selected === null || answered}
                                style={{
                                    marginTop: "16px", width: "100%", padding: "12px", borderRadius: "10px",
                                    border: "none", fontWeight: "700", fontSize: "15px", cursor: selected === null || answered ? "not-allowed" : "pointer",
                                    background: selected === null || answered ? (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb") : t.pinkGrad,
                                    color: selected === null || answered ? t.textMuted : "white",
                                    transition: "all 0.2s",
                                }}>
                                Submit Answer
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                                {score >= 6 ? "🏆" : score >= 4 ? "🌸" : "💪"}
                            </div>
                            <h3 style={{ fontSize: "22px", fontWeight: "800", color: t.text, marginBottom: "8px" }}>
                                Quiz Finished! 📸
                            </h3>
                            <p style={{ fontSize: "16px", color: t.textSub, marginBottom: "20px" }}>
                                You scored <strong style={{ color: t.pink }}>{score}</strong> out of {quizData.length}.
                                {score >= 6 ? " You really know us! 💗" : score >= 4 ? " Not bad! 🌸" : " Keep exploring our site! 💌"}
                            </p>
                            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                <button onClick={restart}
                                    style={{ padding: "11px 28px", borderRadius: "10px", border: "none", background: t.pinkGrad, color: "white", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer style={{ textAlign: "center", color: t.textMuted, paddingBottom: "20px" }}>
                <p><strong>♥ Just us ♥</strong></p>
            </footer>
        </div>
    );
};

export default AboutPage;
