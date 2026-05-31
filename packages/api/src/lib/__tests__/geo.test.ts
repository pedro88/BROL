/**
 * Tests for geocoding + Haversine helpers.
 *
 * @package @brol/api
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { geocodePostalCode, haversineKm, haversineSql } from "../geo";

function mockFetchResponse(init: Partial<Response> & { json?: () => Promise<unknown> }): Response {
  return {
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    statusText: init.statusText ?? "",
    json: init.json ?? (async () => ({})),
  } as unknown as Response;
}

const ZIPPO_BRUSSELS_1000 = {
  "post code": "1000",
  country: "Belgium",
  "country abbreviation": "BE",
  places: [
    {
      "place name": "Brussels",
      latitude: "50.8333",
      longitude: "4.35",
    },
  ],
};

describe("geocodePostalCode", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("returns coords + city on 200", async () => {
    fetchSpy.mockResolvedValueOnce(
      mockFetchResponse({ status: 200, json: async () => ZIPPO_BRUSSELS_1000 }),
    );
    const res = await geocodePostalCode("BE", "1000");
    expect(res).toEqual({ lat: 50.8333, lng: 4.35, city: "Brussels" });
  });

  it("normalizes country to lowercase in URL", async () => {
    fetchSpy.mockResolvedValueOnce(
      mockFetchResponse({ status: 200, json: async () => ZIPPO_BRUSSELS_1000 }),
    );
    await geocodePostalCode("be", "1000");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.zippopotam.us/be/1000",
      expect.any(Object),
    );
  });

  it("returns null on 404 (unknown postal code)", async () => {
    fetchSpy.mockResolvedValueOnce(mockFetchResponse({ status: 404 }));
    const res = await geocodePostalCode("BE", "9999");
    expect(res).toBeNull();
  });

  it("retries once on 5xx then succeeds", async () => {
    fetchSpy
      .mockResolvedValueOnce(mockFetchResponse({ status: 503 }))
      .mockResolvedValueOnce(
        mockFetchResponse({ status: 200, json: async () => ZIPPO_BRUSSELS_1000 }),
      );
    const res = await geocodePostalCode("BE", "1000");
    expect(res?.city).toBe("Brussels");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries on persistent 5xx", async () => {
    fetchSpy.mockResolvedValue(mockFetchResponse({ status: 503 }));
    await expect(geocodePostalCode("BE", "1000")).rejects.toThrow(/Zippopotam 503/);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("returns null on invalid country format (no API call)", async () => {
    const res = await geocodePostalCode("BEL", "1000");
    expect(res).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null on invalid postal code format (no API call)", async () => {
    const res = await geocodePostalCode("BE", "!!");
    expect(res).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null on empty places array", async () => {
    fetchSpy.mockResolvedValueOnce(
      mockFetchResponse({
        status: 200,
        json: async () => ({ ...ZIPPO_BRUSSELS_1000, places: [] }),
      }),
    );
    const res = await geocodePostalCode("BE", "1000");
    expect(res).toBeNull();
  });
});

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineKm(50.8333, 4.35, 50.8333, 4.35)).toBeCloseTo(0, 5);
  });

  it("Brussels → Paris ≈ 264 km", () => {
    // Brussels (50.8333, 4.35) → Paris (48.8566, 2.3522)
    const d = haversineKm(50.8333, 4.35, 48.8566, 2.3522);
    expect(d).toBeGreaterThan(260);
    expect(d).toBeLessThan(270);
  });

  it("antipodes ≈ 20015 km (half circumference)", () => {
    const d = haversineKm(0, 0, 0, 180);
    expect(d).toBeGreaterThan(20010);
    expect(d).toBeLessThan(20020);
  });
});

describe("haversineSql", () => {
  it("produces a Prisma.Sql fragment with the radius bound", () => {
    const frag = haversineSql(50.8333, 4.35, 25);
    expect(frag.sql).toContain("acos");
    expect(frag.sql).toContain("radians");
    expect(frag.values).toContain(25);
    expect(frag.values).toContain(50.8333);
    expect(frag.values).toContain(4.35);
  });
});
