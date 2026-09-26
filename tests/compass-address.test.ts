import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  osmAddressQuery,
  parseOsmAddresses,
  streetMatches,
  type AddressQuery,
} from "../src/services/compass-address";
const query: AddressQuery = {
  city: "Астана",
  country: "KZ",
  center: { lat: 51.1801, lng: 71.446 },
  street: "Иманова",
  house: "9",
};
const road = {
  type: "way",
  id: 30658826,
  center: { lat: 51.1598245, lon: 71.4622457 },
  tags: {
    highway: "secondary",
    name: "Амангелді Иманов көшесі",
    "name:ru": "улица Амангельды Иманова",
  },
};
const house = {
  type: "relation",
  id: 3242954,
  center: { lat: 51.1640454, lon: 71.4341852 },
  tags: {
    building: "yes",
    "addr:city": "Астана",
    "addr:country": "KZ",
    "addr:street": "Амангелді Иманов көшесі",
    "addr:housenumber": "9",
  },
};
describe("Russian compass address search", () => {
  it("finds both reported houses in the shipped Astana dataset", () => {
    const data = JSON.parse(
      readFileSync("public/locations/addresses/astana.json", "utf8"),
    );
    for (const [street, number, id] of [
      ["Желтоксан", "32/1", "way-30637518"],
      ["улица Амангельды Иманова", "9", "relation-3242954"],
    ]) {
      const found = parseOsmAddresses(data, {
        ...query,
        street,
        house: number,
      });
      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(id);
      expect(found[0].label).toContain(number);
    }
  });
  it("joins a multipolygon house to the Russian street name", () => {
    expect(parseOsmAddresses({ elements: [road, house] }, query)).toMatchObject(
      [
        {
          id: "relation-3242954",
          label: "улица Амангельды Иманова, 9",
          zoom: 18,
          center: { lat: 51.1640454, lng: 71.4341852 },
        },
      ],
    );
  });
  it("distinguishes a street from its namesake lane", () => {
    const lane = {
      ...house,
      id: 2,
      tags: { ...house.tags, "addr:street": "переулок Амангельды Иманова" },
    };
    expect(
      parseOsmAddresses(
        { elements: [road, lane, house] },
        { ...query, street: "улица Иманова" },
      ),
    ).toHaveLength(1);
    expect(streetMatches("переулок Амангельды Иманова", "улица Иманова")).toBe(
      false,
    );
  });
  it("preserves fractional house numbers without substituting another house", () => {
    const street = {
      ...road,
      tags: {
        highway: "residential",
        name: "Желтоқсан көшесі",
        "name:ru": "улица Желтоксан",
      },
    };
    const building = {
      ...house,
      id: 30637518,
      type: "way",
      tags: {
        ...house.tags,
        "addr:street": "Желтоқсан көшесі",
        "addr:housenumber": "32/1",
      },
    };
    const q = { ...query, street: "Желтоксан", house: "32/1" };
    expect(
      parseOsmAddresses({ elements: [street, building] }, q)[0].label,
    ).toBe("улица Желтоксан, 32/1");
    expect(
      parseOsmAddresses(
        { elements: [street, building] },
        { ...q, house: "32" },
      ),
    ).toEqual([]);
    expect(parseOsmAddresses({ elements: [street] }, q)).toEqual([]);
  });
  it("deduplicates road segments in street suggestions", () => {
    const found = parseOsmAddresses(
      { elements: [road, { ...road, id: 2 }, house] },
      { ...query, house: "" },
    );
    expect(found).toHaveLength(1);
    expect(found[0].street).toBe("улица Амангельды Иманова");
    expect(found[0].zoom).toBe(15);
  });
  it("rejects other cities, countries and distant coordinates", () => {
    for (const altered of [
      { ...house, center: { lat: 43, lon: 71 } },
      { ...house, tags: { ...house.tags, "addr:city": "Косшы" } },
      { ...house, tags: { ...house.tags, "addr:country": "RU" } },
    ])
      expect(parseOsmAddresses({ elements: [road, altered] }, query)).toEqual(
        [],
      );
  });
  it("escapes user text and restricts the search to the chosen city", () => {
    const q = osmAddressQuery({ ...query, house: '32/1";out;' });
    expect(q).toContain('["name:ru"="Астана"]');
    expect(q).toContain('["addr:housenumber"="32/1\\";out;"]');
    expect(q).toContain("(area.city)");
    expect(() => osmAddressQuery({ ...query, street: "ул." })).toThrow();
  });
  it("rejects timeout responses and ignores malformed objects", () => {
    expect(() =>
      parseOsmAddresses({ elements: [], remark: "timed out" }, query),
    ).toThrow();
    expect(() => parseOsmAddresses({}, query)).toThrow();
    expect(parseOsmAddresses({ elements: [null, {}] }, query)).toEqual([]);
  });
});
