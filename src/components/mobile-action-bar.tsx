import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { business, whatsappHref } from "@/content/business";
import { trackEvent } from "@/lib/analytics";

export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 p-2 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur sm:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        <a
          href={business.phoneHref}
          onClick={() => trackEvent("appel_telephone", { source: "barre_mobile" })}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-2 text-xs font-semibold text-primary-foreground"
          aria-label={`Appeler ${business.phone}`}
        >
          <Phone className="size-4" />
          Appeler
        </a>
        <a
          href={whatsappHref("demande de devis")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("clic_whatsapp", { source: "barre_mobile" })}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-2 text-xs font-semibold text-[#0b3d24]"
          aria-label="Écrire sur WhatsApp"
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </a>
        <Link
          to="/sous-traitance"
          onClick={() => trackEvent("clic_devis", { source: "barre_mobile" })}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-primary/25 bg-card px-2 text-xs font-semibold text-primary"
        >
          <Mail className="size-4" />
          Devis gratuit
        </Link>
      </div>
    </div>
  );
}
