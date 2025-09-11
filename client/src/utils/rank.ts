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

// Advanced Threat Design utilities
import { THREAT_PARAMETERS } from "@/data/threatParameters";

export interface RankInfo {
  label: string;
  numeric: number;
}

// Map rank labels to numeric values for averaging
export function labelToNumeric(label: string): number {
  const param = THREAT_PARAMETERS.find(p => p.rank === label);
  if (!param) throw new Error(`Unknown rank label: ${label}`);
  
  // Use rank bonus as numeric value (higher rank = higher number)
  return param.rankBonus;
}

// Find the nearest rank label to a numeric average
export function nearestLabel(average: number): string {
  let closest = THREAT_PARAMETERS[0];
  let minDiff = Math.abs(average - closest.rankBonus);
  
  for (const param of THREAT_PARAMETERS) {
    const diff = Math.abs(average - param.rankBonus);
    if (diff < minDiff || (diff === minDiff && param.rankBonus > closest.rankBonus)) {
      // On ties, prefer higher rank (architect's tie-breaker rule)
      closest = param;
      minDiff = diff;
    }
  }
  
  return closest.rank;
}

// Calculate average rank from three component ranks
export function averageRanks(attack: string, defense: string, durability: string): {
  finalLabel: string;
  effectiveRank: number;
} {
  const attackNumeric = labelToNumeric(attack);
  const defenseNumeric = labelToNumeric(defense);
  const durabilityNumeric = labelToNumeric(durability);
  
  const effectiveRank = Math.round((attackNumeric + defenseNumeric + durabilityNumeric) / 3 * 100) / 100; // 2 decimal places
  const finalLabel = nearestLabel(effectiveRank);
  
  return { finalLabel, effectiveRank };
}

// Get all available rank labels
export function getRankLabels(): string[] {
  return THREAT_PARAMETERS.map(p => p.rank);
}
