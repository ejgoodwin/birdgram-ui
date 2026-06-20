import React, { useState } from 'react';
import { Post } from '../types';
import PostEditor from './PostEditor';
import '../styles/PostCard.css';

interface Props {
  post: Post;
  onDelete: (id: string) => void;
  onUpdated: (post: Post) => void;
}

export default function PostCard({ post, onDelete, onUpdated }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  const frameH = post.frameH ?? 400;

  return (
    <>
      <div className='post-card'>
        <div
          className='post-card-image-frame'
          style={{ aspectRatio: `400 / ${frameH}` }}
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
            draggable={false}
          />
        </div>
        {post.title && <p className='post-card-title'>{post.title}</p>}
        <div className='post-card-actions'>
          {confirmDelete ?
            <>
              <button
                className='btn-danger-sm'
                onClick={() => onDelete(post.id)}
              >
                Confirm
              </button>
              <button
                className='btn-ghost-sm'
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </>
          : <>
              <button className='btn-ghost-sm' onClick={() => setEditing(true)}>
                Edit
              </button>
              <button
                className='btn-ghost-sm'
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </button>
            </>
          }
        </div>
      </div>

      {editing && (
        <PostEditor
          post={post}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => {
            onUpdated(updated);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}
