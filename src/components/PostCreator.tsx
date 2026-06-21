import React, { useState } from 'react';
import ImageFramer from './ImageFramer';
import { createPost } from '../api/posts';
import { Post } from '../types';
import { AspectRatioKey, FRAME_W, RATIO_LABELS, RATIO_ORDER, computeFrameH } from '../utils/aspectRatio';
import '../styles/PostCreator.css';

interface Props {
  onClose: () => void;
  onCreated: (post: Post) => void;
}

export default function PostCreator({ onClose, onCreated }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>('1:1');
  const [title, setTitle] = useState('');
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frameH = computeFrameH(aspectRatio, naturalSize);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setNaturalSize(null);
    setOffset({ x: 0, y: 0 });
    setScale(1);
    const img = new window.Image();
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  };

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
    if (!file) { setError('Please select an image'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', title);
      formData.append('offsetX', String(offset.x));
      formData.append('offsetY', String(offset.y));
      formData.append('scale', String(scale));
      formData.append('frameH', String(frameH));
      const post = await createPost(formData);
      onCreated(post);
    } catch {
      setError('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Post</h2>
          <button className="btn-close" onClick={onClose}>&#x2715;</button>
        </div>

        <form onSubmit={handleSubmit} className="creator-form">
          {!previewUrl ? (
            <label className="upload-area">
              <input type="file" accept="image/*" onChange={handleFileChange} hidden />
              <div className="upload-prompt">
                <span className="upload-icon">&#128247;</span>
                <span>Click to select a photo</span>
              </div>
            </label>
          ) : (
            <>
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
                src={previewUrl}
                offset={offset}
                scale={scale}
                frameH={frameH}
                onOffsetChange={setOffset}
                onScaleChange={setScale}
              />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setFile(null); setPreviewUrl(null); setNaturalSize(null); }}
              >
                Choose different photo
              </button>
            </>
          )}

          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
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
            <button type="submit" className="btn-primary" disabled={submitting || !file}>
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
