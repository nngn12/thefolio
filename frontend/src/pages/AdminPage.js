// src/pages/AdminPage.js
import { useState, useEffect } from 'react';
import API from '../api/axios';

function AdminPage() {
  const [users, setUsers]         = useState([]);
  const [messages, setMessages]   = useState([]);
  const [tab, setTab]             = useState('users');
  const [usersLoading, setUL]     = useState(true);
  const [messagesLoading, setML]  = useState(true);
  const [usersError, setUE]       = useState('');
  const [messagesError, setME]    = useState('');

  // Reply state: { [messageId]: { open: bool, text: string, loading: bool, sent: bool, error: string } }
  const [replyState, setReplyState] = useState({});

  useEffect(() => {
    API.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(err => setUE(err.response?.data?.message || 'Failed to load members'))
      .finally(() => setUL(false));
  }, []);

  useEffect(() => {
    API.get('/admin/messages')
      .then(r => setMessages(r.data))
      .catch(err => setME(err.response?.data?.message || 'Failed to load messages'))
      .finally(() => setML(false));
  }, []);

  const toggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/status`);
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const markRead = async (id) => {
    try {
      const { data } = await API.put(`/admin/messages/${id}/read`);
      setMessages(prev => prev.map(m => m._id === id ? data : m));
    } catch (err) {
      alert('Failed to mark as read');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await API.delete(`/admin/messages/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  // ── Reply helpers ──
  const openReply = (id) => {
    setReplyState(prev => ({
      ...prev,
      [id]: { open: true, text: prev[id]?.text || '', loading: false, sent: false, error: '' },
    }));
  };

  const closeReply = (id) => {
    setReplyState(prev => ({ ...prev, [id]: { ...prev[id], open: false } }));
  };

  const updateReplyText = (id, text) => {
    setReplyState(prev => ({ ...prev, [id]: { ...prev[id], text } }));
  };

  const sendReply = async (msgId) => {
    const rs = replyState[msgId];
    if (!rs?.text?.trim()) return;
    setReplyState(prev => ({ ...prev, [msgId]: { ...prev[msgId], loading: true, error: '' } }));
    try {
      const { data } = await API.post(`/admin/messages/${msgId}/reply`, { reply: rs.text.trim() });
      setMessages(prev => prev.map(m => m._id === msgId ? data.data : m));
      setReplyState(prev => ({ ...prev, [msgId]: { open: false, text: '', loading: false, sent: true, error: '' } }));
    } catch (err) {
      setReplyState(prev => ({
        ...prev,
        [msgId]: { ...prev[msgId], loading: false, error: err.response?.data?.message || 'Failed to send reply' },
      }));
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>

      <div className="admin-tabs">
        <button onClick={() => setTab('users')} className={tab === 'users' ? 'active' : ''}>
          Members ({users.length})
        </button>
        <button onClick={() => setTab('messages')} className={tab === 'messages' ? 'active' : ''}>
          Messages
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      </div>

      {/* ── MEMBERS TAB ── */}
      {tab === 'users' && (
        <>
          {usersLoading && <div className="loading-spinner">Loading members...</div>}
          {usersError   && <p className="error-msg">{usersError}</p>}
          {!usersLoading && !usersError && users.length === 0 && (
            <div className="empty-state"><p>No members registered yet.</p></div>
          )}
          {!usersLoading && users.length > 0 && (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Joined</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className={`status-badge ${u.status}`}>{u.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => toggleStatus(u._id)}
                          className={u.status === 'active' ? 'btn-danger' : 'btn-success'}
                        >
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        {u.role !== 'admin' && (
                          <button className="btn-danger" onClick={() => deleteUser(u._id, u.name)}
                            style={{ background: '#7f1d1d' }}>
                            🗑 Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ── MESSAGES TAB ── */}
      {tab === 'messages' && (
        <>
          {messagesLoading && <div className="loading-spinner">Loading messages...</div>}
          {messagesError   && <p className="error-msg">{messagesError}</p>}
          {!messagesLoading && !messagesError && messages.length === 0 && (
            <div className="empty-state"><p>No messages yet.</p></div>
          )}
          {!messagesLoading && messages.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map(m => {
                const rs = replyState[m._id] || {};
                return (
                  <div key={m._id} style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '20px',
                    opacity: m.read && !m.adminReply ? 0.7 : 1,
                    borderLeft: m.adminReply ? '4px solid var(--accent)' : !m.read ? '4px solid #f59e0b' : '4px solid var(--border)',
                  }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontWeight: m.read ? 500 : 700, fontSize: '0.95rem' }}>{m.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '10px' }}>{m.email}</span>
                        {!m.read && (
                          <span style={{ marginLeft: '8px', background: '#f59e0b', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
                            NEW
                          </span>
                        )}
                        {m.adminReply && (
                          <span style={{ marginLeft: '8px', background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
                            REPLIED
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Message body */}
                    <p style={{ margin: '0 0 14px', lineHeight: '1.6' }}>{m.message}</p>

                    {/* Existing reply (if any) */}
                    {m.adminReply && (
                      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          ✉ Your reply
                        </span>
                        <p style={{ margin: '6px 0 0', fontSize: '0.9rem', lineHeight: '1.5' }}>{m.adminReply}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {!m.read && (
                        <button className="btn-success" onClick={() => markRead(m._id)}>
                          ✓ Mark Read
                        </button>
                      )}
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.83rem', padding: '6px 14px' }}
                        onClick={() => rs.open ? closeReply(m._id) : openReply(m._id)}
                      >
                        {m.adminReply ? '✏️ Edit Reply' : '✉ Reply'}
                      </button>
                      <button className="btn-danger" onClick={() => deleteMessage(m._id)}>
                        🗑 Delete
                      </button>
                    </div>

                    {/* Inline reply box */}
                    {rs.open && (
                      <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                          Reply to {m.name} — will be sent to <strong>{m.email}</strong> and appear in their dashboard
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Type your reply…"
                          value={rs.text}
                          onChange={e => updateReplyText(m._id, e.target.value)}
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            padding: '10px 12px', borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--bg)', color: 'var(--text)',
                            fontSize: '0.9rem', resize: 'vertical',
                          }}
                        />
                        {rs.error && <p style={{ color: 'red', fontSize: '0.82rem', margin: '4px 0' }}>{rs.error}</p>}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.85rem', padding: '8px 18px' }}
                            onClick={() => sendReply(m._id)}
                            disabled={rs.loading || !rs.text?.trim()}
                          >
                            {rs.loading ? 'Sending…' : 'Send Reply'}
                          </button>
                          <button
                            onClick={() => closeReply(m._id)}
                            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {rs.sent && !rs.open && (
                      <p style={{ marginTop: '8px', fontSize: '0.82rem', color: 'green' }}>
                        ✅ Reply sent and email delivered.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPage;
