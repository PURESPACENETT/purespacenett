import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/site-blocks";

export const Route = createFileRoute("/connexion")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Connexion — PURE SPACE NETT" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/connexion` },
      });
      setLoading(false);
      if (error) {
        setError("Création impossible : " + error.message);
        return;
      }
      setMode("signin");
      setInfo(
        "Compte créé. Ouvrez l'e-mail de confirmation que nous venons de vous envoyer, puis connectez-vous.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-mail ou mot de passe incorrect.");
      return;
    }
    navigate({ to: "/admin" });
  };

  const field =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/40";

  return (
    <Section className="max-w-md">
      <h1 className="font-display text-2xl font-bold">Espace privé</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Connectez-vous pour consulter les demandes de devis reçues.
      </p>
      <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <label className="block text-sm font-medium">
          E-mail
          <input
            className={field}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Mot de passe
          <input
            className={field}
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading
            ? "Patientez…"
            : mode === "signup"
              ? "Créer mon compte"
              : "Se connecter"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError(null);
            setInfo(null);
          }}
          className="mt-3 w-full text-xs text-muted-foreground underline underline-offset-4"
        >
          {mode === "signup"
            ? "J'ai déjà un compte — me connecter"
            : "Première visite ? Créer mon compte"}
        </button>
        {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
        {info && <p className="mt-3 text-xs text-primary">{info}</p>}
      </form>
    </Section>
  );
}
