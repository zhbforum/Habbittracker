import { HomeFooter as ExportedHomeFooter } from "../HomeFooter";

describe("HomeFooter exports", () => {
  it("Given home footer barrel, When importing HomeFooter, Then it re-exports a defined component reference", () => {
    expect(ExportedHomeFooter).toBeDefined();
  });
});
