import { Post } from '../types';

const BASE_URL = '/api/posts';

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function createPost(formData: FormData): Promise<Post> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

export async function updatePost(
  id: string,
  data: { title: string; offsetX: number; offsetY: number; scale: number }
): Promise<Post> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update post');
  return res.json();
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete post');
}
