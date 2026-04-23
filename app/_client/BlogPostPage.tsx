"use client";

import { GET_CMS_POST } from "../../graphql/queries";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useQuery } from "@apollo/client";
import Image from "next/image";
import { getFileUrl } from "@/lib/utils";

type PostDetailPageProps = {
  initialPostId?: string;
  initialPost?: any;
};

const PostDetailPage = ({ initialPostId, initialPost }: PostDetailPageProps) => {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);

  const postId = searchParams.get("postId") ?? initialPostId;

  const { data } = useQuery(GET_CMS_POST, {
    variables: { id: postId },
    skip: !!initialPost,
  });

  const post = initialPost ?? data?.cmsPost ?? {};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div className=" gap-4">
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
          <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
        </div>
      </div>
      <div>
        <PageContent />
      </div>
    </div>
  );
};

export default PostDetailPage;
