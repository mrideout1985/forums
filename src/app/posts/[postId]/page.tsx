// app/posts/[postId]/page.tsx

import { api } from "@/trpc/server";

export default async function PostPage({
  params,
}: {
  params: { postId: string };
}) {
  const { postId } = params;
  console.log(postId);

  const post = await api.post.getPostById({ id: Number(postId) });

  return (
    <div>
      <h1>{post.name}</h1>
      <p>Category: {post.category.name}</p>
      <p>Created by: {post.createdBy.name}</p>
      <p>Created at: {new Date(post.createdAt).toLocaleString()}</p>
      <p>
        {post.updatedAt &&
          `Updated at: ${new Date(post.updatedAt).toLocaleString()}`}
      </p>
    </div>
  );
}
