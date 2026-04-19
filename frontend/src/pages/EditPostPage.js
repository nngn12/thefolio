// src/pages/EditPostPage.js
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../api/axios';

function EditPostPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [title, setTitle]     = useState('');
  const [body, setBody]       = useState('');
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [existing, setExisting] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/posts/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setBody(res.data.body);
        if (res.data.image) setExisting(res.data.image);
      })
      .catch(() => navigate('/home'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.append('title', title);
    fd.append('body', body);
    if (image) fd.append('image', image);

    try {
      await API.put(`/posts/${id}`, fd);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    }
  };

  if (loading) return <div className="loading-spinner">Loading post...</div>;

  return (
    <div className="edit-post-page">
      <h2>Edit Post</h2>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Post Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post title"
          required
        />

        <label>Content</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Post content..."
          rows={14}
          required
        />

        <div className="image-upload-box">
          <label htmlFor="edit-img">
            📷 {image ? 'New image selected' : existing ? 'Replace cover image' : 'Add cover image'}
          </label>
          {existing && !preview && (
            <img
              src={`https://thefolio-of34.onrender.com/uploads/${existing}`}
              alt="Current"
              style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover' }}
            />
          )}
          <input
            id="edit-img"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginTop: '10px' }}
          />
          {preview && (
            <img
              src={preview}
              alt="New Preview"
              style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <button type="submit" className="btn btn-primary">Save Changes</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(`/posts/${id}`)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPostPage;
