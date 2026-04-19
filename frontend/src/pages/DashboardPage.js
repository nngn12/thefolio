// src/pages/DashboardPage.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function DashboardPage() {
  const { user } = useAuth();

  const [posts, setPosts]             = useState([]);
  const [messages, setMessages]       = useState([]);
  const [postsLoading, setPostsLoading]   = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeTab, setActiveTab]     = useState('posts');

  useEffect(() => {
    API.get('/posts/mine')
      .then(r => setPosts(r.data))
      .catch(() => {})
      .finally(() => setPostsLoading(false));

    API.get('/messages/my')
      .then(r => setMessages(r.data))
      .catch(() => {})
      .finally(() => setMessagesLoading(false));
  }, []);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const unreadReplies = messages.filter(m => m.adminReply && m.adminReply.trim()).length;

  return (
    <div className="profile-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '36px' }}>
        {user?.profilePic ? (
          <img
            src={`${backendUrl}/uploads/${user.profilePic}`}
            alt="Profile"
            style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)' }}
          />
        ) : (
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--card-bg)', border: '3px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-muted)',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem' }}>{user?.name}</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
          <Link to="/profile" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'underline' }}>
            Edit profile →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {[
          { key: 'posts', label: `My Posts (${posts.length})` },
          { key: 'messages', label: `Messages ${unreadReplies > 0 ? `· ${unreadReplies} repl${unreadReplies > 1 ? 'ies' : 'y'}` : ''}` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 18px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab.key ? '700' : '400',
              color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── POSTS TAB ── */}
      {activeTab === 'posts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600' }}>YOUR POSTS</h2>
            <Link to="/create-post" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              + New Post
            </Link>
          </div>

          {postsLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading posts…</p>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem' }}>You haven't written any posts yet.</p>
              <Link to="/create-post" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
                Write your first post
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {posts.map(post => (
                <div key={post._id} style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}>
                  <div style={{ flex: 1 }}>
                    <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: '600' }}>{post.title}</h3>
                    </Link>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <Link to={`/edit-post/${post._id}`}
                      style={{ fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'underline' }}>
                      Edit
                    </Link>
                    <Link to={`/posts/${post._id}`}
                      style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MESSAGES TAB ── */}
      {activeTab === 'messages' && (
        <div>
          <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            YOUR MESSAGES TO ADMIN
          </h2>

          {messagesLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading messages…</p>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem' }}>You haven't sent any messages yet.</p>
              <Link to="/contact" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '12px' }}>
                Contact Admin
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map(msg => (
                <div key={msg._id} style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '20px',
                  borderLeft: msg.adminReply ? '4px solid var(--accent)' : '4px solid var(--border)',
                }}>
                  {/* Original message */}
                  <div style={{ marginBottom: msg.adminReply ? '16px' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Your message
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, lineHeight: '1.6', color: 'var(--text)' }}>{msg.message}</p>
                  </div>

                  {/* Admin reply */}
                  {msg.adminReply && (
                    <div style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          ✉ Admin replied
                        </span>
                        {msg.repliedAt && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(msg.repliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>{msg.adminReply}</p>
                    </div>
                  )}

                  {!msg.adminReply && (
                    <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Waiting for admin reply…
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
