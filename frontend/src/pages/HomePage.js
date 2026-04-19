// src/pages/HomePage.js
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function HomePage() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const { user }              = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    API.get('/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e, postId) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this post and all its comments?')) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = (e, postId) => {
    e.preventDefault(); e.stopPropagation();
    navigate(`/edit-post/${postId}`);
  };

  const picSrc = user?.profilePic
    ? `https://thefolio-of34.onrender.com/uploads/${user.profilePic}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=081730&color=fff&size=128`;

  if (loading) return <div className="loading-spinner">Loading posts...</div>;

  return (
    <div className="home-page">

      {/* ── Profile Hero Card ── */}
      {user && (
        <div className="profile-hero-banner" style={{ marginBottom: '44px' }}>
          <img src={picSrc} alt={user.name} className="profile-hero-avatar" />
          <div style={{ flex: 1 }}>
            <p className="profile-hero-name">{user.name}</p>
            <p className="profile-hero-bio">{user.bio || 'No bio yet.'}</p>
            <p className="profile-hero-email">{user.email}</p>
            {user.role === 'admin' && <span className="badge-admin">Admin</span>}
          </div>
        </div>
      )}

      {/* ── Masthead ── */}
      <div className="home-masthead">
        <h2>Latest Posts</h2>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state"><p>No posts yet. Be the first to write one!</p></div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post._id} className="post-card">
              {post.image && (
                <div className="img-wrap">
                  <img src={`https://thefolio-of34.onrender.com/uploads/${post.image}`} alt={post.title} />
                </div>
              )}
              <div className="post-card-body">
                <h3><Link to={`/posts/${post._id}`}>{post.title}</Link></h3>
                <p>{post.body.substring(0, 115)}...</p>
                <div className="post-card-meta">
                  <img
                    src={
                      post.author?.profilePic
                        ? `https://thefolio-of34.onrender.com/uploads/${post.author.profilePic}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=081730&color=fff&size=64`
                    }
                    alt={post.author?.name}
                  />
                  <small>
                    <strong>{post.author?.name}</strong>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </small>
                </div>
                {user?.role === 'admin' && (
                  <div className="post-card-actions">
                    <button className="card-btn-edit" onClick={e => handleEdit(e, post._id)}>✏️ Edit</button>
                    <button className="card-btn-delete" onClick={e => handleDelete(e, post._id)}>🗑 Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
