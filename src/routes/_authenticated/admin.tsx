import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lazy, Suspense, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listQuoteRequests, setQuoteStatus, type QuoteRequest } from "@/lib/quotes.functions";
import {
  listReviewSubmissions,
  setReviewStatus,
  type ReviewStatus,
  type ReviewSubmission,
} from "@/lib/reviews.functions";
import { Stars } from "@/components/published-reviews";

type ReviewFilter = ReviewStatus | "tous";
const REVIEW_FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "nouveau", label: "En attente" },
  { value: "publié", label: "Publiés" },
  { value: "refusé", label: "Refusés" },
  { value: "tous", label: "Tous" },
];
import { Section } from "@/components/site-blocks";
import { zones } from "@/content/zones";

const SearchConsoleStats = lazy(() =>
  import("@/components/search-console-stats").then((module) => ({ default: module.SearchConsoleStats })),
);
const SeoAudit = lazy(() =>
  import("@/components/seo-audit").then((module) => ({ default: module.SeoAudit })),
);

const SITE_URL = "https://purespacenett.com";
const GSC_RESOURCE = encodeURIComponent("sc-domain:purespacenett.com");

export const Route = createFileRoute("/_authenticated/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Devis reçus — PURE SPACE NETT" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchQuotes = useServerFn(listQuoteRequests);
  const updateStatus = useServerFn(setQuoteStatus);
  const fetchReviews = useServerFn(listReviewSubmissions);
  const changeReviewStatus = useServerFn(setReviewStatus);
  const [search, setSearch] = useState("");
  const [inspectedSlug, setInspectedSlug] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["quote-requests"],
    queryFn: () => fetchQuotes(),
  });

  const reviewsQuery = useQuery({
    queryKey: ["review-submissions"],
    queryFn: () => fetchReviews(),
  });
  const reviews: ReviewSubmission[] = reviewsQuery.data ?? [];
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("nouveau");
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const filteredReviews =
    reviewFilter === "tous" ? reviews : reviews.filter((r) => r.status === reviewFilter);

  const reviewMutation = useMutation({
    mutationFn: (input: { id: string; status: ReviewStatus }) => changeReviewStatus({ data: input }),
    onSuccess: (_res, v) => {
      setReviewNotice(
        v.status === "publié"
          ? "Avis publié : il est maintenant visible sur le site."
          : v.status === "refusé"
            ? "Avis refusé : il ne sera pas affiché."
            : "Avis retiré de la publication (remis en attente).",
      );
      queryClient.invalidateQueries({ queryKey: ["review-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["published-reviews"] });
    },
    onError: (e) => setReviewNotice(`Échec : ${e instanceof Error ? e.message : "action impossible"}`),
  });



  const mutation = useMutation({
    mutationFn: (input: { id: string; status: "nouveau" | "traité" }) =>
      updateStatus({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quote-requests"] }),
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/connexion", replace: true });
  };

  const term = search.trim().toLowerCase();
  const quotes: QuoteRequest[] = (data ?? []).filter((q) =>
    term
      ? [q.full_name, q.email, q.phone, q.service_type ?? ""].join(" ").toLowerCase().includes(term)
      : true,
  );

  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Devis reçus</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.length} demande(s) enregistrée(s)` : "Chargement…"}
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-full border border-border px-5 py-2 text-sm font-semibold"
        >
          Se déconnecter
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un nom, un e-mail, un téléphone…"
        className="mt-6 w-full max-w-md rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Chargement des demandes…</p>}

      {error && (
        <p className="mt-8 text-sm text-destructive">
          Impossible d'afficher les demandes. Votre compte n'a peut-être pas encore les droits
          d'accès.
        </p>
      )}

      {!isLoading && !error && quotes.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">Aucune demande pour le moment.</p>
      )}

      <div className="mt-8 space-y-4">
        {quotes.map((q) => (
          <article key={q.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">{q.full_name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dateFmt.format(new Date(q.created_at))}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  mutation.mutate({
                    id: q.id,
                    status: q.status === "traité" ? "nouveau" : "traité",
                  })
                }
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                  q.status === "traité"
                    ? "bg-secondary text-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {q.status === "traité" ? "Traité — rouvrir" : "Marquer comme traité"}
              </button>
            </div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">E-mail</dt>
                <dd>
                  <a className="font-medium underline" href={`mailto:${q.email}`}>
                    {q.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Téléphone</dt>
                <dd>
                  <a className="font-medium underline" href={`tel:${q.phone.replace(/\s/g, "")}`}>
                    {q.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Prestation</dt>
                <dd className="font-medium">{q.service_type ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Fréquence</dt>
                <dd className="font-medium">{q.frequency ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Type de bien / surface</dt>
                <dd className="font-medium">
                  {q.property_type ?? "—"}
                  {q.surface ? ` · ${q.surface} m²` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Adresse</dt>
                <dd className="font-medium">{q.address ?? "—"}</dd>
              </div>
            </dl>

            {q.message && (
              <p className="mt-4 whitespace-pre-line rounded-xl bg-secondary/60 p-4 text-sm">
                {q.message}
              </p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold">Avis reçus depuis le site</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {reviewsQuery.isLoading
            ? "Chargement…"
            : `${reviews.length} avis · ${reviews.filter((r) => r.status === "nouveau").length} en attente · ${reviews.filter((r) => r.status === "publié").length} publié(s)`}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {REVIEW_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setReviewFilter(f.value)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                reviewFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card"
              }`}
            >
              {f.label} ({f.value === "tous" ? reviews.length : reviews.filter((r) => r.status === f.value).length})
            </button>
          ))}
        </div>

        {reviewNotice && (
          <p role="status" className="mt-4 rounded-xl bg-secondary/60 px-4 py-2 text-sm font-medium">
            {reviewNotice}
          </p>
        )}
        {reviewsQuery.error && (
          <p className="mt-4 text-sm text-destructive">Impossible d'afficher les avis.</p>
        )}

        {filteredReviews.length === 0 && !reviewsQuery.isLoading && (
          <p className="mt-6 text-sm text-muted-foreground">Aucun avis dans cette catégorie.</p>
        )}

        <div className="mt-6 space-y-4">
          {filteredReviews.map((r) => {
            const pending = reviewMutation.isPending && reviewMutation.variables?.id === r.id;
            return (
              <article key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-bold">
                    {r.author_name}
                    {r.city ? ` · ${r.city}` : ""}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === "publié"
                        ? "bg-accent text-accent-foreground"
                        : r.status === "refusé"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-secondary text-foreground"
                    }`}
                  >
                    {r.status === "publié" ? "Publié" : r.status === "refusé" ? "Refusé" : "En attente"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-muted-foreground">
                    {dateFmt.format(new Date(r.created_at))}
                    {r.service_type ? ` · ${r.service_type}` : ""}
                    {r.email ? ` · ${r.email}` : ""}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-line rounded-xl bg-secondary/60 p-4 text-sm">
                  {r.message}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status !== "publié" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "publié" })}
                      className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      Publier
                    </button>
                  )}
                  {r.status === "publié" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "nouveau" })}
                      className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
                    >
                      Retirer de la publication
                    </button>
                  )}
                  {r.status !== "refusé" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => reviewMutation.mutate({ id: r.id, status: "refusé" })}
                      className="rounded-full border border-destructive/40 px-4 py-1.5 text-xs font-semibold text-destructive disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Suspense
        fallback={
          <p className="mt-14 text-sm text-muted-foreground">Chargement des outils Google…</p>
        }
      >
        <SearchConsoleStats />
      </Suspense>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold">Suivi Google par ville</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Pour chaque ville : la page publique, la vérification Google (est-elle bien indexée ?) et
          les recherches qui l'ont fait apparaître. « Vérifier dans Google » ouvre Search Console et
          copie l'adresse de la page : collez-la dans la barre « Inspecter une URL » en haut, puis
          appuyez sur Entrée.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {zones.map((z) => {
            const pageUrl = `${SITE_URL}/zones/${z.slug}`;
            return (
              <article
                key={z.slug}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <h3 className="font-display text-base font-bold">
                  {z.name}
                  {z.postalCode ? ` (${z.postalCode})` : ""}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 transition-colors hover:border-accent"
                  >
                    Voir la page
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(pageUrl).catch(() => {});
                      window.open(
                        `https://search.google.com/search-console?resource_id=${GSC_RESOURCE}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                      setInspectedSlug(z.slug);
                    }}
                    className="rounded-full bg-primary px-3 py-1.5 text-primary-foreground"
                  >
                    {inspectedSlug === z.slug ? "Adresse copiée ✓" : "Vérifier dans Google"}
                  </button>
                  <a
                    href={`https://search.google.com/search-console/performance/search-analytics?resource_id=${GSC_RESOURCE}&page=${encodeURIComponent(`!${pageUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 transition-colors hover:border-accent"
                  >
                    Recherches Google
                  </a>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`nettoyage ${z.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border px-3 py-1.5 transition-colors hover:border-accent"
                  >
                    Tester « nettoyage {z.name} »
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Suspense
        fallback={
          <p className="mt-14 text-sm text-muted-foreground">Chargement de l’analyse SEO…</p>
        }
      >
        <SeoAudit />
      </Suspense>
    </Section>
  );
}
