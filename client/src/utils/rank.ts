export const RANK_CAPS = [0, 20, 24, 28, 32, 36, 40, 44, 47, 50, 50];
export const getRankCap = (rank: number) => RANK_CAPS[rank] || RANK_CAPS[RANK_CAPS.length - 1];

export const RANK_NAMES = [
  "",
  "Zeta",
  "Epsilon",
  "Delta",
  "Gamma",
  "Beta",
  "Alpha",
  "Theta",
  "Sigma",
  "Upsilon",
  "Omega",
];

export const getRankName = (rank: number) =>
  RANK_NAMES[rank] || RANK_NAMES[RANK_NAMES.length - 1];
