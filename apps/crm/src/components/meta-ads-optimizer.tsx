import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateMetaRecommendations,
  getMetaAdsOptimizer,
  saveMetaAdAccount,
  setMetaRecommendationStatus,
  type MetaAdAccountRow,
} from "@/lib/meta-ads.functions";
import { normalizeMetaAccountId, type ManualRecommendationStatus } from "@/lib/meta-ads-shared";

const OPTIMIZER_QUERY_KEY = ["meta-ads-optimizer"] as const;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Une erreur est survenue.";
}

export function MetaAdsOptimizer() {
  const queryClient = useQueryClient();
  const fetchOptimizer = useServerFn(getMetaAdsOptimizer);
  const saveAccount = useServerFn(saveMetaAdAccount);
  const generate = useServerFn(generateMetaRecommendations);
  const setStatus = useServerFn(setMetaRecommendationStatus);

  const optimizerQuery = useQuery({ queryKey: OPTIMIZER_QUERY_KEY, queryFn: () => fetchOptimizer() });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: OPTIMIZER_QUERY_KEY });

  const [accountId, setAccountId] = useState("");
  const [accountName, setAccountName] = useState("");

  const createAccount = useMutation({
    mutationFn: () =>
      saveAccount({ data: { mode: "create", meta_account_id: accountId, name: accountName, is_active: true } }),
    onSuccess: () => {
      toast.success("Compte publicitaire enregistré.");
      setAccountId("");
      setAccountName("");
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const toggleAccount = useMutation({
    mutationFn: (account: MetaAdAccountRow) =>
      saveAccount({ data: { mode: "update", id: account.id, name: account.name, is_active: !account.is_active } }),
    onSuccess: () => void invalidate(),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const generateRecommendations = useMutation({
    mutationFn: () => generate(),
    onSuccess: (result) => {
      const generatedMessage =
        result.generated > 0
          ? `${result.generated} recommandation(s) générée(s).`
          : "Aucune nouvelle recommandation sur les 14 derniers jours.";
      toast.success(
        result.expired > 0
          ? `${generatedMessage} ${result.expired} recommandation(s) de plus de 14 jours expirée(s).`
          : generatedMessage,
      );
      void invalidate();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const decide = useMutation({
    mutationFn: (payload: { id: string; status: ManualRecommendationStatus }) => setStatus({ data: payload }),
    onSuccess: () => void invalidate(),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const accountIdValid = normalizeMetaAccountId(accountId) !== null;
  const canCreate = accountIdValid && accountName.trim().length >= 2 && !createAccount.isPending;

  function onCreate(event: FormEvent) {
    event.preventDefault();
    if (canCreate) createAccount.mutate();
  }

  if (optimizerQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement de l’optimiseur…</p>;
  }
  if (optimizerQuery.isError || !optimizerQuery.data) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-5 text-sm text-destructive">
        {errorMessage(optimizerQuery.error)}
      </div>
    );
  }

  const { accounts, recommendations } = optimizerQuery.data;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="size-5 text-primary" />
              <h2 className="text-base text-foreground">Recommandations</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Suggestions consultatives calculées sur 14 jours. Aucune modification n’est envoyée à Meta : marquez
              « Appliquée » une fois le changement fait manuellement dans le Gestionnaire de publicités. Les
              recommandations non traitées expirent après 14 jours.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={generateRecommendations.isPending}
            onClick={() => generateRecommendations.mutate()}
          >
            {generateRecommendations.isPending ? "Analyse…" : "Analyser"}
          </Button>
        </div>

        {recommendations.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucune recommandation en attente.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recommendations.map((recommendation) => (
              <li key={recommendation.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <Badge variant={recommendation.priority === "high" ? "destructive" : "secondary"}>
                    {recommendation.priority === "high" ? "Priorité haute" : "Priorité moyenne"}
                  </Badge>
                  <p className="font-medium text-foreground">{recommendation.title}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{recommendation.rationale}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={decide.isPending}
                    onClick={() => decide.mutate({ id: recommendation.id, status: "applied" })}
                  >
                    Appliquée manuellement
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={decide.isPending}
                    onClick={() => decide.mutate({ id: recommendation.id, status: "dismissed" })}
                  >
                    Ignorer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base text-foreground">Comptes publicitaires</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Référentiel local des comptes Meta. La synchronisation reste gérée par la fonction planifiée.
        </p>

        {accounts.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Aucun compte enregistré.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{account.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {account.meta_account_id} · {account.currency} · dernière synchro{" "}
                    {account.last_synced_at ? new Date(account.last_synced_at).toLocaleString("fr-FR") : "—"}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={toggleAccount.isPending}
                  onClick={() => toggleAccount.mutate(account)}
                >
                  {account.is_active ? "Désactiver" : "Activer"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form className="mt-4 space-y-3 border-t border-border pt-4" onSubmit={onCreate}>
          <div className="space-y-1">
            <Label htmlFor="meta-account-id">Identifiant du compte</Label>
            <Input
              id="meta-account-id"
              placeholder="act_123456789"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              aria-invalid={accountId.length > 0 && !accountIdValid}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta-account-name">Nom</Label>
            <Input
              id="meta-account-name"
              placeholder="PURE SPACE NETT — Meta Ads"
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={!canCreate}>
            {createAccount.isPending ? "Enregistrement…" : "Ajouter le compte"}
          </Button>
        </form>
      </section>
    </div>
  );
}
