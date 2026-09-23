import { Link } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { Quote, Star } from "lucide-react";
import { getPublishedReviews, type PublishedReview } from "@/lib/reviews.functions";

export const publishedReviewsQuery = queryOptions({
  queryKey: ["published-reviews"],
  queryFn: () => getPublishedReviews(),
  staleTime: 5 * 60 * 1000,
});

const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

export function Stars({ rating, className = "size-4" }: { rating: number; className?: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`Note de ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} ${i < Math.round(rating) ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review }: { review: PublishedReview }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
      <Quote className="size-6 text-accent" />
      <blockquote className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
        “{review.message}”
      </blockquote>
      <div className="mt-4">
        <Stars rating={review.rating} />
      </div>
      <figcaption className="mt-3 text-sm">
        <span className="font-display font-semibold">{review.author_name}</span>
        <span className="block text-xs text-muted-foreground">
          {[review.city, review.service_type, monthFmt.format(new Date(review.created_at))]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </figcaption>
    </figure>
  );
}

/** Preuve sociale : moyenne et nombre calculés uniquement sur les avis publiés. */
export function SocialProof({ city, limit = 3 }: { city?: string; limit?: number }) {
  const { data, isLoading } = useQuery(publishedReviewsQuery);
  if (isLoading) return null;

  const all = data?.reviews ?? [];
  const local = city ? all.filter((r) => r.city?.toLowerCase() === city.toLowerCase()) : [];
  const shown = (local.length ? [...local, ...all.filter((r) => !local.includes(r))] : all).slice(0, limit);

  return (
    <div>
      {data && data.count > 0 && data.average !== null ? (
        <div className="flex flex-wrap items-center gap-3">
          <Stars rating={data.average} className="size-5" />
          <p className="text-sm font-semibold">
            {data.average.toLocaleString("fr-FR")}/5 · {data.count} avis client{data.count > 1 ? "s" : ""} publié
            {data.count > 1 ? "s" : ""}
          </p>
        </div>
      ) : null}

      {shown.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Les premiers avis clients laissés sur le site seront affichés ici après vérification.
        </p>
      )}

      <Link to="/avis" className="mt-6 inline-block text-sm font-semibold text-primary underline">
        Voir tous les avis et laisser le vôtre
      </Link>
    </div>
  );
}
