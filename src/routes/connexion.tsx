import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/site-blocks";

const OWNER_EMAIL = "contact@purespacenett.com";

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

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Le service de connexion ne répond pas dans le délai prévu.")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const finishGoogleSignIn = async (user: { email?: string | null } | null) => {
      if (!user || !active) return;
      if (user.email?.toLowerCase() !== OWNER_EMAIL) {
        await supabase.auth.signOut();
        if (active) setError("Cette interface est réservée au compte propriétaire du site.");
        return;
      }
      await navigate({ to: "/admin", search: { onglet: "tableau-de-bord" }, replace: true });
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        if (active) setError("Impossible de vérifier la session Google. Réessayez.");
        return;
      }
      void finishGoogleSignIn(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void finishGoogleSignIn(session.user);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.origin + "/connexion" },
        }),
      );
      if (error) {
        setError(
          error.message.toLowerCase().includes("provider is not enabled")
            ? "La connexion Google n’est pas encore activée dans Supabase Auth."
            : "Connexion Google impossible : " + error.message,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inattendue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== OWNER_EMAIL) {
      setError("Cette interface est réservée au compte propriétaire du site.");
      setInfo(null);
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "signup") {
        const { error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin + "/connexion" },
          }),
        );

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

      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
      );

      if (error) {
        setError(
          error.message.toLowerCase().includes("invalid login credentials")
            ? "E-mail ou mot de passe incorrect."
            : "Connexion impossible : " + error.message,
        );
        return;
      }

      if (data.user?.email?.toLowerCase() !== OWNER_EMAIL) {
        await supabase.auth.signOut();
        setError("Cette interface est réservée au compte propriétaire du site.");
        return;
      }

      await navigate({ to: "/admin", search: { onglet: "tableau-de-bord" } });
    } catch (error) {
      console.error("[Connexion] Erreur d'authentification", error);
      const message =
        error instanceof Error ? error.message : "Erreur inattendue lors de la connexion.";
      setError(
        message.includes("Missing Supabase environment")
          ? "La connexion Supabase n'est pas correctement configurée sur le site."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  const field =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/40";

  return (
    <Section className="max-w-md">
      <h1 className="font-display text-2xl font-bold">Espace privé</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Connectez-vous pour consulter les demandes de devis reçues.
      </p>
      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              transform="translate(0 4)"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.66 5.94c4.47-4.13 7.12-10.2 7.12-17.59Z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
              transform="translate(0 4)"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.66-5.94c-2.13 1.43-4.85 2.28-8.24 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            />
          </svg>
          {loading ? "Redirection vers Google…" : "Continuer avec Google"}
        </button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          ou avec votre e-mail
          <span className="h-px flex-1 bg-border" />
        </div>
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
          {loading ? "Patientez…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}
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
