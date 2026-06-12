/**
 * Tests des procédures BGG (searchBgg / lookupBgg).
 * fetch est mocké — on teste le parsing XML et les fallbacks, pas l'API.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestContext } from "../../test/setup";

const SEARCH_XML = `<?xml version="1.0" encoding="utf-8"?>
<items total="2" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="13">
    <name type="primary" value="CATAN"/>
    <yearpublished value="1995"/>
  </item>
  <item type="boardgame" id="27710">
    <name type="alternate" value="Catan: Junior &amp; Co"/>
    <yearpublished value="2007"/>
  </item>
</items>`;

const THING_XML = `<?xml version="1.0" encoding="utf-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="13">
    <thumbnail>https://cf.geekdo-images.com/thumb.jpg</thumbnail>
    <image>https://cf.geekdo-images.com/original.jpg</image>
    <name type="primary" sortindex="1" value="CATAN"/>
    <name type="alternate" sortindex="1" value="Les Colons de Catane"/>
    <yearpublished value="1995"/>
    <minplayers value="3"/>
    <maxplayers value="4"/>
    <playingtime value="120"/>
    <minage value="10"/>
    <link type="boardgamedesigner" id="11" value="Klaus Teuber"/>
    <link type="boardgamecategory" id="1026" value="Negotiation"/>
  </item>
</items>`;

function makeCaller(userId: string) {
  return appRouter.createCaller({
    prisma,
    userId,
    headers: {},
    session: { user: { id: userId } },
  });
}

describe("objects.searchBgg / lookupBgg", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    process.env.BGG_API_TOKEN = "test-token";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.BGG_API_TOKEN;
  });

  it("searchBgg parses items (id, primary name, year)", async () => {
    fetchMock.mockResolvedValue(new Response(SEARCH_XML, { status: 200 }));
    const ctx = await createTestContext();
    const caller = makeCaller(ctx.userId);

    const result = await caller.objects.searchBgg({ query: "catan" });

    expect(result.configured).toBe(true);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({ bggId: 13, name: "CATAN", year: 1995 });
    expect(result.items[1].name).toBe("Catan: Junior & Co");
    expect(fetchMock.mock.calls[0][0]).toContain("type=boardgame&query=catan");
    expect(fetchMock.mock.calls[0][1].headers).toEqual({ Authorization: "Bearer test-token" });
  });

  it("searchBgg returns empty items on HTTP error", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 503 }));
    const ctx = await createTestContext();
    const caller = makeCaller(ctx.userId);

    await expect(caller.objects.searchBgg({ query: "catan" })).resolves.toEqual({
      configured: true,
      items: [],
    });
  });

  it("searchBgg reports configured=false without BGG_API_TOKEN (no network call)", async () => {
    delete process.env.BGG_API_TOKEN;
    const ctx = await createTestContext();
    const caller = makeCaller(ctx.userId);

    await expect(caller.objects.searchBgg({ query: "catan" })).resolves.toEqual({
      configured: false,
      items: [],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lookupBgg maps thing metadata to form fields", async () => {
    fetchMock.mockResolvedValue(new Response(THING_XML, { status: 200 }));
    const ctx = await createTestContext();
    const caller = makeCaller(ctx.userId);

    const data = await caller.objects.lookupBgg({ bggId: 13 });

    expect(data).toEqual({
      title: "CATAN",
      designer: "Klaus Teuber",
      year: 1995,
      minPlayers: 3,
      maxPlayers: 4,
      playTime: 120,
      ageMin: 10,
      coverUrl: "https://cf.geekdo-images.com/original.jpg",
    });
  });

  it("lookupBgg returns null when BGG has no item", async () => {
    fetchMock.mockResolvedValue(
      new Response(`<?xml version="1.0"?><items total="0"></items>`, { status: 200 })
    );
    const ctx = await createTestContext();
    const caller = makeCaller(ctx.userId);

    await expect(caller.objects.lookupBgg({ bggId: 999999999 })).resolves.toBeNull();
  });
});
