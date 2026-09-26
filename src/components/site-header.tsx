import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { business } from "@/content/business";
import { siteImages } from "@/lib/site-images";
import { trackEvent } from "@/lib/analytics";

const nav = [
  { to: "/services", label: "Services" },
  { to: "/zones", label: "Zones desservies" },
  { to: "/tarifs", label: "Tarifs" },
  { to: "/sous-traitance", label: "Demande de devis / sous-traitance" },
  { to: "/avis", label: "Avis clients" },
  { to: "/faq", label: "FAQ" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img
            src={siteImages.logo}
            alt="Logo PURE SPACE NETT"
            width={44}
            height={44}
            loading="eager"
            decoding="async"
            className="size-11 rounded-md object-cover"
          />
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold tracking-tight">
              {business.name}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Nettoyage professionnel · IDF
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/sous-traitance"
            onClick={() => trackEvent("clic_devis", { source: "header" })}
            className="hidden items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Demander un devis
          </Link>
          <a
            href={business.phoneHref}
            onClick={() => trackEvent("appel_telephone", { source: "header" })}
            className="hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 md:inline-flex"
          >
            <Phone className="size-4" />
            {business.phone}
          </a>
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-lg border border-border lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border/60 py-3 text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={business.phoneHref}
            onClick={() => trackEvent("appel_telephone", { source: "menu_mobile" })}
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
          >
            <Phone className="size-4" />
            {business.phone}
          </a>
        </nav>
      )}
    </header>
  );
}
