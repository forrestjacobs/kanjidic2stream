import { Character, SkipQueryCode } from "./element";
import { SparseCharacter, SparseElement, SparseHeader } from "./sparse-element";

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

function getSkip(text: string, attr: Record<string, string>): SkipQueryCode {
  const skipCode: SkipQueryCode = { value: text };
  if (attr.skip_misclass !== undefined) {
    skipCode.misclass = attr.skip_misclass as SkipQueryCode["misclass"];
  }
  return skipCode;
}

/* eslint-disable @typescript-eslint/camelcase */

export const elementHandlers: {
  [name: string]: (
    acc: SparseElement,
    text: string,
    attr: Record<string, string>
  ) => void;
} = {
  literal: (acc, text) => {
    (acc as SparseCharacter).literal = text;
  },
  cp_value: (acc, text, attr) => {
    (acc as SparseCharacter).codepoints[
      attr.cp_type as keyof Character["codepoints"]
    ] = text;
  },
  rad_value: (acc, text, attr) => {
    (acc as SparseCharacter).radicals[
      attr.rad_type as keyof Character["radicals"]
    ] = +text;
  },
  grade: (acc, text) => {
    (acc as SparseCharacter).grade = +text;
  },
  stroke_count: (acc, text) => {
    (acc as SparseCharacter).strokeCounts.push(+text);
  },
  variant: (acc, text, attr) => {
    append((acc as SparseCharacter).variants, attr.var_type, text);
  },
  freq: (acc, text) => {
    (acc as SparseCharacter).freq = +text;
  },
  rad_name: (acc, text) => {
    (acc as SparseCharacter).radNames.push(text);
  },
  jlpt: (acc, text) => {
    (acc as SparseCharacter).jlpt = +text;
  },
  dic_ref: (acc, text, attr) => {
    const val =
      attr.dr_type === "moro"
        ? {
            vol: attr.m_vol,
            page: attr.m_page,
            value: text
          }
        : text;
    append((acc as SparseCharacter).dicRefs, attr.dr_type, val);
  },
  q_code: (acc, text, attr) => {
    const val = attr.qc_type === "skip" ? getSkip(text, attr) : text;
    append((acc as SparseCharacter).queryCodes, attr.qc_type, val);
  },
  reading: (acc, text, attr) => {
    append((acc as SparseCharacter).readings, attr.r_type, text);
  },
  meaning: (acc, text, attr) => {
    const lang = attr.m_lang || "en";
    if ((acc as SparseCharacter).meanings[lang] === undefined) {
      (acc as SparseCharacter).meanings[lang] = [];
    }
    (acc as SparseCharacter).meanings[lang].push(text);
  },
  nanori: (acc, text) => {
    (acc as SparseCharacter).nanori.push(text);
  },

  file_version: (acc, text) => {
    (acc as SparseHeader).fileVersion = +text;
  },
  database_version: (acc, text) => {
    const [year, versionInYear] = text.split("-").map(e => +e);
    (acc as SparseHeader).year = year;
    (acc as SparseHeader).versionInYear = versionInYear;
  },
  date_of_creation: (acc, text) => {
    const [year, month, day] = text.split("-").map(e => +e);
    (acc as SparseHeader).year = year;
    (acc as SparseHeader).month = month;
    (acc as SparseHeader).day = day;
  }
};
