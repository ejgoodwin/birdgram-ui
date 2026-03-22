import React, { useState } from 'react';
import { updateProfileInfo } from '../api/profile';
import { Profile } from '../types/profile';
import '../styles/PostCreator.css';

interface Props {
  profile: Profile;
  onClose: () => void;
  onUpdated: (profile: Profile) => void;
}

export default function ProfileInfoEditor({ profile, onClose, onUpdated }: Props) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateProfileInfo({ name, bio });
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
          <h2>Edit Profile</h2>
          <button className="btn-close" onClick={onClose}>&#x2715;</button>
        </div>

        <form onSubmit={handleSubmit} className="creator-form">
          <div className="form-field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
          </div>

          <div className="form-field">
            <label htmlFor="profile-bio">Bio</label>
            <textarea
              id="profile-bio"
              placeholder="Tell people about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={3}
              style={{ resize: 'vertical', border: '1px solid #dbdbdb', borderRadius: 6, padding: '8px 12px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
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
