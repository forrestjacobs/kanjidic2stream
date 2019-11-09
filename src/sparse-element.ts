import { Character, Header } from "./element";

export type SparseCharacter = Partial<
  Omit<Character, "codepoints" | "radicals">
> &
  Pick<
    Character,
    | "type"
    | "strokeCounts"
    | "variants"
    | "radNames"
    | "dicRefs"
    | "queryCodes"
    | "readings"
    | "meanings"
    | "nanori"
  > & {
    codepoints: Partial<Character["codepoints"]>;
    radicals: Partial<Character["radicals"]>;
  };

export type SparseHeader = Partial<Header> & Pick<Header, "type">;

export type SparseElement = SparseCharacter | SparseHeader;

export const elementFactories: {
  [name: string]: () => SparseElement;
} = {
  character: () => ({
    type: "character",
    codepoints: {},
    radicals: {},
    strokeCounts: [],
    variants: {},
    radNames: [],
    dicRefs: {},
    queryCodes: {},
    readings: {},
    meanings: {},
    nanori: []
  }),
  header: () => ({
    type: "header"
  })
};
