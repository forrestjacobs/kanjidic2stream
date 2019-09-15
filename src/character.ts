export interface Element<Type = string, Value = string> {
  type: Type;
  value: Value;
}

export interface Rmgroup {
  readings: {
    [type in
      | "pinyin"
      | "korean_r"
      | "korean_h"
      | "vietnam"
      | "ja_on"
      | "ja_kun"]: string[];
  };
  meanings: {
    [lang: string]: string[];
  };
}

export interface Character {
  literal: string;
  codepoints: {
    [type in "jis208" | "jis212" | "jis213" | "ucs"]: string[];
  };
  radicals: {
    [type in "classical" | "nelson_c"]: number[];
  };
  grade?: number;
  strokeCounts: number[];

  variants: {
    [type in
      | "jis208"
      | "jis212"
      | "jis213"
      | "deroo"
      | "njecd"
      | "s_h"
      | "nelson_c"
      | "oneill"
      | "ucs"]: string[];
  };

  freq?: number;
  radNames: string[];
  jlpt?: number;

  dicNumbers: {
    [type in
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
      | "maniette"]: string[];
  } & {
    moro: { vol: string; page: string; value: string }[];
  };

  queryCodes: {
    [type in "sh_desc" | "four_corner" | "deroo" | "misclass"]: string[];
  } & {
    skip: {
      misclass: "posn" | "stroke_count" | "stroke_and_posn" | "storoke_diff";
      value: string;
    }[];
  };

  readingMeanings: Rmgroup[];

  nanori: string[];
}
