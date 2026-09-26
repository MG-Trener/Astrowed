import { expect, it } from "vitest";
import {
  calculate,
  calculateNew,
  demoInput,
  newBirthSchema,
} from "../src/domain/bazi/engine";

it("enforces mean solar time for new requests, including old clients", () => {
  const raw = {
    ...demoInput,
    date: "2000-07-15",
    time: "17:15",
    timezone: "Europe/Moscow",
    longitude: 30,
  };
  const expected = calculate({ ...raw, timeMode: "mean-solar" });
  expect(demoInput.timeMode).toBe("mean-solar");
  for (const timeMode of [undefined, "civil", "mean-solar"]) {
    expect(calculateNew({ ...raw, timeMode })).toEqual(expected);
    expect(newBirthSchema.parse({ ...raw, timeMode }).timeMode).toBe(
      "mean-solar",
    );
  }
  expect(expected.method.localTime).toBe("2000-07-15 15:15");
  expect(expected.method.correctionMinutes).toBe(-120);
  expect(calculate({ ...raw, timeMode: "civil" }).method.localTime).toBe(
    "2000-07-15 17:15",
  );
});
