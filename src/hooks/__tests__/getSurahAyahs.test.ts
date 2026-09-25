import { describe, it, expect, vi, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { getSurahAyahs } from "@/hooks/useMushafPageData";

beforeAll(() => {
  const json = readFileSync(resolve(__dirname, "../../../public/mushaf-text.json"), "utf8");
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => JSON.parse(json) })));
});

describe("getSurahAyahs", () => {
  it.each([
    [1, 7], [2, 286], [18, 110], [78, 40], [108, 3], [112, 4], [114, 6],
  ])("sourate %i → %i versets", async (surah, count) => {
    expect(await getSurahAyahs(surah)).toHaveLength(count);
  });

  it("les 114 sourates totalisent 6236 versets", async () => {
    let total = 0;
    for (let s = 1; s <= 114; s++) total += (await getSurahAyahs(s)).length;
    expect(total).toBe(6236);
  });
});
