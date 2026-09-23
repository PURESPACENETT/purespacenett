import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  LogOut,
  Mail,
  MessageSquareQuote,
  Phone,
  Search,
  Settings2,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Stars } from "@/components/published-reviews";
import { Section } from "@/components/site-blocks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zones } from "@/content/zones";
import { supabase } from "@/integrations/supabase/client";
import { listQuoteRequests, setQuoteStatus, type QuoteRequest } from "@/lib/quotes.functions";
import {
  listReviewSubmissions,
  setReviewStatus,
  type ReviewStatus,
  type ReviewSubmission,
} from "@/lib/reviews.functions";
import { cn } from "@/lib/utils";

type AdminTab = "tableau-de-bord" | "demandes" | "avis" | "seo" | "outils";
type QuoteFilter = "tous" | "nouveau" | "traité";
type ReviewFilter = ReviewStatus | "tous";

const ADMIN_TABS: { value: AdminTab; label: string; shortLabel: string; icon: typeof BarChart3 }[] = [
  { value: "tableau-de-bord", label: "Tableau de bord", shortLabel: "Tableau de bord", icon: BarChart3 },
  { value: "demandes", label: "Demandes", shortLabel: "Demandes", icon: ClipboardList },
  { value: "avis", label: "Avis", shortLabel: "Avis", icon: MessageSquareQuote },
  { value: "seo", label: "SEO / Search Console", shortLabel: "SEO", icon: Search },
  { value: "outils", label: "Outils", shortLabel: "Outils", icon: Settings2 },
];

const QUOTE_FILTERS: { value: QuoteFilter; label: string }[] = [
  { value: "tous", label: "Toutes" },
  { value: "nouveau", label: "À traiter" },
  { value: "traité", label: "Traitées" },
];

const REVIEW_FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: "nouveau", label: "En attente" },
  { value: "publié", label: "Publiés" },
  { value: "refusé", label: "Refusés" },
  { value: "tous", label: "Tous" },
];

const SearchConsoleStats = lazy(() =>
  import("@/components/search-console-stats").then((module) => ({
    default: module.SearchConsoleStats,
  })),
);
const SeoAudit = lazy(() =>
  import("@/components/seo-audit").then((module) => ({ default: module.SeoAudit })),
);

const SITE_URL = "https://purespacenett.com";
const GSC_RESOURCE = encodeURIComponent("sc-domain:purespacenett.com");

function isAdminTab(value: unknown): value is AdminTab {
  return ADMIN_TABS.some((tab) => tab.value === value);
}

export const Route = createFileRoute("/_authenticated/admin")({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>) => ({
    onglet: isAdminTab(search["onglet"]) ? search["onglet"] : ("tableau-de-bord" as AdminTab),
  }),
  head: () => ({
    meta: [
      { title: "Espace administrateur — PURE SPACE NETT" },
      {
        name: "description",
        content: "Espace privé de gestion des demandes, avis clients et performances SEO de PURE SPACE NETT.",
      },
      { property: "og:title", content: "Espace administrateur — PURE SPACE NETT" },
      {
        property: "og:description",
        content: "Espace privé de gestion PURE SPACE NETT.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const { onglet } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const fetchQuotes = useServerFn(listQuoteRequests);
  const updateStatus = useServerFn(setQuoteStatus);
  const fetchReviews = useServerFn(listReviewSubmissions);
  const changeReviewStatus = useServerFn(setReviewStatus);
  const [search, setSearch] = useState("");
  const [quoteFilter, setQuoteFilter] = useState<QuoteFilter>("tous");
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
  const [quoteToChange, setQuoteToChange] = useState<QuoteRequest | null>(null);
  const [quoteNotice, setQuoteNotice] = useState<string | null>(null);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("nouveau");
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [reviewToChange, setReviewToChange] = useState<{
    review: ReviewSubmission;
    status: ReviewStatus;
  } | null>(null);
  const [inspectedSlug, setInspectedSlug] = useState<string | null>(null);

  const quotesQuery = useQuery({
    queryKey: ["quote-requests"],
    queryFn: () => fetchQuotes(),
  });
  const reviewsQuery = useQuery({
    queryKey: ["review-submissions"],
    queryFn: () => fetchReviews(),
  });

  const quotes: QuoteRequest[] = quotesQuery.data ?? [];
  const reviews: ReviewSubmission[] = reviewsQuery.data ?? [];
  const pendingQuotes = quotes.filter((quote) => quote.status !== "traité").length;
  const pendingReviews = reviews.filter((review) => review.status === "nouveau").length;

  const quoteMutation = useMutation({
    mutationFn: (input: { id: string; status: "nouveau" | "traité" }) =>
      updateStatus({ data: input }),
    onSuccess: (_response, variables) => {
      setQuoteNotice(
        variables.status === "traité"
          ? "Demande marquée comme traitée."
          : "Demande rouverte et replacée dans les demandes à traiter.",
      );
      setQuoteToChange(null);
      queryClient.invalidateQueries({ queryKey: ["quote-requests"] });
    },
    onError: (error) => {
      setQuoteNotice(
        `Échec : ${error instanceof Error ? error.message : "le statut n’a pas pu être modifié"}`,
      );
      setQuoteToChange(null);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (input: { id: string; status: ReviewStatus }) =>
      changeReviewStatus({ data: input }),
    onSuccess: (_response, variables) => {
      setReviewNotice(
        variables.status === "publié"
          ? "Avis publié : il est maintenant visible sur le site."
          : variables.status === "refusé"
            ? "Avis refusé : il ne sera pas affiché."
            : "Avis retiré de la publication et remis en attente.",
      );
      setReviewToChange(null);
      queryClient.invalidateQueries({ queryKey: ["review-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["published-reviews"] });
    },
    onError: (error) => {
      setReviewNotice(
        `Échec : ${error instanceof Error ? error.message : "l’action n’a pas pu être effectuée"}`,
      );
      setReviewToChange(null);
    },
  });

  const changeTab = (tab: AdminTab) => {
    navigate({ search: { onglet: tab } });
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/connexion", search: {} as never, replace: true });
  };

  const term = search.trim().toLowerCase();
  const filteredQuotes = quotes.filter((quote) => {
    const matchesStatus = quoteFilter === "tous" || quote.status === quoteFilter;
    const matchesSearch = term
      ? [quote.full_name, quote.email, quote.phone, quote.service_type ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(term)
      : true;
    return matchesStatus && matchesSearch;
  });
  const filteredReviews =
    reviewFilter === "tous" ? reviews : reviews.filter((review) => review.status === reviewFilter);

  return (
    <Section>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Espace privé</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Administration</h1>
        </div>
        <Button type="button" variant="outline" onClick={signOut}>
          <LogOut aria-hidden="true" />
          Se déconnecter
        </Button>
      </header>

      <AdminNavigation activeTab={onglet} onChange={changeTab} />

      <main className="mt-8" aria-live="polite">
        {onglet === "tableau-de-bord" && (
          <DashboardTab
            quotes={quotes}
            reviews={reviews}
            quotesLoading={quotesQuery.isLoading}
            reviewsLoading={reviewsQuery.isLoading}
            onNavigate={changeTab}
          />
        )}

        {onglet === "demandes" && (
          <RequestsTab
            quotes={quotes}
            filteredQuotes={filteredQuotes}
            isLoading={quotesQuery.isLoading}
            error={Boolean(quotesQuery.error)}
            search={search}
            filter={quoteFilter}
            expandedQuoteId={expandedQuoteId}
            pendingId={quoteMutation.isPending ? quoteMutation.variables?.id : undefined}
            notice={quoteNotice}
            onSearch={setSearch}
            onFilter={setQuoteFilter}
            onToggleDetails={(id) => setExpandedQuoteId((current) => (current === id ? null : id))}
            onRequestStatusChange={setQuoteToChange}
          />
        )}

        {onglet === "avis" && (
          <ReviewsTab
            reviews={reviews}
            filteredReviews={filteredReviews}
            isLoading={reviewsQuery.isLoading}
            error={Boolean(reviewsQuery.error)}
            filter={reviewFilter}
            pendingId={reviewMutation.isPending ? reviewMutation.variables?.id : undefined}
            notice={reviewNotice}
            onFilter={setReviewFilter}
            onRequestStatusChange={(review, status) => {
              if (status === "publié") {
                reviewMutation.mutate({ id: review.id, status });
                return;
              }
              setReviewToChange({ review, status });
            }}
          />
        )}

        {onglet === "seo" && (
          <SeoTab inspectedSlug={inspectedSlug} onInspect={setInspectedSlug} />
        )}

        {onglet === "outils" && (
          <div className="[&>div]:mt-0">
            <Suspense fallback={<LoadingMessage>Chargement de l’analyse SEO…</LoadingMessage>}>
              <SeoAudit />
            </Suspense>
          </div>
        )}
      </main>

      <AlertDialog open={quoteToChange !== null} onOpenChange={(open) => !open && setQuoteToChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {quoteToChange?.status === "traité" ? "Rouvrir cette demande ?" : "Marquer comme traitée ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {quoteToChange?.status === "traité"
                ? "Elle reviendra dans la liste des demandes à traiter."
                : "La demande restera enregistrée et pourra être rouverte à tout moment."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={quoteMutation.isPending}
              onClick={() => {
                if (!quoteToChange) return;
                quoteMutation.mutate({
                  id: quoteToChange.id,
                  status: quoteToChange.status === "traité" ? "nouveau" : "traité",
                });
              }}
            >
              {quoteMutation.isPending ? "Enregistrement…" : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reviewToChange !== null} onOpenChange={(open) => !open && setReviewToChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewToChange?.status === "refusé" ? "Refuser cet avis ?" : "Dépublier cet avis ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reviewToChange?.status === "refusé"
                ? "L’avis restera enregistré, mais ne sera pas visible sur le site."
                : "L’avis disparaîtra du site et reviendra dans la liste En attente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={reviewMutation.isPending}
              className={reviewToChange?.status === "refusé" ? "bg-destructive text-destructive-foreground" : undefined}
              onClick={() => {
                if (!reviewToChange) return;
                reviewMutation.mutate({ id: reviewToChange.review.id, status: reviewToChange.status });
              }}
            >
              {reviewMutation.isPending ? "Enregistrement…" : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

function AdminNavigation({ activeTab, onChange }: { activeTab: AdminTab; onChange: (tab: AdminTab) => void }) {
  return (
    <nav className="mt-7" aria-label="Sections de l’administration">
      <div className="sm:hidden">
        <Select value={activeTab} onValueChange={(value) => isAdminTab(value) && onChange(value)}>
          <SelectTrigger aria-label="Choisir une section">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_TABS.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden overflow-x-auto border-b border-border sm:flex" role="tablist">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.value;
          return (
            <Button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              variant="ghost"
              onClick={() => onChange(tab.value)}
              className={cn(
                "h-11 shrink-0 rounded-none border-b-2 px-4",
                selected ? "border-primary bg-secondary text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              <Icon aria-hidden="true" />
              <span className="hidden lg:inline">{tab.label}</span>
              <span className="lg:hidden">{tab.shortLabel}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

function DashboardTab({
  quotes,
  reviews,
  quotesLoading,
  reviewsLoading,
  onNavigate,
}: {
  quotes: QuoteRequest[];
  reviews: ReviewSubmission[];
  quotesLoading: boolean;
  reviewsLoading: boolean;
  onNavigate: (tab: AdminTab) => void;
}) {
  const stats = [
    {
      label: "Demandes à traiter",
      value: quotesLoading ? "…" : String(quotes.filter((quote) => quote.status !== "traité").length),
      tab: "demandes" as const,
      icon: ClipboardList,
    },
    {
      label: "Demandes traitées",
      value: quotesLoading ? "…" : String(quotes.filter((quote) => quote.status === "traité").length),
      tab: "demandes" as const,
      icon: CheckCircle2,
    },
    {
      label: "Avis à modérer",
      value: reviewsLoading ? "…" : String(reviews.filter((review) => review.status === "nouveau").length),
      tab: "avis" as const,
      icon: MessageSquareQuote,
    },
    {
      label: "Avis publiés",
      value: reviewsLoading ? "…" : String(reviews.filter((review) => review.status === "publié").length),
      tab: "avis" as const,
      icon: BarChart3,
    },
  ];

  return (
    <section aria-labelledby="dashboard-title">
      <div>
        <h2 id="dashboard-title" className="font-display text-2xl font-bold">Tableau de bord</h2>
        <p className="mt-1 text-sm text-muted-foreground">Les éléments qui demandent votre attention.</p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Button
              key={stat.label}
              type="button"
              variant="ghost"
              onClick={() => onNavigate(stat.tab)}
              className="h-auto w-full flex-col items-stretch whitespace-normal rounded-lg border border-border bg-card p-5 text-left shadow-card transition-colors hover:border-accent hover:bg-card focus-visible:ring-2"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <Icon className="size-4 text-accent" aria-hidden="true" />
              </div>
              <span className="mt-3 block font-display text-3xl font-bold tabular-nums">{stat.value}</span>
            </Button>
          );
        })}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" onClick={() => onNavigate("demandes")}>Voir les demandes</Button>
        <Button type="button" variant="outline" onClick={() => onNavigate("avis")}>Modérer les avis</Button>
        <Button type="button" variant="outline" onClick={() => onNavigate("seo")}>Voir les résultats Google</Button>
      </div>
    </section>
  );
}

function RequestsTab({
  quotes,
  filteredQuotes,
  isLoading,
  error,
  search,
  filter,
  expandedQuoteId,
  pendingId,
  notice,
  onSearch,
  onFilter,
  onToggleDetails,
  onRequestStatusChange,
}: {
  quotes: QuoteRequest[];
  filteredQuotes: QuoteRequest[];
  isLoading: boolean;
  error: boolean;
  search: string;
  filter: QuoteFilter;
  expandedQuoteId: string | null;
  pendingId: string | undefined;
  notice: string | null;
  onSearch: (value: string) => void;
  onFilter: (value: QuoteFilter) => void;
  onToggleDetails: (id: string) => void;
  onRequestStatusChange: (quote: QuoteRequest) => void;
}) {
  return (
    <section aria-labelledby="requests-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="requests-title" className="font-display text-2xl font-bold">Demandes de devis</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Chargement…" : `${quotes.length} demande(s) · ${quotes.filter((quote) => quote.status !== "traité").length} à traiter`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Rechercher un nom, un e-mail, un téléphone…"
          aria-label="Rechercher une demande"
          className="w-full lg:max-w-md"
        />
        <div className="flex flex-wrap gap-2" aria-label="Filtrer les demandes">
          {QUOTE_FILTERS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={filter === item.value ? "default" : "outline"}
              onClick={() => onFilter(item.value)}
            >
              {item.label} ({item.value === "tous" ? quotes.length : quotes.filter((quote) => quote.status === item.value).length})
            </Button>
          ))}
        </div>
      </div>

      {notice && <p role="status" className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm font-medium">{notice}</p>}
      {isLoading && <LoadingMessage>Chargement des demandes…</LoadingMessage>}
      {error && <p role="alert" className="mt-6 text-sm text-destructive">Impossible d’afficher les demandes. Vérifiez vos droits d’accès.</p>}
      {!isLoading && !error && filteredQuotes.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Aucune demande ne correspond à ces critères.</p>}

      <div className="mt-6 space-y-3">
        {filteredQuotes.map((quote) => {
          const expanded = expandedQuoteId === quote.id;
          const pending = pendingId === quote.id;
          return (
            <article key={quote.id} className="rounded-lg border border-border bg-card p-4 shadow-card sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{quote.full_name}</h3>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", quote.status === "traité" ? "bg-secondary text-foreground" : "bg-accent text-accent-foreground")}>{quote.status === "traité" ? "Traitée" : "À traiter"}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{dateFmt.format(new Date(quote.created_at))}{quote.service_type ? ` · ${quote.service_type}` : ""}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline"><a href={`tel:${quote.phone.replace(/\s/g, "")}`}><Phone aria-hidden="true" />Appeler</a></Button>
                  <Button asChild size="sm" variant="outline"><a href={`mailto:${quote.email}`}><Mail aria-hidden="true" />Écrire</a></Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => onToggleDetails(quote.id)} aria-expanded={expanded}>
                    {expanded ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                    {expanded ? "Masquer" : "Détails"}
                  </Button>
                  <Button type="button" size="sm" disabled={pending} onClick={() => onRequestStatusChange(quote)}>
                    {pending ? "Enregistrement…" : quote.status === "traité" ? "Rouvrir" : "Marquer traitée"}
                  </Button>
                </div>
              </div>

              {expanded && (
                <div className="mt-5 border-t border-border pt-5">
                  <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <QuoteField label="E-mail" value={quote.email} />
                    <QuoteField label="Téléphone" value={quote.phone} />
                    <QuoteField label="Adresse" value={quote.address} />
                    <QuoteField label="Prestation" value={quote.service_type} />
                    <QuoteField label="Fréquence" value={quote.frequency} />
                    <QuoteField label="Type de bien / surface" value={`${quote.property_type ?? "—"}${quote.surface ? ` · ${quote.surface} m²` : ""}`} />
                  </dl>
                  {quote.message && <p className="mt-4 whitespace-pre-line rounded-lg bg-secondary/60 p-4 text-sm">{quote.message}</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function QuoteField({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium">{value || "—"}</dd></div>;
}

function ReviewsTab({
  reviews,
  filteredReviews,
  isLoading,
  error,
  filter,
  pendingId,
  notice,
  onFilter,
  onRequestStatusChange,
}: {
  reviews: ReviewSubmission[];
  filteredReviews: ReviewSubmission[];
  isLoading: boolean;
  error: boolean;
  filter: ReviewFilter;
  pendingId: string | undefined;
  notice: string | null;
  onFilter: (filter: ReviewFilter) => void;
  onRequestStatusChange: (review: ReviewSubmission, status: ReviewStatus) => void;
}) {
  return (
    <section aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="font-display text-2xl font-bold">Avis reçus depuis le site</h2>
      <p className="mt-1 text-sm text-muted-foreground">{isLoading ? "Chargement…" : `${reviews.length} avis · ${reviews.filter((review) => review.status === "nouveau").length} en attente · ${reviews.filter((review) => review.status === "publié").length} publié(s)`}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {REVIEW_FILTERS.map((item) => (
          <Button key={item.value} type="button" size="sm" variant={filter === item.value ? "default" : "outline"} onClick={() => onFilter(item.value)}>
            {item.label} ({item.value === "tous" ? reviews.length : reviews.filter((review) => review.status === item.value).length})
          </Button>
        ))}
      </div>
      {notice && <p role="status" className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm font-medium">{notice}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-destructive">Impossible d’afficher les avis.</p>}
      {!isLoading && filteredReviews.length === 0 && <p className="mt-6 text-sm text-muted-foreground">Aucun avis dans cette catégorie.</p>}
      <div className="mt-6 space-y-4">
        {filteredReviews.map((review) => {
          const pending = pendingId === review.id;
          return (
            <article key={review.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold">{review.author_name}{review.city ? ` · ${review.city}` : ""}</h3>
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", review.status === "publié" ? "bg-accent text-accent-foreground" : review.status === "refusé" ? "bg-destructive/15 text-destructive" : "bg-secondary text-foreground")}>{review.status === "publié" ? "Publié" : review.status === "refusé" ? "Refusé" : "En attente"}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3"><Stars rating={review.rating} /><span className="text-xs text-muted-foreground">{dateFmt.format(new Date(review.created_at))}{review.service_type ? ` · ${review.service_type}` : ""}{review.email ? ` · ${review.email}` : ""}</span></div>
              <p className="mt-4 whitespace-pre-line rounded-lg bg-secondary/60 p-4 text-sm">{review.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {review.status !== "publié" && <Button type="button" size="sm" disabled={pending} onClick={() => onRequestStatusChange(review, "publié")}>{pending ? "Enregistrement…" : "Publier"}</Button>}
                {review.status === "publié" && <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => onRequestStatusChange(review, "nouveau")}>Dépublier</Button>}
                {review.status !== "refusé" && <Button type="button" size="sm" variant="outline" className="border-destructive/40 text-destructive hover:text-destructive" disabled={pending} onClick={() => onRequestStatusChange(review, "refusé")}>Refuser</Button>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SeoTab({ inspectedSlug, onInspect }: { inspectedSlug: string | null; onInspect: (slug: string) => void }) {
  return (
    <section aria-labelledby="seo-title">
      <h2 id="seo-title" className="sr-only">SEO et Search Console</h2>
      <div className="[&>div]:mt-0">
        <Suspense fallback={<LoadingMessage>Chargement des outils Google…</LoadingMessage>}><SearchConsoleStats /></Suspense>
      </div>
      <div className="mt-12">
        <h2 className="font-display text-2xl font-bold">Suivi Google par ville</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Ouvrez la page publique, contrôlez son indexation et consultez les recherches qui l’ont affichée.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {zones.map((zone) => {
            const pageUrl = `${SITE_URL}/zones/${zone.slug}`;
            return (
              <article key={zone.slug} className="rounded-lg border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-base font-bold">{zone.name}{zone.postalCode ? ` (${zone.postalCode})` : ""}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline"><a href={pageUrl} target="_blank" rel="noopener noreferrer">Voir la page<ExternalLink aria-hidden="true" /></a></Button>
                  <Button size="sm" type="button" onClick={() => {
                    navigator.clipboard?.writeText(pageUrl).catch(() => undefined);
                    window.open(`https://search.google.com/search-console?resource_id=${GSC_RESOURCE}`, "_blank", "noopener,noreferrer");
                    onInspect(zone.slug);
                  }}>{inspectedSlug === zone.slug ? "Adresse copiée" : "Vérifier dans Google"}</Button>
                  <Button asChild size="sm" variant="outline"><a href={`https://search.google.com/search-console/performance/search-analytics?resource_id=${GSC_RESOURCE}&page=${encodeURIComponent(`!${pageUrl}`)}`} target="_blank" rel="noopener noreferrer">Recherches Google</a></Button>
                  <Button asChild size="sm" variant="outline"><a href={`https://www.google.com/search?q=${encodeURIComponent(`nettoyage ${zone.name}`)}`} target="_blank" rel="noopener noreferrer">Tester la recherche</a></Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LoadingMessage({ children }: { children: string }) {
  return <p className="mt-6 text-sm text-muted-foreground">{children}</p>;
}