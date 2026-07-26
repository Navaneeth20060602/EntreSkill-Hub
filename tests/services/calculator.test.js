const { parseInvestmentRange } = require("../../server/utils/helpers");

describe("parseInvestmentRange", () => {
  it("parses a typical rupee range", () => {
    expect(parseInvestmentRange("₹30,000 - ₹1,00,000")).toEqual({ min: 30000, max: 100000 });
  });

  it("returns zeros for missing or malformed input", () => {
    expect(parseInvestmentRange("")).toEqual({ min: 0, max: 0 });
    expect(parseInvestmentRange(undefined)).toEqual({ min: 0, max: 0 });
    expect(parseInvestmentRange("no numbers here")).toEqual({ min: 0, max: 0 });
  });

  it("handles a single value with no range", () => {
    expect(parseInvestmentRange("₹50,000")).toEqual({ min: 50000, max: 50000 });
  });
});
