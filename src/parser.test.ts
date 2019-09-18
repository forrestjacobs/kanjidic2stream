import { readdirSync, readFileSync } from "fs";
import { safeLoadAll } from "js-yaml";
import { Parser } from ".";
import { Character } from "./character";

const BASE_CHARACTER = {
  codepoints: {},
  radicals: {},
  strokeCounts: [],
  variants: {
    jis208: [],
    jis212: [],
    jis213: [],
    deroo: [],
    njecd: [],
    s_h: [],
    nelson_c: [],
    oneill: [],
    ucs: []
  },
  radNames: [],
  dicRefs: {
    nelson_c: [],
    nelson_n: [],
    halpern_njecd: [],
    halpern_kkd: [],
    halpern_kkld: [],
    halpern_kkld_2ed: [],
    heisig: [],
    heisig6: [],
    gakken: [],
    oneill_names: [],
    oneill_kk: [],
    henshall: [],
    sh_kk: [],
    sh_kk2: [],
    sakade: [],
    jf_cards: [],
    henshall3: [],
    tutt_cards: [],
    crowley: [],
    kanji_in_context: [],
    busy_people: [],
    kodansha_compact: [],
    maniette: [],
    moro: []
  },
  queryCodes: {
    sh_desc: [],
    four_corner: [],
    deroo: [],
    skip: []
  },
  readings: {
    pinyin: [],
    korean_r: [],
    korean_h: [],
    vietnam: [],
    ja_on: [],
    ja_kun: []
  },
  meanings: {},
  nanori: []
};

const FIXTURE_PATH = "./fixtures";
const FIXTURES = readdirSync(FIXTURE_PATH).filter(filename =>
  filename.endsWith(".yaml")
);

describe.each(FIXTURES)("%s", filename => {
  const yaml = readFileSync(`${FIXTURE_PATH}/${filename}`, "utf8");
  const documents = safeLoadAll(yaml).map(document => [
    document.name,
    document
  ]);
  it.each(documents)("%s", (name, { xml, characters }) => {
    const actualCharacters: Character[] = [];
    const errorCallback = jest.fn();

    const parser = new Parser();
    parser.on("data", character => actualCharacters.push(character));
    parser.on("error", errorCallback);

    if (typeof xml === "string") {
      parser.write(xml);
    } else {
      for (const part of xml) {
        parser.write(part);
      }
    }
    parser.end();

    expect(actualCharacters).toStrictEqual(
      characters.map((c: Partial<Character>) => ({ ...BASE_CHARACTER, ...c }))
    );
    expect(errorCallback).toHaveBeenCalledTimes(0);
  });
});
