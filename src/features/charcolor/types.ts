
import type miemieDetails from 'src/data/miemie-details.json';

export type MiemieDetailsTyped = typeof miemieDetails;
export type CharColorMode = 'color' | 'enclosing-shape' | 'underline-mark';
export type EnclosingShape = 'square' | 'triangle' | 'circle';
export type UnderlineMark = 'triangle' | 'circle' | 'wave' | 'line';

export interface CharColorConfig {
  userInput: string;
  wordsPerPage: number;
  practiceMode?: CharColorMode;
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
  mode: CharColorMode;
}
