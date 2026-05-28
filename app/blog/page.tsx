import type { Metadata } from "next";
import { isBuildMode } from "../../lib/buildMode";
import BlogPageClient from "../_client/BlogPage";
import { fetchCmsPosts } from "../../lib/fetchCms";
import { fetchWebPage } from "../../lib/fetchWebPage";
import data from "../../data/configs.json";

export async function generateMetadata(): Promise<Metadata> {
  if (isBuildMode()) return { title: "Blog" };
  const page = await fetchWebPage(process.env.ERXES_WEB_ID || "", "blog");
  return {
    title: page?.name ?? "Blog",
    description: page?.description ?? undefined,
    ...(page?.coverImage && { openGraph: { images: [page.coverImage] } }),
  };
}

export default async function BlogsPage() {
  const initialPosts = isBuildMode() ? null : await fetchCmsPosts({ limit: 10, webId: data.cpId });
  return <BlogPageClient initialPosts={initialPosts} />;
}
