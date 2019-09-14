import { parser, QualifiedTag, SAXParser, Tag } from "sax";
import { Transform } from "stream";
import { Character, Rmgroup } from "./character";

type BaseCharacter = Pick<
  Character,
  | "codepoints"
  | "radicals"
  | "strokeCounts"
  | "variants"
  | "radNames"
  | "dicNumbers"
  | "queryCodes"
  | "readingMeanings"
  | "nanori"
>;

const START_TEXT = "<kanjidic2>";

function makeBaseCharacter(): BaseCharacter {
  return {
    codepoints: [],
    radicals: [],
    strokeCounts: [],
    variants: [],
    radNames: [],
    dicNumbers: [],
    queryCodes: [],
    readingMeanings: [],
    nanori: []
  };
}

function makeRmgroup(): Rmgroup {
  return {
    readings: [],
    meanings: []
  };
}

export class Parser extends Transform {
  private readonly sax: SAXParser;
  private currentCharacter: Partial<Character> &
    BaseCharacter = makeBaseCharacter();
  private currentRmgroup: Rmgroup = makeRmgroup();
  private startBuffer?: string = "";

  public constructor() {
    super({ readableObjectMode: true });

    const saxParser = parser(false, { trim: true, lowercase: true });
    this.sax = saxParser;

    let currentNode: Tag | QualifiedTag;

    saxParser.onerror = (error): void => {
      this.emit("error", error);
    };
    saxParser.onopentag = (node): void => {
      currentNode = node;
    };
    saxParser.ontext = (text): void => {
      this.updateCharacterFromElement(
        currentNode.name,
        currentNode.attributes,
        text
      );
    };
    saxParser.onclosetag = (tagName): void => {
      if (tagName === "rmgroup") {
        this.currentCharacter.readingMeanings.push(this.currentRmgroup);
        this.currentRmgroup = makeRmgroup();
      } else if (tagName === "character") {
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
    attr: any,
    text: string
  ): void {
    switch (name) {
      case "literal":
        this.currentCharacter.literal = text;
        break;
      case "grade":
        this.currentCharacter.grade = +text;
        break;
      case "freq":
        this.currentCharacter.freq = +text;
        break;
      case "jlpt":
        this.currentCharacter.jlpt = +text;
        break;
      case "stroke_count":
        this.currentCharacter.strokeCounts.push(+text);
        break;
      case "rad_name":
        this.currentCharacter.radNames.push(text);
        break;
      case "nanori":
        this.currentCharacter.nanori.push(text);
        break;
      case "rad_value":
        this.currentCharacter.radicals.push({
          type: attr.rad_type,
          value: +text
        });
        break;
      case "reading":
        this.currentRmgroup.readings.push({
          type: attr.r_type,
          value: text
        });
        break;
      case "meaning":
        this.currentRmgroup.meanings.push({
          lang: attr.m_lang,
          value: text
        });
        break;
    }
  }
}
