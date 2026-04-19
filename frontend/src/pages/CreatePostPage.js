// src/pages/CreatePostPage.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function CreatePostPage() {
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('title', title);
    fd.append('body', body);
    if (image) fd.append('image', image);

    try {
      const { data } = await API.post('/posts', fd);
      navigate(`/posts/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish post');
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <h2>Write a New Post</h2>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Post Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Give your post a great title..."
          required
        />

        <label>Content</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your post here..."
          rows={14}
          required
        />

        <div className="image-upload-box">
          <label htmlFor="cover-img" style={{ cursor: 'pointer' }}>
            📷 {image ? 'Change cover image' : 'Upload a cover image (optional)'}
          </label>
          <input
            id="cover-img"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginTop: '10px' }}
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%', marginTop: '12px',
                borderRadius: '8px', maxHeight: '200px', objectFit: 'cover',
              }}
            />
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePostPage;