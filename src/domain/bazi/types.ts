import type { ElementId } from "./catalog";
export type BirthInput = {
  name: string;
  date: string;
  time: string;
  unknownTime: boolean;
  gender: "female" | "male";
  city: string;
  timezone: string;
  longitude: number;
  latitude: number;
  dayBoundary: "midnight" | "zi";
  timeMode: "civil" | "mean-solar";
  dstChoice: "reject" | "earlier" | "later";
};
export type Pillar = {
  key: string;
  label: string;
  stem: string;
  branch: string;
  element: ElementId;
  branchElement: ElementId;
  polarity: string;
  animal: string;
  hidden: string[];
  tenGod: string;
  hiddenGods: string[];
  nayin: string;
  stage: string;
};
export type Chart = {
  input: BirthInput;
  pillars: Pillar[];
  dayMaster: { stem: string; element: ElementId; polarity: string };
  distribution: Record<ElementId, number>;
  interactions: { name: string; symbols: string; kind: string }[];
  luck: {
    startYear: number;
    endYear: number;
    startAge: number;
    ganZhi: string;
  }[];
  luckStart: string | null;
  forward: boolean | null;
  method: {
    id: string;
    version: string;
    engineVersion: string;
    timezoneVersion: string;
    localTime: string;
    utcTime: string;
    correctionMinutes: number;
    description: string;
  };
  warnings: string[];
};
