"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export type ProductReview = {
  _id: string;
  productId?: string | null;
  customerId?: string | null;
  review?: number | string | null;
  description?: string | null;
  info?: Record<string, unknown> | null;
};

interface ProductReviewsProps {
  customerId: string | null;
  productId?: string | null;
  ratingDisplay: string | null;
  reviewTotal: number;
  reviewsLoading: boolean;
  productReviews: ProductReview[];
  rating: number | null;
  reviewText: string;
  submittingReview: boolean;
  hasUserReview: boolean;
  onRatingChange: (value: number) => void;
  onReviewTextChange: (value: string) => void;
  onSubmitReview: () => void;
}

export function ProductReviews({
  customerId,
  productId,
  ratingDisplay,
  reviewTotal,
  reviewsLoading,
  productReviews,
  rating,
  reviewText,
  submittingReview,
  hasUserReview,
  onRatingChange,
  onReviewTextChange,
  onSubmitReview,
}: ProductReviewsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const prevSubmitting = useRef(submittingReview);

  useEffect(() => {
    if (prevSubmitting.current && !submittingReview) {
      setIsEditing(false);
    }
    prevSubmitting.current = submittingReview;
  }, [submittingReview]);

  const sortedReviews = useMemo(() => {
    if (!customerId) return productReviews;
    const mine = productReviews.find((r) => r.customerId === customerId);
    const others = productReviews.filter((r) => r.customerId !== customerId);
    return mine ? [mine, ...others] : others;
  }, [productReviews, customerId]);

  const showForm = Boolean(customerId) && (!hasUserReview || isEditing);

  return (
    <section className="mt-12 space-y-5 rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Customer reviews
          </h3>
          <p className="text-sm text-muted-foreground">
            Share your experience to help other shoppers.
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-foreground">
            {ratingDisplay ?? "—"}
          </p>
          <p className="text-sm text-muted-foreground">
            {reviewTotal > 0
              ? `${reviewTotal} review${reviewTotal === 1 ? "" : "s"}`
              : "No reviews yet"}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-xl border border-border bg-background/60 p-4">
          <p className="text-sm font-medium text-foreground">
            {hasUserReview ? "Edit your review" : "Your review"}
          </p>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              return (
                <button
                  key={`star-${value}`}
                  type="button"
                  onClick={() => onRatingChange(value)}
                  className={`rounded-full p-2 transition-colors ${
                    rating && value <= rating
                      ? "text-yellow-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      rating && value <= rating
                        ? "fill-yellow-500 text-yellow-500"
                        : ""
                    }`}
                  />
                </button>
              );
            })}
            <span className="text-xs text-muted-foreground">Tap to rate</span>
          </div>
          <Textarea
            rows={4}
            placeholder="Tell others about your experience"
            value={reviewText}
            onChange={(event) => onReviewTextChange(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onSubmitReview}
              disabled={submittingReview || !productId || !rating}
            >
              {submittingReview
                ? "Saving..."
                : hasUserReview
                ? "Update review"
                : "Submit review"}
            </Button>
            {isEditing && (
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={submittingReview}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {!customerId && (
        <p className="text-sm text-muted-foreground">
          Sign in to leave a review.
        </p>
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Recent reviews</p>
        {reviewsLoading && (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={`review-skeleton-${index}`}
                className="h-16 animate-pulse rounded-lg bg-muted/40"
              />
            ))}
          </div>
        )}
        {!reviewsLoading && sortedReviews.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No reviews yet. Be the first to share your thoughts.
          </p>
        )}
        {!reviewsLoading && sortedReviews.length > 0 && (
          <div className="space-y-3">
            {sortedReviews.map((entry) => {
              const value =
                typeof entry.review === "number"
                  ? entry.review
                  : Number(entry.review);
              const isMine = Boolean(
                customerId && entry.customerId === customerId,
              );
              return (
                <Card key={entry._id} className="border border-border">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={`${entry._id}-${starIndex}`}
                          className={`h-4 w-4 ${
                            value && starIndex < Math.round(value)
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm font-medium text-foreground">
                        {value && Number.isFinite(value)
                          ? value.toFixed(1)
                          : "—"}
                      </span>
                      {isMine && (
                        <Badge variant="secondary" className="ml-2">
                          Your review
                        </Badge>
                      )}
                      {isMine && !isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-7 gap-1 px-2 text-xs"
                          onClick={() => setIsEditing(true)}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
