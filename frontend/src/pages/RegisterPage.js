// src/pages/RegisterPage.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function RegisterPage() {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [otp,  setOtp]        = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1 — send OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP and auto-login
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { email: form.email, otp });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMsg('');
    try {
      await API.post('/auth/resend-otp', { email: form.email });
      setResendMsg('A new code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {step === 1 ? (
          <>
            <h2>Create Account</h2>
            <span className="auth-subtitle">Join TheFolio and start writing</span>

            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={handleRegister}>
              <label>Full Name</label>
              <input name="name" placeholder="Your full name"
                value={form.name} onChange={handleChange} required />

              <label>Email Address</label>
              <input name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />

              <label>Password</label>
              <input name="password" type="password" placeholder="At least 6 characters"
                value={form.password} onChange={handleChange} required minLength={6} />

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending code…' : 'Continue →'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Verify your email</h2>
            <p className="auth-subtitle">
              Enter the 6-digit code sent to <strong>{form.email}</strong>
            </p>

            {error     && <p className="error-msg">{error}</p>}
            {resendMsg && <p className="success-msg" style={{ marginTop: '8px' }}>{resendMsg}</p>}

            <form onSubmit={handleVerify} style={{ marginTop: '20px' }}>
              <label>Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="______"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ letterSpacing: '10px', fontSize: '1.6rem', textAlign: 'center' }}
                required
              />

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Create Account'}
              </button>
            </form>

            <p className="auth-footer" style={{ marginTop: '16px' }}>
              Didn't get it?{' '}
              <button onClick={handleResend}
                style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',padding:0,textDecoration:'underline' }}>
                Resend code
              </button>
              {' · '}
              <button onClick={() => { setStep(1); setOtp(''); setError(''); }}
                style={{ background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:0,textDecoration:'underline' }}>
                Change email
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default RegisterPage;
