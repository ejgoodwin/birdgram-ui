import React, { useState, useEffect, useRef } from 'react';
import { Post } from '../types';
import PostEditor from './PostEditor';
import '../styles/PostCard.css';

const FRAMER_SIZE = 400;

interface Props {
  post: Post;
  onDelete: (id: string) => void;
  onUpdated: (post: Post) => void;
}

export default function PostCard({ post, onDelete, onUpdated }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState(FRAMER_SIZE);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setFrameSize(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scaleFactor = frameSize / FRAMER_SIZE;

  return (
    <>
      <div className="post-card">
        <div className="post-card-image-frame" ref={frameRef}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: FRAMER_SIZE,
              height: FRAMER_SIZE,
              transform: `scale(${scaleFactor})`,
              transformOrigin: 'top left',
              overflow: 'hidden',
            }}
          >
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                maxWidth: 'none',
                width: 'auto',
                height: 'auto',
                transform: `translate(${post.offsetX}px, ${post.offsetY}px) scale(${post.scale})`,
                transformOrigin: 'top left',
              }}
              draggable={false}
            />
          </div>
        </div>
        {post.title && <p className="post-card-title">{post.title}</p>}
        <div className="post-card-actions">
          {confirmDelete ? (
            <>
              <button className="btn-danger-sm" onClick={() => onDelete(post.id)}>Confirm</button>
              <button className="btn-ghost-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn-ghost-sm" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn-ghost-sm" onClick={() => setConfirmDelete(true)}>Delete</button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <PostEditor
          post={post}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => { onUpdated(updated); setEditing(false); }}
        />
      )}
    </>
  );
}
