import { parser, SAXParser, Tag } from "sax";
import { Transform } from "stream";
import { Character, SkipQueryCode } from "./character";

type BaseCharacter = Pick<
  Character,
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

const START_TEXT = "<kanjidic2>";

function makeBaseCharacter(): BaseCharacter {
  return {
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
}

export class Parser extends Transform {
  private readonly sax: SAXParser;
  private currentCharacter: Partial<Character> &
    BaseCharacter = makeBaseCharacter();
  private startBuffer?: string = "";

  public constructor() {
    super({ readableObjectMode: true });

    const saxParser = parser(false, { trim: true, lowercase: true });
    this.sax = saxParser;

    let currentNode: Tag;

    saxParser.onerror = (error): void => {
      this.emit("error", error);
    };
    saxParser.onopentag = (node): void => {
      currentNode = node as Tag;
    };
    saxParser.ontext = (text): void => {
      this.updateCharacterFromElement(
        currentNode.name,
        currentNode.attributes,
        text
      );
    };
    saxParser.onclosetag = (tagName): void => {
      if (tagName === "character") {
        this.push(this.currentCharacter);
        this.currentCharacter = makeBaseCharacter();
      }
    };
  }

  public _transform(
    chunk: string,
    encoding: string,
    callback: () => void
  ): void {
    // Ignore everything up until "<kanjidic2>"
    if (this.startBuffer !== undefined) {
      const buf: string = this.startBuffer + chunk;
      const start = buf.indexOf(START_TEXT);
      if (start === -1) {
        this.startBuffer = buf.substr(-START_TEXT.length);
      } else {
        this.sax.write(buf.substr(start));
        this.startBuffer = undefined;
      }
    } else {
      this.sax.write(chunk);
    }
    callback();
  }

  public _flush(callback: (error?: Error, data?: unknown) => void): void {
    this.sax.close();
    callback();
  }

  private updateCharacterFromElement(
    name: string,
    attr: Tag["attributes"],
    text: string
  ): void {
    switch (name) {
      case "literal":
        this.currentCharacter.literal = text;
        break;
      case "cp_value":
        this.currentCharacter.codepoints[
          attr.cp_type as keyof Character["codepoints"]
        ] = text;
        break;
      case "rad_value":
        this.currentCharacter.radicals[
          attr.rad_type as keyof Character["radicals"]
        ] = +text;
        break;
      case "grade":
        this.currentCharacter.grade = +text;
        break;
      case "stroke_count":
        this.currentCharacter.strokeCounts.push(+text);
        break;
      case "variant":
        this.currentCharacter.variants[
          attr.var_type as keyof Character["variants"]
        ].push(text);
        break;
      case "freq":
        this.currentCharacter.freq = +text;
        break;
      case "rad_name":
        this.currentCharacter.radNames.push(text);
        break;
      case "jlpt":
        this.currentCharacter.jlpt = +text;
        break;
      case "dic_ref":
        this.handleDicRef(attr, text);
        break;
      case "q_code":
        this.handleQCode(attr, text);
        break;
      case "reading":
        this.currentCharacter.readings[
          attr.r_type as keyof Character["readings"]
        ].push(text);
        break;
      case "meaning":
        this.handleMeaning(attr.m_lang || "en", text);
        break;
      case "nanori":
        this.currentCharacter.nanori.push(text);
        break;
    }
  }

  private handleDicRef(attr: Tag["attributes"], text: string): void {
    const type = attr.dr_type as keyof Character["dicRefs"];
    if (type === "moro") {
      this.currentCharacter.dicRefs.moro.push({
        vol: attr.m_vol,
        page: attr.m_page,
        value: text
      });
    } else {
      this.currentCharacter.dicRefs[type].push(text);
    }
  }

  private handleQCode(attr: Tag["attributes"], text: string): void {
    const type = attr.qc_type as keyof Character["queryCodes"];
    if (type === "skip") {
      this.currentCharacter.queryCodes.skip.push({
        misclass: attr.skip_misclass as SkipQueryCode["misclass"],
        value: text
      });
    } else {
      this.currentCharacter.queryCodes[type].push(text);
    }
  }

  private handleMeaning(lang: string, text: string): void {
    if (this.currentCharacter.meanings[lang] === undefined) {
      this.currentCharacter.meanings[lang] = [];
    }
    this.currentCharacter.meanings[lang].push(text);
  }
}
