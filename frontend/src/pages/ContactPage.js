// src/pages/ContactPage.js
import React, { useState } from 'react';
import API from '../api/axios';

function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors]     = useState({});
  const [sent, setSent]         = useState(false);
  const [sending, setSending]   = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    const emailPattern = /^[^\s]+@[^\s]+\.[a-z]{2,}$/i;
    if (!formData.name.trim())    errs.name    = 'Name is required';
    if (!formData.email.trim())   errs.email   = 'Email is required';
    else if (!emailPattern.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.message.trim()) errs.message = 'Message cannot be empty';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSending(true);
    try {
      await API.post('/messages', {
        name:    formData.name,
        email:   formData.email,
        message: formData.message,
      });
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to send message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-section">
        <h2>Get in Touch</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Have a question? We'd love to hear from you.
        </p>

        {sent ? (
          <div className="success-msg" style={{ fontSize: '1rem', padding: '18px 20px' }}>
            ✅ Message sent successfully! We'll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>

            {serverError && (
              <p className="error-msg" style={{ marginBottom: '12px' }}>
                {serverError}
              </p>
            )}

            <label htmlFor="cname">Name</label>
            <input
              id="cname"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
           
            {errors.name && <span className="error">{errors.name}</span>}
            <label htmlFor="cemail">Email</label>
            <input
              id="cemail"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          
            {errors.email && <span className="error">{errors.email}</span>}

            <label htmlFor="cmessage">Message</label>
            <textarea
              id="cmessage"
              placeholder="What's on your mind?"
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              rows={5}
            />
            
            {errors.message && <span className="error">{errors.message}</span>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              style={{ marginTop: '8px' }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>

          </form>
        )}
      </div>

      <div className="contact-section">
        <h2>Web Development Resources</h2>
        <table className="resources-table">
          <thead>
            <tr><th>Resource</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><a href="https://developer.mozilla.org" target="_blank" rel="noreferrer">MDN Web Docs</a></td>
              <td>Authoritative reference for HTML, CSS and JavaScript</td>
            </tr>
            <tr>
              <td><a href="https://www.w3schools.com" target="_blank" rel="noreferrer">W3Schools</a></td>
              <td>Beginner-friendly tutorials and live examples</td>
            </tr>
            <tr>
              <td><a href="https://www.freecodecamp.org" target="_blank" rel="noreferrer">freeCodeCamp</a></td>
              <td>Free interactive curriculum for web technologies</td>
            </tr>
            <tr>
              <td><a href="https://css-tricks.com" target="_blank" rel="noreferrer">CSS-Tricks</a></td>
              <td>Deep dives into CSS and modern techniques</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContactPage;