import { describe, expect, test } from "bun:test";
import { quoteRequestSchema } from "@/lib/quotes-shared";

const validQuote = {
  clientType: "entreprise",
  propertyType: "bureaux",
  surfaceM2: 500,
  frequency: "hebdomadaire",
  services: ["nettoyage_courant"],
  city: "Paris",
  postalCode: "75001",
  contactName: "Camille Martin",
  email: "camille@example.fr",
  phone: "0601020304",
};

describe("quoteRequestSchema acquisition attribution", () => {
  test("accepts an idempotency key and campaign attribution", () => {
    const result = quoteRequestSchema.safeParse({
      ...validQuote,
      sourceExternalId: "123e4567-e89b-42d3-a456-426614174000",
      gclid: "google-click-id",
      utm_source: "google",
      utm_campaign: "nettoyage-bureaux",
      landing_page: "/devis",
      referrer: "https://example.com/annonce",
    });

    expect(result.success).toBe(true);
  });

  test("rejects malformed ids and oversized attribution values", () => {
    expect(quoteRequestSchema.safeParse({ ...validQuote, sourceExternalId: "nope" }).success).toBe(false);
    expect(quoteRequestSchema.safeParse({ ...validQuote, utm_campaign: "x".repeat(201) }).success).toBe(false);
  });
});
