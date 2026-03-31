"use client";

import { GET_CMS_POSTS } from "../../graphql/queries";
import usePage from "../../lib/usePage";
import { CmsPost } from "../../types/cms";
import { useQuery } from "@apollo/client";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { getFileUrl, templateUrl } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const BlogsPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const pageName = searchParams.get("pageName"); //pageName = about, tours, contact etc

  const PageContent = usePage(pageName);

  const { data, loading } = useQuery(GET_CMS_POSTS, {
    variables: {
      perPage: 10,
      page: 1,
      clientPortalId: params.id || process.env.ERXES_CP_ID,
    },
  });

  const posts = data?.cpPosts || [];

  if (loading) {
    return "Loading ...";
  }
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: CmsPost) => (
          <Card key={post._id} className="mb-2">
            <CardHeader>
              {post.thumbnail && <Image src={getFileUrl(post.thumbnail.url)} alt={post.title} width={300} height={200} className="rounded-t-lg" />}
            </CardHeader>
            <CardContent>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                <p dangerouslySetInnerHTML={{ __html: post.content }} />
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Link href={templateUrl(`/post&postId=${post._id}&slug=${post.slug}`)}>
                {" "}
                <Button>Read more</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      <PageContent />
    </div>
  );
};

export default BlogsPage;
