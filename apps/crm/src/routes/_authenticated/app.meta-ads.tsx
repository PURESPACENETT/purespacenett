import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3 } from "lucide-react";

import { listMetaAdsPerformance } from "@/lib/meta-ads.functions";

export const Route = createFileRoute("/_authenticated/app/meta-ads")({
  head: () => ({
    meta: [
      { title: "Meta Ads — PURE SPACE NETT" },
      { name: "description", content: "Dépenses, chiffre d’affaires CRM et ROAS Meta Ads." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MetaAdsPage,
});

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const ratio = new Intl.NumberFormat("fr-FR", {
  style: "decimal",
  maximumFractionDigits: 2,
});

function MetaAdsPage() {
  const fetchPerformance = useServerFn(listMetaAdsPerformance);
  const performanceQuery = useQuery({
    queryKey: ["meta-ads-performance"],
    queryFn: () => fetchPerformance(),
  });
  const performance = performanceQuery.data;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          <h1 className="text-2xl text-foreground">Meta Ads</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Dépenses et chiffre d’affaires réellement signé ou facturé, sur les 30 derniers jours.
          Les estimations de devis sont exclues.
        </p>
      </header>

      {performanceQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement des performances…</p>
      ) : performanceQuery.isError ? (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-5 text-sm text-destructive">
          Les performances Meta Ads ne sont pas disponibles pour le moment.
        </div>
      ) : performance ? (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Chiffre d’affaires réel HT</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{euro.format(performance.totals.revenue)}</p>
            </article>
            <article className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Dépenses publicitaires</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{euro.format(performance.totals.spend)}</p>
            </article>
            <article className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">ROAS CRM</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {performance.totals.roas === null ? "—" : `${ratio.format(performance.totals.roas)}×`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">CA réel HT ÷ dépenses Meta</p>
            </article>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border p-5">
              <h2 className="text-base text-foreground">Détail quotidien</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Le ROAS agrégé est calculé sur les montants additionnés, pas par moyenne des ratios journaliers.
              </p>
            </div>
            {performance.days.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                Aucune dépense ou vente CRM attribuée à Meta sur cette période. Une vente ne sera incluse qu’après saisie de son montant réel dans sa demande CRM.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-medium">Date</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">CA réel HT</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Dépenses</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.days.map((day) => (
                      <tr key={day.date} className="border-t border-border">
                        <td className="px-5 py-3 text-foreground">
                          {new Date(`${day.date}T12:00:00`).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-5 py-3 text-right text-foreground">{euro.format(day.revenue)}</td>
                        <td className="px-5 py-3 text-right text-foreground">{euro.format(day.spend)}</td>
                        <td className="px-5 py-3 text-right text-foreground">
                          {day.roas === null ? "—" : `${ratio.format(day.roas)}×`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-border bg-muted/30 font-semibold text-foreground">
                    <tr>
                      <th scope="row" className="px-5 py-3">Total 30 jours</th>
                      <td className="px-5 py-3 text-right">{euro.format(performance.totals.revenue)}</td>
                      <td className="px-5 py-3 text-right">{euro.format(performance.totals.spend)}</td>
                      <td className="px-5 py-3 text-right">
                        {performance.totals.roas === null ? "—" : `${ratio.format(performance.totals.roas)}×`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
