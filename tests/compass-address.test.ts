import { describe, expect, it } from "vitest";
import {
  addressSearchUrl,
  parseAddressResults,
  type AddressQuery,
} from "../src/services/compass-address";

const query: AddressQuery = {
  city: "Астана",
  country: "KZ",
  center: { lat: 51.17, lng: 71.43 },
  street: "Туркестан",
  house: "",
};
const feature = (properties = {}, coordinates = [71.42, 51.12]) => ({
  geometry: { type: "Point", coordinates },
  properties: {
    countrycode: "KZ",
    type: "street",
    name: "Туркестан",
    city: "Астана",
    osm_type: "W",
    osm_id: 1,
    ...properties,
  },
});
describe("compass address search", () => {
  it("keeps city, street and house separate and safely encoded", () => {
    const url = new URL(
      addressSearchUrl({ ...query, street: "Мәңгілік Ел", house: "10/2" }),
    );
    expect(url.searchParams.get("city")).toBe("Астана");
    expect(url.searchParams.get("street")).toBe("Мәңгілік Ел");
    expect(url.searchParams.get("housenumber")).toBe("10/2");
    expect(url.searchParams.get("countrycode")).toBe("KZ");
  });
  it("rejects distant namesakes, wrong countries and invalid coordinates", () => {
    const found = parseAddressResults(
      {
        features: [
          feature(),
          feature({}, [71.42, 43.1]),
          feature({ countrycode: "RU" }),
          feature({}, [NaN, 51]),
        ],
      },
      query,
    );
    expect(found).toHaveLength(1);
    expect(found[0].zoom).toBe(15);
  });
  it("never substitutes a street or a different house for the requested number", () => {
    const found = parseAddressResults(
      {
        features: [
          feature(),
          feature({ type: "house", housenumber: "10" }),
          feature({ type: "house", housenumber: "10/2", street: "Туркестан" }),
        ],
      },
      { ...query, house: "10/2" },
    );
    expect(found).toHaveLength(1);
    expect(found[0].label).toBe("Туркестан, 10/2");
    expect(found[0].zoom).toBe(18);
    expect(
      parseAddressResults(
        { features: [feature()] },
        { ...query, house: "99999" },
      ),
    ).toEqual([]);
  });
  it("reports malformed responses instead of presenting a false no-match", () => {
    expect(() => parseAddressResults({}, query)).toThrow();
    expect(parseAddressResults({ features: [null, {}] }, query)).toEqual([]);
  });
});
