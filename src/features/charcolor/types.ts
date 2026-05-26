
import type miemieDetails from 'src/data/miemie-details.json';

export type MiemieDetailsTyped = typeof miemieDetails;

export interface CharColorConfig {
  userInput: string;
  wordsPerPage: number;
  selectedPreset: number;
  selectedLevel: string;
  fullSelectedValue: string;
  selectedBook: string;
}

export interface ColorPreset {
  name: string;
  colors: string[];
}

export interface PageData {
  chars: string[];
  colors: string[];
}
