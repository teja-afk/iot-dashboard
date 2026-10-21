import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Filter } from "mongodb";

const find = vi.fn();
const findOne = vi.fn();
const collection = vi.fn(() => ({ find, findOne }));
const getMongoDatabase = vi.fn(async () => ({ collection }));

vi.mock("@/lib/mongodb", () => ({ getMongoDatabase }));

const { searchStations, getStationByOutletId } = await import("@/lib/data");

function mockStations(documents: Record<string, unknown>[]) {
  find.mockReturnValue({
    limit: vi.fn(() => ({ toArray: vi.fn(async () => documents) })),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("searchStations", () => {
  it("returns no stations for an empty query", async () => {
    const result = await searchStations("   ");
    expect(result).toEqual([]);
    expect(find).not.toHaveBeenCalled();
  });

  it("matches the station id and the descriptive fields in one query", async () => {
    mockStations([]);

    await searchStations("31843");

    expect(find).toHaveBeenCalledTimes(1);
    const filter = find.mock.calls[0][0] as Filter<Record<string, unknown>>;
    const conditions = filter.$or as Filter<Record<string, unknown>>[];

    expect(conditions[0]).toEqual({ id: { $in: ["31843", 31843] } });
    expect(conditions.some((condition) => "name" in condition)).toBe(true);
    expect(conditions.some((condition) => "location" in condition)).toBe(true);
    expect(conditions.some((condition) => "dealer_ro_name" in condition)).toBe(true);
    expect(conditions.some((condition) => "sap_cust_code" in condition)).toBe(true);
  });

  it("escapes regex characters so a query is matched literally", async () => {
    mockStations([]);

    await searchStations("a.b*c");

    const filter = find.mock.calls[0][0] as Filter<Record<string, unknown>>;
    const conditions = filter.$or as Filter<Record<string, unknown>>[];
    const nameCondition = conditions.find((condition) => "name" in condition) as {
      name: RegExp;
    };

    expect(nameCondition.name.source).toBe("a\\.b\\*c");
  });

  it("maps a station without retail_outlet_id to its own id", async () => {
    mockStations([{ id: "31843", location: "Mahape HO", activeStatus: 1 }]);

    const [station] = await searchStations("31843");

    expect(station.retailOutletId).toBe("31843");
    expect(station.name).toBe("Mahape HO");
    expect(station.active).toBe(true);
  });

  it("prefers an explicit retail_outlet_id when present", async () => {
    mockStations([{ id: "ST-1", retail_outlet_id: "31843", name: "Pump Station" }]);

    const [station] = await searchStations("Pump Station");

    expect(station.retailOutletId).toBe("31843");
    expect(station.name).toBe("Pump Station");
  });
});

describe("getStationByOutletId", () => {
  it("resolves a station whose id is the outlet id", async () => {
    findOne.mockResolvedValue({ id: "31843", location: "Mahape HO" });

    const station = await getStationByOutletId("31843");

    expect(station?.retailOutletId).toBe("31843");
    const filter = findOne.mock.calls[0][0] as Filter<Record<string, unknown>>;
    expect(filter.$or).toEqual([
      { retail_outlet_id: { $in: ["31843", 31843] } },
      { id: { $in: ["31843", 31843] } },
    ]);
  });
});
