import { SaxesAttribute, SaxesTag } from "saxes";
import { Character, Header, SkipQueryCode } from "./element";

export type MinorTagHandler<T> = (acc: T, text: string, node: SaxesTag) => void;

export interface MinorTagHandlers<T> {
  [name: string]: MinorTagHandler<T>;
}

export interface MajorTagHandler<T> {
  build(): T;
  subnodes: MinorTagHandlers<T>;
}

type SparseCharacter = Partial<Omit<Character, "codepoints" | "radicals">> &
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

type SparseHeader = Partial<Header> & Pick<Header, "type">;

export type SparseElement = SparseHeader | SparseCharacter;

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

function getSkip(
  text: string,
  attributes: Record<string, SaxesAttribute> | Record<string, string>
): SkipQueryCode {
  const skipCode: SkipQueryCode = { value: text };
  if (attributes.skip_misclass !== undefined) {
    skipCode.misclass = attributes.skip_misclass as SkipQueryCode["misclass"];
  }
  return skipCode;
}

/* eslint-disable @typescript-eslint/camelcase */

const headerHandler: MajorTagHandler<SparseHeader> = {
  build: () => ({ type: "header" }),
  subnodes: {
    file_version(acc, text): void {
      acc.fileVersion = +text;
    },
    database_version(acc, text): void {
      const [year, versionInYear] = text.split("-").map(e => +e);
      acc.year = year;
      acc.versionInYear = versionInYear;
    },
    date_of_creation(acc, text): void {
      const [year, month, day] = text.split("-").map(e => +e);
      acc.year = year;
      acc.month = month;
      acc.day = day;
    }
  }
};

const characterHandler: MajorTagHandler<SparseCharacter> = {
  build: () => ({
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
  subnodes: {
    literal(character, text): void {
      character.literal = text;
    },
    cp_value(character, text, { attributes }): void {
      character.codepoints[
        attributes.cp_type as keyof Character["codepoints"]
      ] = text;
    },
    rad_value(character, text, { attributes }): void {
      character.radicals[
        attributes.rad_type as keyof Character["radicals"]
      ] = +text;
    },
    grade(character, text): void {
      character.grade = +text;
    },
    stroke_count(character, text): void {
      character.strokeCounts.push(+text);
    },
    variant(character, text, { attributes }): void {
      append(character.variants, attributes.var_type as string, text);
    },
    freq(character, text): void {
      character.freq = +text;
    },
    rad_name(character, text): void {
      character.radNames.push(text);
    },
    jlpt(character, text): void {
      character.jlpt = +text;
    },
    dic_ref(character, text, { attributes }): void {
      const val =
        attributes.dr_type === "moro"
          ? {
              vol: attributes.m_vol,
              page: attributes.m_page,
              value: text
            }
          : text;
      append(character.dicRefs, attributes.dr_type as string, val);
    },
    q_code(character, text, { attributes }): void {
      const val =
        attributes.qc_type === "skip" ? getSkip(text, attributes) : text;
      append(character.queryCodes, attributes.qc_type as string, val);
    },
    reading(character, text, { attributes }): void {
      append(character.readings, attributes.r_type as string, text);
    },
    meaning(character, text, { attributes }): void {
      const lang = (attributes.m_lang as string) || "en";
      if (character.meanings[lang] === undefined) {
        character.meanings[lang] = [];
      }
      character.meanings[lang].push(text);
    },
    nanori(character, text): void {
      character.nanori.push(text);
    }
  }
};

export const majorTagHandlers = {
  header: headerHandler,
  character: characterHandler
};
