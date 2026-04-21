import Link from "next/link";
import Image from "next/image";
import { fetchCmsPosts } from "../../lib/fetchCms";
import data from "../../data/configs.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { getFileUrl } from "../../lib/utils";
import type { CmsPost } from "../../types/cms";

export default async function BlogsPage() {
  const posts = await fetchCmsPosts({
    limit: 10,
    webId: data.cpId,
  });

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: CmsPost) => (
          <Card key={post._id} className="mb-2">
            <CardHeader>
              {post.thumbnail && (
                <Image
                  src={getFileUrl(post.thumbnail.url)}
                  alt={post.title}
                  width={300}
                  height={200}
                  className="rounded-t-lg"
                />
              )}
            </CardHeader>
            <CardContent>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                <p dangerouslySetInnerHTML={{ __html: post.content }} />
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Link href={`/blog/${post._id}`}>
                <Button>Read more</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
