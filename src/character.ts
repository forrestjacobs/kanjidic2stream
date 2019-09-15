export interface MoroDicRef {
  vol: string;
  page: string;
  value: string;
}

export interface SkipQueryCode {
  misclass: "posn" | "stroke_count" | "stroke_and_posn" | "storoke_diff";
  value: string;
}

export interface Character {
  literal: string;
  codepoints: {
    jis208?: string;
    jis212?: string;
    jis213?: string;
    ucs: string;
  };
  radicals: {
    classical: number;
    nelson_c?: number;
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

  dicRefs: {
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
    moro: MoroDicRef[];
  };

  queryCodes: {
    [type in "sh_desc" | "four_corner" | "deroo"]: string[];
  } & {
    skip: SkipQueryCode[];
  };

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

  nanori: string[];
}
