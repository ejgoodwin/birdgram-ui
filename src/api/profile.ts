import { Profile } from '../types/profile';

const BASE_URL = '/api/profile';

export async function fetchProfile(): Promise<Profile> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateProfileInfo(data: { name: string; bio: string }): Promise<Profile> {
  const res = await fetch(BASE_URL, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function uploadProfileImage(formData: FormData): Promise<Profile> {
  const res = await fetch(`${BASE_URL}/image`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload profile image');
  return res.json();
}

export async function updateProfileImagePosition(data: {
  offsetX: number;
  offsetY: number;
  scale: number;
}): Promise<Profile> {
  const res = await fetch(`${BASE_URL}/image`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile image position');
  return res.json();
}
