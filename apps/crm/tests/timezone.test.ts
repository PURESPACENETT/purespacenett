import { describe, expect, test } from "bun:test";
import { nextParisMidnight } from "@/lib/timezone";

describe("nextParisMidnight", () => {
  test("returns the next local midnight before the spring clock change", () => {
    expect(nextParisMidnight(new Date("2026-03-28T12:00:00.000Z")).toISOString()).toBe(
      "2026-03-28T23:00:00.000Z",
    );
  });

  test("returns the next local midnight before the autumn clock change", () => {
    expect(nextParisMidnight(new Date("2026-10-24T12:00:00.000Z")).toISOString()).toBe(
      "2026-10-24T22:00:00.000Z",
    );
  });

  test("uses the same Paris offset on an ordinary day", () => {
    expect(nextParisMidnight(new Date("2026-11-04T12:00:00.000Z")).toISOString()).toBe(
      "2026-11-04T23:00:00.000Z",
    );
  });
});
