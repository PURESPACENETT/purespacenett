import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/content/testimonials";

export function DeferredReviews({ testimonials }: { testimonials: Testimonial[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {visible ? <ReviewsContent testimonials={testimonials} /> : null}
    </div>
  );
}

function ReviewsContent({ testimonials }: { testimonials: Testimonial[] }) {
  const [Reviews, setReviews] = useState<typeof import("@/components/published-reviews") | null>(null);

  useEffect(() => {
    let active = true;
    import("@/components/published-reviews").then((module) => {
      if (active) setReviews(module);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!Reviews) {
    return <div className="min-h-24" aria-hidden="true" />;
  }

  const { SocialProof, GoogleReviewCard } = Reviews;

  return (
    <>
      <SocialProof />
      {testimonials.some((review) => review.sourceUrl) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials
            .filter((review) => review.sourceUrl)
            .map((review) => (
              <GoogleReviewCard key={review.author} review={review} />
            ))}
        </div>
      )}
    </>
  );
}
