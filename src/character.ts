export interface Element<Type = string, Value = string> {
  type: Type;
  value: Value;
}

export interface Rmgroup {
  readings: Element<
    "pinyin" | "korean_r" | "korean_h" | "vietnam" | "ja_on" | "ja_kun"
  >[];
  meanings: {
    lang?: string;
    value: string;
  }[];
}

export interface Character {
  literal: string;
  codepoints: Element<"jis208" | "jis212" | "jis213" | "ucs">[];
  radicals: Element<"classical" | "nelson_c", number>[];
  grade?: number;
  strokeCounts: number[];

  variants: Element<
    | "jis208"
    | "jis212"
    | "jis213"
    | "deroo"
    | "njecd"
    | "s_h"
    | "nelson_c"
    | "oneill"
    | "ucs"
  >[];

  freq?: number;
  radNames: string[];
  jlpt?: number;

  dicNumbers: Array<
    | Element<
        | "nelson_c"
        | "nelson_n"
        | "halpern_njecd"
        | "halpern_kkd"
        | "halpern_kkld"
        | "halpern_kkld_2ed"
        | "heisig"
        | "heisig6"
        | "gakken"
        | "oneill_names"
        | "oneill_kk"
        | "henshall"
        | "sh_kk"
        | "sh_kk2"
        | "sakade"
        | "jf_cards"
        | "henshall3"
        | "tutt_cards"
        | "crowley"
        | "kanji_in_context"
        | "busy_people"
        | "kodansha_compact"
        | "maniette"
      >
    | (Element<"moro"> & { vol: string; page: string })
  >;

  queryCodes: Array<
    | Element<"sh_desc" | "four_corner" | "deroo" | "misclass">
    | (Element<"skip"> & {
        misclass: "posn" | "stroke_count" | "stroke_and_posn" | "storoke_diff";
      })
  >;

  readingMeanings: Rmgroup[];

  nanori: string[];
}
