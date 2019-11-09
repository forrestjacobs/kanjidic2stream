import { SaxesParser, SaxesTag } from "saxes";
import { Transform } from "stream";
import { elementHandlers } from "./element-handlers";
import { elementFactories, SparseElement } from "./sparse-element";

export class Parser extends Transform {
  private readonly sax: SaxesParser;
  private currentElement = {} as SparseElement;

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
      if (node.name in elementFactories) {
        this.currentElement = elementFactories[node.name]();
      }
    };
    saxParser.ontext = (t): void => {
      const text = t.trim();
      if (text) {
        const handler = elementHandlers[currentNode.name];
        if (handler !== undefined) {
            handler(this.currentElement, text, currentNode.attributes as Record<
            string,
            string
          >);
        }
      }
    };
    saxParser.onclosetag = ({ name }): void => {
      if (name in elementFactories) {
        this.push(this.currentElement);
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
