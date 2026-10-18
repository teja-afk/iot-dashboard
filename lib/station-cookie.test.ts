import { describe, expect, it, vi, beforeEach } from "vitest";
import { getSelectedOutletId } from "@/lib/station-cookie";
import { setSelectedOutletId } from "@/lib/station-actions";

const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: mockGet,
    set: mockSet,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("station cookie", () => {
  it("getSelectedOutletId returns undefined when no cookie", async () => {
    mockGet.mockReturnValue(undefined);
    const result = await getSelectedOutletId();
    expect(result).toBeUndefined();
  });

  it("getSelectedOutletId returns outletId from cookie", async () => {
    mockGet.mockReturnValue({ value: "31483" });
    const result = await getSelectedOutletId();
    expect(result).toBe("31483");
  });

  it("setSelectedOutletId sets cookie with correct options", async () => {
    await setSelectedOutletId("31483");
    expect(mockSet).toHaveBeenCalledWith("iot_selected_station", "31483", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  });
});
