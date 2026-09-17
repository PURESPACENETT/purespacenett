import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getService, services } from "@/content/services";
import { zones } from "@/content/zones";
import {
  Breadcrumbs,
  CallButtons,
  CheckList,
  Eyebrow,
  FaqList,
  QuoteBanner,
  Section,
} from "@/components/site-blocks";
import { breadcrumbJsonLd, faqJsonLd, pageMeta, serviceJsonLd } from "@/lib/seo";
import { getServiceImage } from "@/lib/site-images";

export const Route = createFileRoute("/services/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const service = getService(params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Prestation introuvable" }, { name: "robots", content: "noindex" }],
      };
    }
    const s = loaderData.service;
    const path = `/services/${params.slug}`;
    return {
      meta: pageMeta({ title: s.title, description: s.description, path }),
      links: [{ rel: "canonical", href: path }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(serviceJsonLd(s.name, s.description, path)),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Accueil", item: "/" },
              { name: "Services", item: "/services" },
              { name: s.name, item: path },
            ]),
          ),
        },
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd(s.faq)) },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service } = Route.useLoaderData();
  const others = services.filter((s) => s.slug !== service.slug).slice(0, 4);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Accueil", to: "/" },
          { label: "Services", to: "/services" },
          { label: service.navName },
        ]}
      />

      <Section className="pb-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>{service.audience}</Eyebrow>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold leading-tight">
              {service.h1}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground">{service.intro}</p>
            <div className="mt-8">
              <CallButtons subject={service.name} />
            </div>
          </div>
          <img
            src={getServiceImage(service.slug)}
            alt={`Exemple de chantier ${service.name.toLowerCase()} réalisé par PURE SPACE NETT`}
            className="aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-card"
          />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-bold">Comment nous intervenons</h2>
            {service.details.map((p) => (
              <p key={p.slice(0, 30)} className="text-sm leading-relaxed text-foreground/90">
                {p}
              </p>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold">Ce que comprend la prestation</h2>
            <div className="mt-4">
              <CheckList items={service.bullets} />
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">Questions fréquentes</h2>
        <div className="mt-6">
          <FaqList faq={service.faq} />
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="font-display text-2xl font-bold">Où nous intervenons</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {zones.map((z) => (
            <Link
              key={z.slug}
              to="/zones/$slug"
              params={{ slug: z.slug }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-accent hover:text-primary"
            >
              {z.name}
            </Link>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl font-bold">Autres prestations</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {others.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent"
            >
              <span className="font-display text-base font-semibold">{s.name}</span>
              <p className="mt-1 text-sm text-muted-foreground">{s.audience}</p>
            </Link>
          ))}
        </div>
      </Section>

      <QuoteBanner subject={service.name} />
    </>
  );
}
