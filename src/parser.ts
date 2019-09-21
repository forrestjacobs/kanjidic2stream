import { SaxesParser, SaxesTag } from "saxes";
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

const elementHandlers: {
  [name: string]: (
    acc: Partial<Character> & BaseCharacter,
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

export class Parser extends Transform {
  private readonly sax: SaxesParser;
  private currentCharacter: Partial<Character> &
    BaseCharacter = makeBaseCharacter();

  public constructor() {
    super({ readableObjectMode: true });

    const saxParser = new SaxesParser({});
    this.sax = saxParser;

    let currentNode: SaxesTag;

    saxParser.onerror = (error): void => {
      this.emit("error", error);
    };
    saxParser.onopentag = (node): void => {
      currentNode = node;
    };
    saxParser.ontext = (t): void => {
      const text = t.trim();
      if (text && currentNode) {
        const handler = elementHandlers[currentNode.name];
        if (handler !== undefined && text) {
          handler(this.currentCharacter, text, currentNode.attributes as Record<
            string,
            string
          >);
        }
      }
    };
    saxParser.onclosetag = ({ name }): void => {
      if (name === "character") {
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
    this.sax.write(chunk);
    callback();
  }

  public _flush(callback: (error?: Error, data?: unknown) => void): void {
    this.sax.close();
    callback();
  }
}
