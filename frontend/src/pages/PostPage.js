// src/pages/PostPage.js
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function PostPage() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost]             = useState(null);
  const [comments, setComments]     = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentErr, setCommentErr] = useState('');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then(r => setPost(r.data))
      .catch(() => navigate('/home'));
    API.get(`/comments/${id}`)
      .then(r => setComments(r.data))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleComment = async (e) => {
    e.preventDefault();
    setCommentErr('');
    if (!newComment.trim()) return;
    try {
      const { data } = await API.post(`/comments/${id}`, { body: newComment });
      setComments(prev => [...prev, data]);
      setNewComment('');
    } catch (err) {
      setCommentErr(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (cid) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${cid}`);
      setComments(prev => prev.filter(c => c._id !== cid));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Permanently delete this post?')) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) return <div className="loading-spinner">Loading post...</div>;
  if (!post)   return <div className="loading-spinner">Post not found.</div>;

  const authorPic = post.author?.profilePic
    ? `https://thefolio-of34.onrender.com/uploads/${post.author.profilePic}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=081730&color=fff&size=128`;

  return (
    <div className="post-page">

      {post.image && (
        <img
          src={`https://thefolio-of34.onrender.com/uploads/${post.image}`}
          alt={post.title}
          className="post-hero-img"
        />
      )}

      <div className="post-header">
        <h1>{post.title}</h1>
        <p className="post-meta">
          By <strong>{post.author?.name}</strong> ·{' '}
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {user?.role === 'admin' && (
        <div className="admin-post-actions">
          <button className="btn-edit" onClick={() => navigate(`/edit-post/${id}`)}>
            ✏️ Edit Post
          </button>
          <button className="btn-danger" onClick={handleDeletePost}>
            🗑 Delete Post
          </button>
        </div>
      )}

      <div className="post-body">{post.body}</div>

      {/* ── Author Card ── */}
      <div className="post-author-card">
        <img src={authorPic} alt={post.author?.name} className="post-author-avatar" />
        <div>
          <p className="post-author-label">Written by</p>
          <p className="post-author-name">{post.author?.name}</p>
          {post.author?.bio && (
            <p className="post-author-bio">{post.author.bio}</p>
          )}
        </div>
      </div>

      {/* ── Comments ── */}
      <section className="comments-section">
        <h3>Comments ({comments.length})</h3>

        {user ? (
          <form onSubmit={handleComment} style={{ marginBottom: '24px' }}>
            {commentErr && <p className="error-msg">{commentErr}</p>}
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              required
              style={{ width: '100%', marginBottom: '10px' }}
            />
            <button type="submit" className="btn btn-primary">Post Comment</button>
          </form>
        ) : (
          <p className="login-prompt">
            <Link to="/login">Log in</Link> or{' '}
            <Link to="/register">create an account</Link> to comment.
          </p>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map(c => (
              <div key={c._id} className="comment-card">
                <div className="comment-meta">
                  <span className="comment-author">{c.author?.name}</span>
                  <span className="comment-date">
                    {new Date(c.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="comment-body">{c.body}</p>
                {user && (user.role === 'admin' || user._id === c.author?._id) && (
                  <button
                    onClick={() => handleDeleteComment(c._id)}
                    style={{
                      marginTop: '8px', background: 'transparent',
                      border: '1px solid #fecaca', color: '#dc2626',
                      padding: '3px 10px', borderRadius: '5px',
                      fontSize: '.78rem', cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default PostPage;
