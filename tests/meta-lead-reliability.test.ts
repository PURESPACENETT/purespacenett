import { describe, expect, test } from "bun:test";
import { buildAuthClaims } from "@/integrations/supabase/auth-claims";
import { metaLeadExternalId, processIndividually } from "../supabase/functions/_shared/meta-lead-reliability";

describe("authorization claims", () => {
  test("ignores user-editable metadata for identity and authorization claims", () => {
    const user = {
      id: "user-123",
      email: "verified@example.test",
      app_metadata: { role: "user" },
      user_metadata: { email: "contact@purespacenett.com", role: "admin" },
    };

    expect(buildAuthClaims(user)).toEqual({ sub: "user-123", email: "verified@example.test" });
  });
});

describe("Meta lead retries", () => {
  test("generates a stable, distinct UUID v5 per lead ID", async () => {
    const first = await metaLeadExternalId("meta-lead-1");
    expect(first).toBe(await metaLeadExternalId("meta-lead-1"));
    expect(await metaLeadExternalId("meta-lead-2")).not.toBe(first);
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test("continues processing later leads after an individual failure", async () => {
    const result = await processIndividually([1, 2, 3], async (id) => {
      if (id === 2) throw new Error("synthetic failure");
      return id * 10;
    });

    expect(result.completed).toEqual([10, 30]);
    expect(result.failed.map(({ item }) => item)).toEqual([2]);
  });
});
