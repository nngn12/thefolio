// src/pages/ProfilePage.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName]             = useState('');
  const [bio, setBio]               = useState('');
  const [pic, setPic]               = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [curPw, setCurPw]           = useState('');
  const [newPw, setNewPw]           = useState('');
  const [msg, setMsg]               = useState('');
  const [msgType, setMsgType]       = useState('success');
  const [myPosts, setMyPosts]       = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showEditProfile, setShowEditProfile]       = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name || ''); setBio(user.bio || ''); }
  }, [user]);

  useEffect(() => {
    API.get('/posts/mine')
      .then(r => setMyPosts(r.data))
      .catch(err => console.error('Posts/mine error:', err.response?.data))
      .finally(() => setPostsLoading(false));
  }, []);

  const flash = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPic(file);
    setPicPreview(URL.createObjectURL(file));
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('bio', bio);
    if (pic) fd.append('profilePic', pic);
    try {
      const { data } = await API.put('/auth/profile', fd);
      setUser(data); setPic(null);
      flash('Profile updated successfully!');
      setShowEditProfile(false);
    } catch (err) {
      flash(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) { flash('New password must be at least 6 characters', 'error'); return; }
    try {
      await API.put('/auth/change-password', { currentPassword: curPw, newPassword: newPw });
      flash('Password changed successfully!');
      setCurPw(''); setNewPw('');
      setShowChangePassword(false);
    } catch (err) {
      flash(err.response?.data?.message || 'Password change failed', 'error');
    }
  };

  const picSrc = picPreview
    ? picPreview
    : user?.profilePic
    ? `https://thefolio-of34.onrender.com/uploads/${user.profilePic}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=081730&color=fff&size=128`;

  if (!user) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="profile-page">

      {/* ── Hero Banner ── */}
      <div className="profile-hero-banner">
        <img src={picSrc} alt="Profile" className="profile-hero-avatar" />
        <div>
          <p className="profile-hero-name">{user.name}</p>
          <p className="profile-hero-bio">{user.bio || 'No bio yet.'}</p>
          <p className="profile-hero-email">{user.email}</p>
          {user.role === 'admin' && <span className="badge-admin">Admin</span>}
        </div>
      </div>

      {/* ── Flash ── */}
      {msg && <div className={`profile-flash ${msgType}`}>{msg}</div>}

      {/* ── My Posts ── */}
      <div className="profile-card">
        <div className="profile-card-header">
          <span>📝</span>
          <h3>My Posts</h3>
        </div>

        {postsLoading ? (
          <div className="my-post-row">
            <span style={{ color: 'var(--text-3)' }}>Loading posts...</span>
          </div>
        ) : myPosts.length === 0 ? (
          <div className="my-post-row">
            <span style={{ color: 'var(--text-3)' }}>
              No posts yet.{' '}
              <Link to="/create-post">Write your first one!</Link>
            </span>
          </div>
        ) : (
          myPosts.map(p => (
            <div key={p._id} className="my-post-row">
              <Link to={`/posts/${p._id}`}>{p.title}</Link>
              <span>
                {new Date(p.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Edit Profile (collapsible) ── */}
      <div className="profile-card">
        <button
          className="panel-toggle"
          onClick={() => setShowEditProfile(v => !v)}
          aria-expanded={showEditProfile}
        >
          <h3>✏️ Edit Profile</h3>
          <span className={`toggle-icon${showEditProfile ? ' open' : ''}`}>▾</span>
        </button>

        {showEditProfile && (
          <div className="panel-body">
            <form onSubmit={handleProfile}>
              <label>Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your display name" />

              <label>Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />

              <label>Profile Picture</label>
              <input type="file" accept="image/*" onChange={handlePicChange} />
              {picPreview && <img src={picPreview} alt="Preview" className="panel-pic-preview" />}

              <div className="panel-btn-row">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditProfile(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Change Password (collapsible) ── */}
      <div className="profile-card">
        <button
          className="panel-toggle"
          onClick={() => setShowChangePassword(v => !v)}
          aria-expanded={showChangePassword}
        >
          <h3>🔒 Change Password</h3>
          <span className={`toggle-icon${showChangePassword ? ' open' : ''}`}>▾</span>
        </button>

        {showChangePassword && (
          <div className="panel-body">
            <form onSubmit={handlePassword}>
              <label>Current Password</label>
              <input type="password" placeholder="Enter current password" value={curPw} onChange={e => setCurPw(e.target.value)} required />

              <label>New Password</label>
              <input type="password" placeholder="Min 6 characters" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} />

              <div className="panel-btn-row">
                <button type="submit" className="btn btn-primary">Update Password</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowChangePassword(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}

export default ProfilePage;
