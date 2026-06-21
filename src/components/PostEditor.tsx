import React, { useState, useEffect } from 'react';
import ImageFramer from './ImageFramer';
import { updatePost } from '../api/posts';
import { Post } from '../types';
import { AspectRatioKey, FRAME_W, RATIO_LABELS, RATIO_ORDER, computeFrameH, frameHToRatio } from '../utils/aspectRatio';
import '../styles/PostCreator.css';

interface Props {
  post: Post;
  onClose: () => void;
  onUpdated: (post: Post) => void;
}

export default function PostEditor({ post, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(post.title);
  const [offset, setOffset] = useState({ x: post.offsetX, y: post.offsetY });
  const [scale, setScale] = useState(post.scale);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>(() => frameHToRatio(post.frameH ?? 400));
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frameH = computeFrameH(aspectRatio, naturalSize);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = post.imageUrl;
  }, [post.imageUrl]);

  const handleRatioChange = (ratio: AspectRatioKey) => {
    setAspectRatio(ratio);
    if (!naturalSize) return;
    const fH = computeFrameH(ratio, naturalSize);
    const minScale = Math.max(FRAME_W / naturalSize.w, fH / naturalSize.h);
    setScale(minScale);
    setOffset({ x: 0, y: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updatePost(post.id, {
        title,
        offsetX: offset.x,
        offsetY: offset.y,
        scale,
        frameH,
      });
      onUpdated(updated);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Post</h2>
          <button className="btn-close" onClick={onClose}>&#x2715;</button>
        </div>

        <form onSubmit={handleSubmit} className="creator-form">
          <div className="ratio-selector">
            {RATIO_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className={`ratio-btn${aspectRatio === key ? ' active' : ''}`}
                onClick={() => handleRatioChange(key)}
              >
                {RATIO_LABELS[key]}
              </button>
            ))}
          </div>
          <ImageFramer
            src={post.imageUrl}
            offset={offset}
            scale={scale}
            frameH={frameH}
            onOffsetChange={setOffset}
            onScaleChange={setScale}
            autoFit={false}
          />

          <div className="form-field">
            <label htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              type="text"
              placeholder="Add a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
