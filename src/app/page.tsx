import { api } from "@/trpc/server";
import AppLayout from "./layouts/main/appLayout";
import Link from "next/link";

export default async function Home() {
  const posts = await api.post.getAllPosts();

  return (
    <div>
      <h1>All Posts</h1>
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>
              <h2>{post.name}</h2>
              <p>Category: {post.category.name}</p>
              <p>Created by: {post.createdBy.name}</p>
              <p>Created at: {new Date(post.createdAt).toLocaleString()}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
