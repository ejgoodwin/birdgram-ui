import React from 'react';
import PostCard from './PostCard';
import { Post } from '../types';
import '../styles/PostGrid.css';

interface Props {
  posts: Post[];
  onDelete: (id: string) => void;
  onUpdated: (post: Post) => void;
}

export default function PostGrid({ posts, onDelete, onUpdated }: Props) {
  return (
    <div className="post-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={onDelete} onUpdated={onUpdated} />
      ))}
    </div>
  );
}
