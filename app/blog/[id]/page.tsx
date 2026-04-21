import Image from "next/image";
import { fetchCmsPost } from "../../../lib/fetchCms";
import { getFileUrl } from "../../../lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await fetchCmsPost({ id });

  if (!post) {
    return <div className="container mx-auto p-4">Post not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div className="gap-4">
        <div>
          {post.thumbnail && (
            <Image
              src={getFileUrl(post.thumbnail.url)}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 object-cover"
            />
          )}
          <p dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </div>
  );
}
