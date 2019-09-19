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
    variants: {},
    radNames: [],
    dicRefs: {},
    queryCodes: {},
    readings: {},
    meanings: {},
    nanori: []
  };
}

function append<V>(target: {[key: string]: V[] | undefined}, key: string, value: V): void {
  const arr = target[key];
  if (arr === undefined) {
    target[key] = [value];
  } else {
    arr.push(value);
  }
}

const elementHandlers: {
  [name: string]: (
    acc: Partial<Character> & BaseCharacter,
    text: string,
    attr: Tag["attributes"]
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
      const handler = elementHandlers[currentNode.name];
      if (handler !== undefined) {
        handler(this.currentCharacter, text, currentNode.attributes);
      }
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
}
