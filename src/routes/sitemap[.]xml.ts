import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { services } from "@/content/services";
import { zones } from "@/content/zones";
import {
  isSitemapRouteIncluded,
  sitemapPathForLocation,
  sitemapStaticPaths,
  sitemapXML,
  type SitemapEntry,
} from "@/lib/sitemap";

// Origine publique du site.
const BASE_URL = "https://purespacenett.com";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));

        const serviceRouteId = "/services/$slug";
        if (isSitemapRouteIncluded(router.routesById[serviceRouteId])) {
          for (const service of services) {
            const location = router.buildLocation({
              to: "/services/$slug",
              params: { slug: service.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, serviceRouteId);
            if (path) entries.push({ path });
          }
        }

        const zoneRouteId = "/zones/$slug";
        if (isSitemapRouteIncluded(router.routesById[zoneRouteId])) {
          for (const zone of zones) {
            const location = router.buildLocation({
              to: "/zones/$slug",
              params: { slug: zone.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, zoneRouteId);
            if (path) entries.push({ path });
          }
        }

        if (entries.length === 0) {
          return new Response("No pages are included in this sitemap.", {
            status: 404,
            headers: { "Cache-Control": "no-store" },
          });
        }

        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
