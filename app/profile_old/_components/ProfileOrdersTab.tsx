"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFileUrl } from "@/lib/utils";

type Order = {
  _id: string;
  createdAt?: string | null;
  number?: string | null;
  totalAmount?: number | null;
  status?: string | null;
  items?: Array<{
    productName?: string | null;
    productImgUrl?: string | null;
    count?: number | null;
  }>;
};

type ProfileOrdersTabProps = {
  orders: Order[];
  loading?: boolean;
};

const ProfileOrdersTab = ({ orders, loading }: ProfileOrdersTabProps) => {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Захиалгуудыг ачааллаж байна…
      </p>
    );
  }

  if (!orders?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Таны захиалгын түүх хоосон байна.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id} className="border border-muted">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Захиалга #{order.number ?? order._id.slice(-6)}
              </CardTitle>
              <CardDescription>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "—"}{" "}
                · Нийт:{" "}
                <span className="font-medium text-foreground">
                  ₮{Number(order.totalAmount || 0).toLocaleString()}
                </span>
              </CardDescription>
            </div>
            <Badge variant="outline">
              {order.status ?? "Төлөв тодорхойгүй"}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {order.items?.slice(0, 3).map((item, index) => {
              const imageUrl = item?.productImgUrl
                ? getFileUrl(item.productImgUrl)
                : undefined;
              return (
                <div
                  key={`${order._id}-item-${index}`}
                  className="flex gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- static preview
                      <img
                        src={imageUrl}
                        alt={item?.productName ?? "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between text-sm">
                    <p className="font-medium">
                      {item?.productName ?? "Бараа"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Тоо: {item?.count ?? 1}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" size="sm">
              Дэлгэрэнгүй харах
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProfileOrdersTab;
