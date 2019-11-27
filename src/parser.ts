import { SaxesParser, SaxesTag } from "saxes";
import { Transform } from "stream";
import {
  majorTagHandlers,
  MinorTagHandler,
  MinorTagHandlers,
  SparseElement
} from "./handlers";

// saxes's typescript declaration file says that `fail` accepts an Error obj as
// its parameter, but it's actually string
declare module "saxes" {
  interface SaxesParser {
    fail(er: string): this;
  }
}

export class Parser extends Transform {
  private readonly sax: SaxesParser;

  public constructor() {
    super({ readableObjectMode: true });

    const saxParser = new SaxesParser({ fileName: "kanjidic" });
    this.sax = saxParser;

    saxParser.onerror = (error): void => {
      this.emit("error", error);
    };

    /*
      Parsing basically follows these steps:
        (a) detect major tag start <─────┐
         v                               │
        (b) detect minor tag start <─┐   │
         v                           │   │
        (c) detect text              │   │
         v                           │   │
        (d) detect minor tag end ────┘   │
         v                               │
        (e) detect major tag end ────────┘

      The major tags are <header /> and <character />. Minor tags are any
      descendants of a major tag with meaningful content. We don't handle
      container elements like <misc /> but we do look at their children.

      These steps are labeled in an example XML document below:
          <?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE kanjidic2 [...]>
          <kanjidic2>
      (a)   <character>
      (b)     <literal>
      (c)       日
      (d)     </literal>
              <misc>
      (b-c-d)   <grade>8</grade>
              </misc>
      (e)   </character>
      (a)   <character>
              <!-- etc -->
      (e)   </character>
          </kanjidic2>
    */

    let depthWithinMajorTag = 0;
    let sparseElement: SparseElement | undefined = undefined;
    let minorTagHandlers:
      | MinorTagHandlers<SparseElement>
      | undefined = undefined;
    let minorTagHandler: MinorTagHandler<SparseElement> | undefined = undefined;
    let currentInnerTag: SaxesTag | undefined = undefined;

    saxParser.onopentag = (tag): void => {
      const name = tag.name;

      // If we're inside a major tag (a)...
      if (minorTagHandlers !== undefined) {
        // ...look for a minor tag (b)
        depthWithinMajorTag++;
        minorTagHandler = minorTagHandlers[name];
        currentInnerTag = tag;
      } else {
        // ...otherwise, look for a major tag (a)
        const majorHandler =
          majorTagHandlers[name as keyof typeof majorTagHandlers];
        if (majorHandler !== undefined) {
          sparseElement = majorHandler.build();
          minorTagHandlers = majorHandler.subnodes as MinorTagHandlers<
            SparseElement
          >;
        }
      }
    };

    saxParser.ontext = (t): void => {
      // If we're inside a minor tag (b)...
      if (minorTagHandler !== undefined) {
        // ...look for text (c)
        const text = t.trim();
        if (text.length !== 0) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          minorTagHandler(sparseElement!, text, currentInnerTag!);
        }
      }
    };

    saxParser.onclosetag = (): void => {
      // If we're inside a major tag or minor tag (a or b)...
      if (sparseElement !== undefined) {
        minorTagHandler = undefined;
        currentInnerTag = undefined;
        if (depthWithinMajorTag === 0) {
          // Handle the end of a major tag (e)
          this.push(sparseElement);
          sparseElement = undefined;
          minorTagHandlers = undefined;
        } else {
          // Handle the end of a minor tag (d)
          depthWithinMajorTag--;
        }
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

  public _flush(callback: () => void): void {
    this.sax.close();
    callback();
  }
}
