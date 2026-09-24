import { Link } from "react-router-dom";
import {blogPosts} from '../../data/blogPosts.js'

export default function BlogPage() {
  return (
    <section className="blog-page">
      <h1>Travel Blog</h1>
      {blogPosts.map((post) =>{
        <Link key={post.id} to={`/blog/${post.id}`}>
          <h3>{post.title}</h3>
          <p>{post.author} · {post.category}</p>
          <p>{post.excerpt}</p>
        </Link>;
      })}
    </section>
  );
}
