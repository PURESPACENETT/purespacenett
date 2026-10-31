import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Espace interne — PURE SPACE NETT" },
      {
        name: "description",
        content: "Connexion à l'espace de suivi des demandes de PURE SPACE NETT.",
      },
      { property: "og:title", content: "Espace interne — PURE SPACE NETT" },
      {
        property: "og:description",
        content: "Connexion à l'espace de suivi des demandes de PURE SPACE NETT.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (active && role?.role === "admin") {
        navigate({ to: "/app", replace: true });
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Email de réinitialisation envoyé. Vérifiez votre boîte mail.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Connexion impossible");
        const { data: role, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .maybeSingle();
        if (roleError || role?.role !== "admin") {
          await supabase.auth.signOut();
          throw new Error("Ce compte n'a pas d'accès CRM actif.");
        }
        navigate({ to: "/app", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Connexion impossible");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-5 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-7 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <Lock className="size-4" />
          <span className="text-xs font-600 uppercase tracking-wide">Espace interne</span>
        </div>
        <h1 className="mt-3 text-xl text-foreground">PURE SPACE NETT</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Connectez-vous pour suivre vos demandes."
            : "Recevez un lien pour réinitialiser votre mot de passe."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy
              ? "..."
              : mode === "signin"
                ? "Se connecter"
              : "Envoyer le lien"}
          </Button>
        </form>

        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="mt-3 w-full text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Retour à la connexion
          </button>
        )}

        <Link
          to="/"
          className="mt-6 block text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Retour au formulaire public
        </Link>
      </div>
    </div>
  );
}
