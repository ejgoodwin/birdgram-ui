import React, { useState } from 'react';
import ImageFramer from './ImageFramer';
import { uploadProfileImage, updateProfileImagePosition } from '../api/profile';
import { Profile } from '../types/profile';
import '../styles/ProfileImageEditor.css';

interface Props {
  profile: Profile;
  onClose: () => void;
  onUpdated: (profile: Profile) => void;
}

export default function ProfileImageEditor({ profile, onClose, onUpdated }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.imageUrl);
  const [isNewFile, setIsNewFile] = useState(false);
  const [offset, setOffset] = useState({ x: profile.offsetX, y: profile.offsetY });
  const [scale, setScale] = useState(profile.scale);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setIsNewFile(true);
    setOffset({ x: 0, y: 0 });
    setScale(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let updated: Profile;
      if (isNewFile && file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('offsetX', String(offset.x));
        formData.append('offsetY', String(offset.y));
        formData.append('scale', String(scale));
        updated = await uploadProfileImage(formData);
      } else {
        updated = await updateProfileImagePosition({ offsetX: offset.x, offsetY: offset.y, scale });
      }
      onUpdated(updated);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile Photo</h2>
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
              <div className="profile-framer-wrapper">
                <ImageFramer
                  src={previewUrl}
                  offset={offset}
                  scale={scale}
                  onOffsetChange={setOffset}
                  onScaleChange={setScale}
                  autoFit={isNewFile}
                />
                <div className="circle-overlay" aria-hidden="true" />
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setFile(null); setPreviewUrl(null); setIsNewFile(false); }}
              >
                Choose different photo
              </button>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting || !previewUrl}>
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
