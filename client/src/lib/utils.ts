import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export const STORAGE_KEY = "rotted-capes-character";

export function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
}

export function loadFromLocalStorage(key: string) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading from local storage:", error);
    return null;
  }
}

export const WIZARD_STEPS = [
  { id: 1, name: "Concept" },
  { id: 2, name: "Origin" },
  { id: 3, name: "Archetype" },
  { id: 4, name: "Abilities" },
  { id: 5, name: "Skills & Feats" },
  { id: 6, name: "Powers" },
  { id: 7, name: "Weaknesses" },
  { id: 8, name: "Gear" },
  { id: 9, name: "Finishing Touches" },
];
