import React, { useState } from 'react';
import { Profile } from '../types/profile';
import ProfileImageEditor from './ProfileImageEditor';
import ProfileInfoEditor from './ProfileInfoEditor';
import '../styles/ProfileSection.css';

interface Props {
  profile: Profile;
  postCount: number;
  onUpdated: (profile: Profile) => void;
}

export default function ProfileSection({ profile, postCount, onUpdated }: Props) {
  const [editingImage, setEditingImage] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);

  return (
    <>
      <section className="profile-section">
        <button
          className="profile-avatar-btn"
          onClick={() => setEditingImage(true)}
          title="Change profile photo"
          aria-label="Change profile photo"
        >
          <div className="profile-avatar">
            {profile.imageUrl ? (
              <div className="profile-avatar-inner">
                <img
                  src={profile.imageUrl}
                  alt="Profile"
                  draggable={false}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    maxWidth: 'none',
                    width: 'auto',
                    height: 'auto',
                    transform: `translate(${profile.offsetX}px, ${profile.offsetY}px) scale(${profile.scale})`,
                    transformOrigin: 'top left',
                  }}
                />
              </div>
            ) : (
              <div className="profile-avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor" width="60" height="60">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            )}
            <div className="profile-avatar-overlay">
              <span>Edit</span>
            </div>
          </div>
        </button>

        <div className="profile-info">
          <div className="profile-name-row">
            <h2 className="profile-name">{profile.name || 'Your Name'}</h2>
            <button className="btn-ghost btn-sm" onClick={() => setEditingInfo(true)}>
              Edit Profile
            </button>
          </div>
          <p className="profile-post-count">
            <strong>{postCount}</strong> {postCount === 1 ? 'post' : 'posts'}
          </p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          {!profile.bio && (
            <p className="profile-bio-placeholder" onClick={() => setEditingInfo(true)}>
              Add a bio...
            </p>
          )}
        </div>
      </section>

      <div className="profile-divider" />

      {editingImage && (
        <ProfileImageEditor
          profile={profile}
          onClose={() => setEditingImage(false)}
          onUpdated={(p) => { onUpdated(p); setEditingImage(false); }}
        />
      )}
      {editingInfo && (
        <ProfileInfoEditor
          profile={profile}
          onClose={() => setEditingInfo(false)}
          onUpdated={(p) => { onUpdated(p); setEditingInfo(false); }}
        />
      )}
    </>
  );
}
