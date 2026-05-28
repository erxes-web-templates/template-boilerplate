import type { Metadata } from "next";
import { isBuildMode } from "../../../lib/buildMode";
import BlogPostPageClient from "../../_client/BlogPostPage";
import { fetchCmsPost } from "../../../lib/fetchCms";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (isBuildMode()) return { title: "Blog Post" };
  const { id } = await params;
  const post = await fetchCmsPost({ id });
  return {
    title: post?.title ?? "Blog Post",
    description: post?.excerpt ?? undefined,
    ...(post?.images?.[0]?.url && {
      openGraph: { images: [post.images[0].url] },
    }),
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialPost = isBuildMode() ? null : await fetchCmsPost({ id });
  return <BlogPostPageClient initialPostId={id} initialPost={initialPost} />;
}
