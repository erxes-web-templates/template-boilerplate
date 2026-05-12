import { isBuildMode } from "../../../lib/buildMode";
import BlogPostPageClient from "../../_client/BlogPostPage";
import { fetchCmsPost } from "../../../lib/fetchCms";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialPost = isBuildMode() ? null : await fetchCmsPost({ id });
  return <BlogPostPageClient initialPostId={id} initialPost={initialPost} />;
}
