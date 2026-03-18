import React from 'react';
import PostCard from './PostCard';
import { Post } from '../types';
import '../styles/PostGrid.css';

interface Props {
  posts: Post[];
  onDelete: (id: string) => void;
}

export default function PostGrid({ posts, onDelete }: Props) {
  return (
    <div className="post-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={onDelete} />
      ))}
    </div>
  );
}
