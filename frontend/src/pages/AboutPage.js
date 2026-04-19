// src/pages/AboutPage.js
import React, { useState } from 'react';

const quizData = [
  { question: "Which tag is used for the largest heading?", options: ["<h6>", "<heading>", "<h1>", "<head>"], answer: 2 },
  { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyperlinks and Text Management", "Home Tool Markup Language"], answer: 0 },
  { question: "Which HTML tag is used to create a link?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1 },
  { question: "Which tag is used to insert an image?", options: ["<picture>", "<img>", "<image>", "<src>"], answer: 1 },
  { question: "Which HTML attribute specifies an image location?", options: ["href", "link", "src", "path"], answer: 2 },
  { question: "Which CSS property is used to change text color?", options: ["font-color", "text-style", "color", "background-color"], answer: 2 },
  { question: "Which CSS property controls text size?", options: ["text-size", "font-size", "font-style", "size"], answer: 1 },
  { question: "Which symbol starts a comment in JavaScript?", options: ["/* */", "//", "##", "**"], answer: 1 },
  { question: "Which JavaScript keyword declares a variable?", options: ["var", "int", "string", "define"], answer: 0 },
  { question: "Which HTML tag creates a form?", options: ["<input>", "<form>", "<table>", "<fieldset>"], answer: 1 },
];

function AboutPage() {
  const [currentQ, setCurrentQ]   = useState(0);
  const [selected, setSelected]   = useState(null);
  const [score, setScore]         = useState(0);
  const [result, setResult]       = useState({ text: '', color: '' });
  const [isFinished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const q = quizData[currentQ];
    setSubmitting(true);
    const correct = selected === q.answer;
    if (correct) setScore(s => s + 1);
    setResult({ text: correct ? '✅ Correct!' : `❌ Wrong! Answer: ${q.options[q.answer]}`, color: correct ? 'green' : '#dc2626' });

    setTimeout(() => {
      if (currentQ + 1 < quizData.length) {
        setCurrentQ(q => q + 1);
        setSelected(null);
        setResult({ text: '', color: '' });
        setSubmitting(false);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  return (
    <div className="about-page">

      <div className="about-section">
        <h2>Why Web Development Is an Art</h2>
        <p>
          Web development blends logic and creativity. HTML provides structure, CSS shapes visual
          identity, and JavaScript breathes life into the page. Together they form the language of
          the modern web — a canvas for both engineers and designers.
        </p>
        <img src="/art.png" alt="Web Development as Art" />
      </div>

      <div className="about-section">
        <h2>Mini Web Dev Quiz 🧠</h2>
        <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
          Think you know your HTML, CSS, and JavaScript basics? Let's find out!
        </p>

        <div className="quiz-box">
          {!isFinished ? (
            <>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Question {currentQ + 1} of {quizData.length}
              </p>
              <h3>{quizData[currentQ].question}</h3>
              <div style={{ marginTop: '14px' }}>
                {quizData[currentQ].options.map((opt, i) => (
                  <div
                    key={i}
                    className={`quiz-option ${selected === i ? 'selected' : ''}`}
                    onClick={() => !submitting && setSelected(i)}
                  >
                    {opt}
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit} disabled={selected === null || submitting}>
                Submit Answer
              </button>
              {result.text && (
                <div style={{ color: result.color, marginTop: '12px', fontWeight: 600 }}>
                  {result.text}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <h3>Quiz Complete! 🎉</h3>
              <p style={{ fontSize: '1.2rem', marginTop: '12px', color: 'var(--navy)', fontWeight: 700 }}>
                Your score: {score} / {quizData.length}
              </p>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                {score === quizData.length
                  ? 'Perfect score! You\'re a web dev wizard! 🧙'
                  : score >= 7
                    ? 'Great job! You clearly know your stuff.'
                    : 'Keep learning — you\'ll ace it next time!'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="about-section">
        <h2>My Journey in Web Development</h2>
        <ol style={{ marginLeft: '20px', marginTop: '12px', color: 'var(--text-muted)', lineHeight: '1.9' }}>
          <li>Learning HTML structure and semantic elements</li>
          <li>Applying CSS for layout, colors, and typography</li>
          <li>Building multi-page websites with navigation</li>
          <li>Adding interactivity with JavaScript and React</li>
          <li>Connecting frontend to a backend API</li>
        </ol>
        <img src="/about2.png" alt="Learning web development" />
      </div>

    </div>
  );
}

export default AboutPage;
