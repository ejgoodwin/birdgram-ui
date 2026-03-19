import React, { useState, useEffect, useCallback } from 'react';
import PostGrid from './components/PostGrid';
import PostCreator from './components/PostCreator';
import { Post } from './types';
import { fetchPosts, deletePost } from './api/posts';
import './styles/App.css';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setShowCreator(false);
  };

  const handleDelete = async (id: string) => {
    await deletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">Birdgram</h1>
        <button className="btn-primary" onClick={() => setShowCreator(true)}>
          + New Post
        </button>
      </header>

      <main className="app-main">
        {loading && <p className="status-message">Loading...</p>}
        {error && <p className="status-message error">{error}</p>}
        {!loading && posts.length === 0 && (
          <div className="empty-state">
            <p>No posts yet. Share your first bird!</p>
            <button className="btn-primary" onClick={() => setShowCreator(true)}>
              Upload a photo
            </button>
          </div>
        )}
        {posts.length > 0 && <PostGrid posts={posts} onDelete={handleDelete} onUpdated={handleUpdated} />}
      </main>

      {showCreator && (
        <PostCreator onClose={() => setShowCreator(false)} onCreated={handlePostCreated} />
      )}
    </div>
  );
}
