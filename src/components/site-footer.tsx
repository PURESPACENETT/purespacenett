import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { business } from "@/content/business";
import { services } from "@/content/services";
import { zones } from "@/content/zones";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-lg font-bold">{business.name}</p>
          <p className="mt-2 text-sm text-ink-foreground/70">{business.tagline}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>
              <a href={business.phoneHref} className="inline-flex items-center gap-2 hover:underline">
                <Phone className="size-4 text-accent" />
                {business.phone}
              </a>
            </li>
            <li>
              <a href={business.emailHref} className="inline-flex items-center gap-2 hover:underline">
                <Mail className="size-4 text-accent" />
                {business.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2 text-ink-foreground/70">
              <MapPin className="size-4 text-accent" />
              {business.city} ({business.postalCode})
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-accent">
            Nos prestations
          </p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="text-ink-foreground/80 hover:text-ink-foreground hover:underline"
                >
                  {s.navName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-accent">
            Zones desservies
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {zones.map((z) => (
              <li key={z.slug}>
                <Link
                  to="/zones/$slug"
                  params={{ slug: z.slug }}
                  className="text-ink-foreground/80 hover:text-ink-foreground hover:underline"
                >
                  {z.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-ink-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name} — Entreprise de nettoyage en{" "}
            {business.region}.
          </p>
          <p>{business.hours}</p>
        </div>
      </div>
    </footer>
  );
}
