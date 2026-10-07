import { describe, expect, test } from "bun:test";
import { DEFAULT_PRICING, estimatePrice } from "@/lib/quotes-shared";

describe("CRM 2026 pricing grid", () => {
  test("uses 25 EUR/hour for recurring standard cleaning with a 50 EUR minimum", () => {
    expect(
      estimatePrice(
        {
          propertyType: "bureaux",
          surfaceM2: 40,
          frequency: "hebdomadaire",
          services: ["nettoyage_courant"],
        },
        DEFAULT_PRICING,
      ),
    ).toEqual({ min: 50, max: 50 });

    expect(
      estimatePrice(
        {
          propertyType: "bureaux",
          surfaceM2: 100,
          frequency: "hebdomadaire",
          services: ["nettoyage_courant"],
        },
        DEFAULT_PRICING,
      ),
    ).toEqual({ min: 125, max: 125 });
  });

  test("uses 30 EUR/hour for punctual cleaning", () => {
    expect(
      estimatePrice(
        {
          propertyType: "logement",
          surfaceM2: 100,
          frequency: "ponctuel",
          services: ["nettoyage_courant"],
        },
        DEFAULT_PRICING,
      ),
    ).toEqual({ min: 150, max: 150 });
  });

  test("uses 35 EUR/hour and 15 m²/hour for chantier/remise en état", () => {
    expect(
      estimatePrice(
        {
          propertyType: "chantier",
          surfaceM2: 30,
          frequency: "ponctuel",
          services: ["fin_de_chantier"],
        },
        DEFAULT_PRICING,
      ),
    ).toEqual({ min: 70, max: 70 });
  });

  test("uses the 32 EUR/hour Sunday baseline without reducing technical pricing", () => {
    expect(
      estimatePrice(
        {
          propertyType: "bureaux",
          surfaceM2: 40,
          frequency: "hebdomadaire",
          services: ["nettoyage_courant"],
          desiredDate: "2026-10-11",
        },
        DEFAULT_PRICING,
      ),
    ).toEqual({ min: 65, max: 65 });

    expect(
      estimatePrice(
        {
          propertyType: "chantier",
          surfaceM2: 30,
          frequency: "ponctuel",
          services: ["fin_de_chantier"],
          desiredDate: "2026-10-11",
        },
        DEFAULT_PRICING,
      ),
    ).toEqual({ min: 70, max: 70 });
  });

  test("uses the published vitrerie range and textile range", () => {
    expect(
      estimatePrice(
        {
          propertyType: "logement",
          surfaceM2: 20,
          frequency: "ponctuel",
          services: ["vitrerie"],
        },
        DEFAULT_PRICING,
      ),
    ).toEqual({ min: 100, max: 180 });

    expect(
      estimatePrice(
        {
          propertyType: "logement",
          surfaceM2: 1,
          frequency: "ponctuel",
          services: ["textile"],
        },
        DEFAULT_PRICING,
      ),
    ).toEqual({ min: 50, max: 160 });
  });
});
