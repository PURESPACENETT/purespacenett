import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Mail, MessageCircle, Phone } from "lucide-react";
import { business, whatsappHref } from "@/content/business";
import { trackEvent } from "@/lib/analytics";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-14 sm:py-16 ${className}`}>
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}

export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm text-foreground/90">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/25 text-accent-foreground">
            <Check className="size-3.5" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Bouton WhatsApp Business, message pré-rempli avec le contexte de la page. */
export function WhatsAppButton({
  subject,
  label = "Écrire sur WhatsApp",
  variant = "solid",
  className = "",
}: {
  subject: string;
  label?: string;
  variant?: "solid" | "outline" | "dark";
  className?: string;
}) {
  const styles =
    variant === "solid"
      ? "bg-[#25D366] text-[#0b3d24] hover:opacity-90"
      : variant === "dark"
        ? "border border-white/25 text-current hover:bg-white/10"
        : "border border-border bg-card text-foreground hover:border-accent";

  return (
    <a
      href={whatsappHref(subject)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent("clic_whatsapp", { source: subject })}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${styles} ${className}`}
    >
      <MessageCircle className="size-4" />
      {label}
    </a>
  );
}

export function CallButtons({ subject }: { subject: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={business.phoneHref}
        onClick={() => trackEvent("appel_telephone", { source: subject })}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Phone className="size-4" />
        Appeler le {business.phone}
      </a>
      <WhatsAppButton subject={subject} />
      <Link
        to="/sous-traitance"
        onClick={() => trackEvent("clic_devis", { source: subject })}
        className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
      >
        <Mail className="size-4" />
        Demander un devis gratuit
      </Link>
    </div>
  );
}

export function QuoteBanner({ subject }: { subject: string }) {
  return (
    <Section>
      <div className="rounded-3xl bg-ink px-6 py-10 text-ink-foreground sm:px-12">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Un devis gratuit, une réponse sous 24 heures
            </h2>
            <p className="mt-3 text-sm text-ink-foreground/75">
              Décrivez-nous votre besoin : surface, fréquence souhaitée, contraintes d'horaires.
              Nous vous rappelons pour caler une visite ou vous envoyer un chiffrage directement.
            </p>
            <p className="mt-3 text-sm text-ink-foreground/75">{business.hours}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/sous-traitance"
              onClick={() => trackEvent("clic_devis", { source: subject })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              <Mail className="size-4" />
              Demander un devis en ligne
            </Link>
            <a
              href={business.phoneHref}
              onClick={() => trackEvent("appel_telephone", { source: subject })}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold"
            >
              <Phone className="size-4" />
              {business.phone}
            </a>
            <WhatsAppButton
              subject={subject}
              variant="dark"
              label="Écrire sur WhatsApp"
              className="justify-center"
            />
            <Link
              to="/contact"
              className="text-center text-xs text-ink-foreground/60 underline underline-offset-4"
            >
              Ou nous écrire via la page contact
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; to?: string; params?: Record<string, string> }[];
}) {
  return (
    <nav aria-label="Fil d'ariane" className="mx-auto max-w-6xl px-4 pt-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {item.to === "/" ? (
              <Link to="/" className="hover:text-foreground hover:underline">
                {item.label}
              </Link>
            ) : item.to === "/services" ? (
              <Link to="/services" className="hover:text-foreground hover:underline">
                {item.label}
              </Link>
            ) : item.to === "/zones" ? (
              <Link to="/zones" className="hover:text-foreground hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function FaqList({ faq }: { faq: { q: string; a: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {faq.map((item) => (
        <div key={item.q} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-base font-semibold">{item.q}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
        </div>
      ))}
    </div>
  );
}
