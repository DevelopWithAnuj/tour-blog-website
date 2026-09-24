
import { useParams } from 'react-router-dom';
import { blogPosts } from '../../data/blogPosts.js';

export default function BlogPostPage() {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === Number(id));

  if (!post) return <section>Post not found.</section>;

  return (
    <section className="blog-post-page">
      <h1>{post.title}</h1>
      <p>
        {post.author} · {post.publishedAt}
      </p>
      <p>{post.content}</p>
    </section>
  );
}
