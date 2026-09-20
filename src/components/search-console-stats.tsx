import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getSearchConsoleReport,
  type SearchConsoleReport,
  type SearchRow,
} from "@/lib/search-console.functions";

const PERIODES = [
  { jours: 7, label: "7 jours" },
  { jours: 28, label: "28 jours" },
  { jours: 90, label: "3 mois" },
];

const nb = new Intl.NumberFormat("fr-FR");
const pct = (v: number) => `${(v * 100).toFixed(1).replace(".", ",")} %`;
const pos = (v: number) => (v ? v.toFixed(1).replace(".", ",") : "—");
const jourFmt = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");

function RowsTable({ rows, colonne }: { rows: SearchRow[]; colonne: string }) {
  if (rows.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">Aucune donnée sur cette période.</p>;
  }
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-3 font-semibold">{colonne}</th>
            <th className="py-2 pr-3 text-right font-semibold">Affichages</th>
            <th className="py-2 pr-3 text-right font-semibold">Clics</th>
            <th className="py-2 pr-3 text-right font-semibold">Taux de clics</th>
            <th className="py-2 text-right font-semibold">Position</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cle} className="border-t border-border/70">
              <td className="py-2 pr-3 break-words">{r.cle}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{nb.format(r.impressions)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{nb.format(r.clics)}</td>
              <td className="py-2 pr-3 text-right tabular-nums">{pct(r.ctr)}</td>
              <td className="py-2 text-right tabular-nums">{pos(r.position)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function SearchConsoleStats() {
  const fetchReport = useServerFn(getSearchConsoleReport);
  const [jours, setJours] = useState(28);
  const [villeOuverte, setVilleOuverte] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<SearchConsoleReport>({
    queryKey: ["search-console", jours],
    queryFn: () => fetchReport({ data: { jours } }),
    staleTime: 30 * 60 * 1000,
  });

  return (
    <div className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Affichages Google et recherches</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Combien de fois votre site est apparu dans Google, sur quelles recherches exactes, et la
            part de personnes qui ont cliqué — au total et page de ville par page de ville.
          </p>
        </div>
        <div className="flex gap-2">
          {PERIODES.map((p) => (
            <button
              key={p.jours}
              type="button"
              onClick={() => setJours(p.jours)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                jours === p.jours
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:border-accent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="mt-6 text-sm text-muted-foreground">Lecture des statistiques Google…</p>
      )}

      {error && (
        <p className="mt-6 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Les statistiques Google ne sont pas accessibles pour le moment."}
        </p>
      )}

      {data && (
        <>
          <p className="mt-5 text-xs text-muted-foreground">
            Période du {jourFmt(data.debut)} au {jourFmt(data.fin)} — Google publie ses chiffres avec
            2 à 3 jours de décalage.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Affichages" value={nb.format(data.total.impressions)} />
            <Stat label="Clics" value={nb.format(data.total.clics)} />
            <Stat label="Taux de clics" value={pct(data.total.ctr)} />
            <Stat label="Position moyenne" value={pos(data.total.position)} />
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-lg font-bold">Recherches exactes sur tout le site</h3>
            <RowsTable rows={data.requetes} colonne="Recherche" />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-lg font-bold">Pages les plus affichées</h3>
            <RowsTable rows={data.pages} colonne="Page" />
          </div>

          <h3 className="mt-10 font-display text-lg font-bold">Détail par ville</h3>
          <div className="mt-4 space-y-3">
            {data.villes.map((v) => {
              const ouvert = villeOuverte === v.slug;
              return (
                <article
                  key={v.slug}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-display text-base font-bold">{v.ville}</h4>
                    <button
                      type="button"
                      onClick={() => setVilleOuverte(ouvert ? null : v.slug)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-accent"
                    >
                      {ouvert ? "Masquer les recherches" : "Voir les recherches"}
                    </button>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Affichages</dt>
                      <dd className="font-semibold tabular-nums">{nb.format(v.impressions)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Clics</dt>
                      <dd className="font-semibold tabular-nums">{nb.format(v.clics)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Taux de clics</dt>
                      <dd className="font-semibold tabular-nums">{pct(v.ctr)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Position moyenne</dt>
                      <dd className="font-semibold tabular-nums">{pos(v.position)}</dd>
                    </div>
                  </dl>
                  {ouvert && <RowsTable rows={v.requetes} colonne="Recherche" />}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
