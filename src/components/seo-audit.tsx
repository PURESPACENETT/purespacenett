import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { analyzeSeoReport, type SeoAuditResult, type SeoIssue } from "@/lib/seo-audit.functions";

const MAX_BYTES = 15 * 1024 * 1024;
const TEXT_EXT = [".csv", ".tsv", ".txt", ".json", ".xml", ".md", ".log", ".html"];

const priorityStyle: Record<SeoIssue["priorite"], { label: string; className: string }> = {
  haute: {
    label: "Priorité haute",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  moyenne: {
    label: "Priorité moyenne",
    className: "bg-accent/15 text-accent-foreground border-accent/40",
  },
  normal: {
    label: "Sans danger",
    className: "bg-secondary text-foreground border-border",
  },
};

const priorityOrder: SeoIssue["priorite"][] = ["haute", "moyenne", "normal"];

async function readReportFile(file: File): Promise<string> {
  const lower = file.name.toLowerCase();

  if (lower.endsWith(".zip")) {
    const { unzipSync, strFromU8 } = await import("fflate");
    const buffer = new Uint8Array(await file.arrayBuffer());
    const entries = unzipSync(buffer);
    const parts: string[] = [];
    for (const [name, bytes] of Object.entries(entries)) {
      const isText = TEXT_EXT.some((ext) => name.toLowerCase().endsWith(ext));
      if (!isText || bytes.length === 0) continue;
      parts.push(`===== ${name} =====\n${strFromU8(bytes).slice(0, 40_000)}`);
    }
    if (parts.length === 0) {
      throw new Error("Cette archive ne contient aucun tableau lisible (fichiers .csv attendus).");
    }
    return parts.join("\n\n");
  }

  if (TEXT_EXT.some((ext) => lower.endsWith(ext))) {
    return await file.text();
  }

  throw new Error(
    "Format non pris en charge. Déposez l'archive .zip exportée depuis Search Console, ou un fichier .csv, .json ou .txt.",
  );
}

export function SeoAudit() {
  const analyze = useServerFn(analyzeSeoReport);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const mutation = useMutation<SeoAuditResult, Error, File>({
    mutationFn: async (file) => {
      const content = await readReportFile(file);
      return await analyze({ data: { filename: file.name, content } });
    },
  });

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setReadError(null);
    mutation.reset();
    if (file.size > MAX_BYTES) {
      setFileName(file.name);
      setReadError("Fichier trop volumineux (15 Mo maximum).");
      return;
    }
    setFileName(file.name);
    mutation.mutate(file, {
      onError: (error) => setReadError(error.message),
    });
  };

  const result = mutation.data;
  const sorted = result
    ? [...result.problemes].sort(
        (a, b) => priorityOrder.indexOf(a.priorite) - priorityOrder.indexOf(b.priorite),
      )
    : [];

  return (
    <div className="mt-14">
      <h2 className="font-display text-2xl font-bold">Analyse d'un rapport Google / SEO</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Déposez l'export de Google Search Console (archive .zip) ou un tableau .csv : vous recevez la
        liste des problèmes expliqués simplement et classés par ordre d'importance.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`mt-6 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-accent bg-accent/5" : "border-border bg-card"
        }`}
      >
        <p className="text-sm font-semibold">Glissez votre rapport ici</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Formats acceptés : .zip (export Search Console), .csv, .tsv, .json, .txt — 15 Mo maximum
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={mutation.isPending}
          className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {mutation.isPending ? "Analyse en cours…" : "Choisir un fichier"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.csv,.tsv,.json,.txt,.xml,.md,.log,.html"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {fileName && (
          <p className="mt-3 text-xs text-muted-foreground">Fichier sélectionné : {fileName}</p>
        )}
      </div>

      {mutation.isPending && (
        <p className="mt-4 text-sm text-muted-foreground">
          Lecture du rapport et rédaction des recommandations… cela peut prendre une à deux minutes.
        </p>
      )}

      {readError && <p className="mt-4 text-sm text-destructive">{readError}</p>}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-bold">État général</h3>
            <p className="mt-2 text-sm font-semibold text-accent">{result.etat_general}</p>
            <p className="mt-3 whitespace-pre-line text-sm">{result.synthese}</p>
          </div>

          {sorted.length > 0 && (
            <div className="space-y-4">
              {sorted.map((issue, index) => {
                const style = priorityStyle[issue.priorite] ?? priorityStyle.normal;
                return (
                  <article
                    key={`${issue.titre}-${index}`}
                    className="rounded-2xl border border-border bg-card p-5 shadow-card"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-base font-bold">{issue.titre}</h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.className}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {issue.categorie}
                    </p>
                    <p className="mt-3 text-sm font-medium">{issue.constat}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{issue.explication}</p>
                    <p className="mt-3 rounded-xl bg-secondary/60 p-4 text-sm">
                      <span className="font-semibold">À faire : </span>
                      {issue.action}
                    </p>
                    {issue.pages.length > 0 && (
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {issue.pages.slice(0, 8).map((page) => (
                          <li key={page} className="break-all">
                            {page}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {result.prochaines_etapes.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-display text-lg font-bold">Par quoi commencer</h3>
              <ol className="mt-3 space-y-2 text-sm">
                {result.prochaines_etapes.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-display font-bold text-accent">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
