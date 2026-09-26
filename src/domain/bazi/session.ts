import { calculate, birthSchema } from "./engine";
import type { BirthInput } from "./types";

export const emptyBirthInput: BirthInput = {
  name: "",
  date: "",
  time: "",
  unknownTime: false,
  gender: "female",
  city: "",
  timezone: "",
  longitude: 0,
  latitude: 0,
  dayBoundary: "midnight",
  timeMode: "mean-solar",
  dstChoice: "reject",
};
export const chartSessionKey = "astrowed-active-birth-v1";
export function restoreChart(value: string | null) {
  if (!value) return null;
  try {
    return calculate(birthSchema.parse(JSON.parse(value)));
  } catch {
    return null;
  }
}
