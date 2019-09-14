export interface Character {
  literal: string;
  radical: number;
  nelsonRadical: number;
  grade?: number;
  strokeCount: number[];
  freq?: number;
  radicalNames: string[];
  jlpt?: number;
  on: string[];
  kun: string[];
  meaning: string[];
  nanori: string[];
}
