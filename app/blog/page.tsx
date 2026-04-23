import { isBuildMode } from "../../lib/buildMode";
import BlogPageClient from "../_client/BlogPage";
import { fetchCmsPosts } from "../../lib/fetchCms";
import data from "../../data/configs.json";

export default async function BlogsPage() {
  const initialPosts = isBuildMode() ? null : await fetchCmsPosts({ limit: 10, webId: data.cpId });
  return <BlogPageClient initialPosts={initialPosts} />;
}
