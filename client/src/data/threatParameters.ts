export interface ThreatParameter {
  label: string;
  rank: number; // numeric value for advanced averaging
  rankCap: number;
  rankBonus: number;
  defenses: [number, number, number]; // primary/secondary/tertiary
  stamina: number;
  wounds: number;
  toHit: [number, number]; // single target / area of effect
  damage: { min: number; max: number; avg: number };
}

export const THREAT_PARAMETERS: ThreatParameter[] = [
  {
    label: "Bystander",
    rank: 0.25,
    rankCap: 20,
    rankBonus: 1,
    defenses: [14, 12, 9],
    stamina: 10,
    wounds: 1,
    toHit: [5, 2],
    damage: { min: 3, max: 12, avg: 6 },
  },
  {
    label: "Hardened",
    rank: 0.5,
    rankCap: 20,
    rankBonus: 1,
    defenses: [13, 13, 9],
    stamina: 20,
    wounds: 1,
    toHit: [6, 3],
    damage: { min: 4, max: 13, avg: 8 },
  },
  {
    label: "Zeta",
    rank: 1,
    rankCap: 20,
    rankBonus: 1,
    defenses: [15, 13, 10],
    stamina: 30,
    wounds: 2,
    toHit: [7, 4],
    damage: { min: 7, max: 17, avg: 11 },
  },
  {
    label: "Epsilon",
    rank: 2,
    rankCap: 23,
    rankBonus: 2,
    defenses: [17, 15, 11],
    stamina: 30,
    wounds: 3,
    toHit: [8, 5],
    damage: { min: 8, max: 18, avg: 12 },
  },
  {
    label: "Delta",
    rank: 3,
    rankCap: 26,
    rankBonus: 3,
    defenses: [20, 17, 12],
    stamina: 36,
    wounds: 3,
    toHit: [11, 8],
    damage: { min: 10, max: 22, avg: 14 },
  },
  {
    label: "Gamma",
    rank: 4,
    rankCap: 29,
    rankBonus: 4,
    defenses: [22, 19, 13],
    stamina: 54,
    wounds: 3,
    toHit: [13, 10],
    damage: { min: 11, max: 27, avg: 17 },
  },
  {
    label: "Beta",
    rank: 5,
    rankCap: 33,
    rankBonus: 5,
    defenses: [25, 21, 14],
    stamina: 66,
    wounds: 3,
    toHit: [16, 13],
    damage: { min: 12, max: 30, avg: 19 },
  },
  {
    label: "Alpha",
    rank: 6,
    rankCap: 36,
    rankBonus: 6,
    defenses: [28, 23, 15],
    stamina: 78,
    wounds: 3,
    toHit: [19, 16],
    damage: { min: 13, max: 33, avg: 21 },
  },
  {
    label: "Theta",
    rank: 7,
    rankCap: 40,
    rankBonus: 7,
    defenses: [31, 25, 16],
    stamina: 87,
    wounds: 3,
    toHit: [22, 19],
    damage: { min: 14, max: 36, avg: 23 },
  },
  {
    label: "Sigma",
    rank: 8,
    rankCap: 43,
    rankBonus: 8,
    defenses: [33, 27, 17],
    stamina: 120,
    wounds: 4,
    toHit: [24, 21],
    damage: { min: 16, max: 40, avg: 25 },
  },
  {
    label: "Upsilon",
    rank: 9,
    rankCap: 46,
    rankBonus: 9,
    defenses: [36, 29, 18],
    stamina: 160,
    wounds: 5,
    toHit: [27, 24],
    damage: { min: 20, max: 50, avg: 30 },
  },
  {
    label: "Omega",
    rank: 10,
    rankCap: 50,
    rankBonus: 10,
    defenses: [39, 31, 19],
    stamina: 200,
    wounds: 6,
    toHit: [30, 27],
    damage: { min: 24, max: 60, avg: 40 },
  },
];

export function getThreatParameter(label: string): ThreatParameter | undefined {
  return THREAT_PARAMETERS.find((p) => p.label === label);
}
