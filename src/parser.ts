import { SaxesParser, SaxesTag } from "saxes";
import { Transform } from "stream";
import { SparseCharacter } from "./character";
import { elementHandlers } from "./element-handlers";

function makeBaseCharacter(): SparseCharacter {
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

export class Parser extends Transform {
  private readonly sax: SaxesParser;
  private currentCharacter: SparseCharacter = makeBaseCharacter();

  public constructor() {
    super({ readableObjectMode: true });

    const saxParser = new SaxesParser({ fileName: "kanjidic" });
    this.sax = saxParser;

    let currentNode = { name: "" } as SaxesTag;

    saxParser.onerror = (error): void => {
      this.emit("error", error);
    };
    saxParser.onopentag = (node): void => {
      currentNode = node;
    };
    saxParser.ontext = (t): void => {
      const text = t.trim();
      if (text) {
        const handler = elementHandlers[currentNode.name];
        if (handler !== undefined) {
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
