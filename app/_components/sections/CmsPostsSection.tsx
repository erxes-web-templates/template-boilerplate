"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_CMS_POSTS } from "../../../graphql/queries";
import { getFileUrl, templateUrl } from "@/lib/utils";
import { isBuildMode } from "../../../lib/buildMode";
import { toHtml } from "../../../lib/html";
import { Section } from "../../../types/sections";
import { useParams } from "next/navigation";
import { CmsPost } from "../../../types/cms";

const CmsPostsSection = ({ section }: { section: Section }) => {
  const params = useParams();

  const { data } = useQuery(GET_CMS_POSTS, {
    variables: {
      perPage: section.config.perPage,
      page: 1,
      clientPortalId: params.id || process.env.ERXES_CP_ID,
      categoryId: section.config.categoryId,
    },
  });

  const posts = data?.cpPosts || [];
  const isBuilder = isBuildMode();

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {section.config.title && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {section.config.title}
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post: CmsPost) => (
            <Card key={post._id} className="group overflow-hidden transition-shadow duration-200 hover:shadow-md">
              {post.thumbnail && (
                <CardHeader className="p-0">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image
                      src={getFileUrl(post.thumbnail.url)}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </CardHeader>
              )}
              <CardContent className="p-4">
                <CardTitle className="mb-2 text-sm font-medium line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-3">
                  <p dangerouslySetInnerHTML={toHtml(post.content)} />
                </CardDescription>
              </CardContent>
              <CardFooter className="border-t border-border p-4">
                <Link
                  href={
                    isBuilder
                      ? templateUrl(`/post&postId=${post._id}&slug=${post.slug}`)
                      : `/blog/${post._id}`
                  }
                >
                  <Button variant="outline" size="sm">
                    {section.config.primaryCta || "Read more"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        {section.config?.primaryCtaUrl && (
          <div className="mt-10 text-center">
            <Link
              href={isBuilder ? templateUrl(section.config.primaryCtaUrl) : section.config.primaryCtaUrl}
              className="text-sm font-medium text-primary hover:underline"
            >
              {section.config.primaryCta || "View all"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CmsPostsSection;
