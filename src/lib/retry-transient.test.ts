import { describe, expect, test } from "bun:test";
import { retryTransient } from "./retry-transient";

describe("retryTransient", () => {
  test("retries transient responses and returns the first successful result", async () => {
    let calls = 0;
    const result = await retryTransient(
      async () => ({ status: ++calls < 3 ? 503 : 200 }),
      (response) => response.status >= 500,
      { attempts: 3, initialDelayMs: 0 },
    );

    expect(calls).toBe(3);
    expect(result.status).toBe(200);
  });

  test("returns permanent client errors without retrying", async () => {
    let calls = 0;
    const result = await retryTransient(
      async () => ({ status: ++calls === 1 ? 401 : 200 }),
      (response) => response.status >= 500,
      { attempts: 3, initialDelayMs: 0 },
    );

    expect(calls).toBe(1);
    expect(result.status).toBe(401);
  });

  test("retries rejected operations and propagates the final error", async () => {
    let calls = 0;
    await expect(
      retryTransient(
        async () => {
          calls += 1;
          throw new Error("network down");
        },
        () => false,
        { attempts: 3, initialDelayMs: 0 },
      ),
    ).rejects.toThrow("network down");
    expect(calls).toBe(3);
  });
});
