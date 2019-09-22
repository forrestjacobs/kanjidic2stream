import { Character, SkipQueryCode, SparseCharacter } from "./character";

function append<V>(
  target: { [key: string]: V[] | undefined },
  key: string,
  value: V
): void {
  const arr = target[key];
  if (arr === undefined) {
    target[key] = [value];
  } else {
    arr.push(value);
  }
}

/* eslint-disable @typescript-eslint/camelcase */

export const elementHandlers: {
  [name: string]: (
    acc: SparseCharacter,
    text: string,
    attr: Record<string, string>
  ) => void;
} = {
  literal: (acc, text) => {
    acc.literal = text;
  },
  cp_value: (acc, text, attr) => {
    acc.codepoints[attr.cp_type as keyof Character["codepoints"]] = text;
  },
  rad_value: (acc, text, attr) => {
    acc.radicals[attr.rad_type as keyof Character["radicals"]] = +text;
  },
  grade: (acc, text) => {
    acc.grade = +text;
  },
  stroke_count: (acc, text) => {
    acc.strokeCounts.push(+text);
  },
  variant: (acc, text, attr) => {
    append(acc.variants, attr.var_type, text);
  },
  freq: (acc, text) => {
    acc.freq = +text;
  },
  rad_name: (acc, text) => {
    acc.radNames.push(text);
  },
  jlpt: (acc, text) => {
    acc.jlpt = +text;
  },
  dic_ref: (acc, text, attr) => {
    if (attr.dr_type === "moro") {
      append(acc.dicRefs, "moro", {
        vol: attr.m_vol,
        page: attr.m_page,
        value: text
      });
    } else {
      append(acc.dicRefs, attr.dr_type, text);
    }
  },
  q_code: (acc, text, attr) => {
    if (attr.qc_type === "skip") {
      const skipCode: SkipQueryCode = { value: text };
      if (attr.skip_misclass !== undefined) {
        skipCode.misclass = attr.skip_misclass as SkipQueryCode["misclass"];
      }
      append(acc.queryCodes, "skip", skipCode);
    } else {
      append(acc.queryCodes, attr.qc_type, text);
    }
  },
  reading: (acc, text, attr) => {
    append(acc.readings, attr.r_type, text);
  },
  meaning: (acc, text, attr) => {
    const lang = attr.m_lang || "en";
    if (acc.meanings[lang] === undefined) {
      acc.meanings[lang] = [];
    }
    acc.meanings[lang].push(text);
  },
  nanori: (acc, text) => {
    acc.nanori.push(text);
  }
};
