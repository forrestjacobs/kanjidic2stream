import { readdirSync, readFileSync } from "fs";
import { safeLoadAll } from "js-yaml";
import { Element, Parser } from ".";

const BASE_CHARACTER = {
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

const FIXTURE_PATH = "./fixtures";
const FIXTURES = readdirSync(FIXTURE_PATH).filter(n => n.endsWith(".yaml"));

type FixtureResult = Element | { type: "error"; message: string };
type Result = Element | Error;

describe.each(FIXTURES)("%s", filename => {
  const yaml = readFileSync(`${FIXTURE_PATH}/${filename}`, "utf8");
  const documents = safeLoadAll(yaml).map(document => [
    document.name,
    document
  ]);
  it.each(documents)(
    "%s",
    async (
      name,
      { xml, results }: { xml: string; results: FixtureResult[] }
    ) => {
      const expected: Result[] = results.map(e => {
        switch (e.type) {
          case "error":
            return new Error(e.message);
          case "character":
            return { ...BASE_CHARACTER, ...e };
          default:
            return e;
        }
      });

      const actual: Result[] = await new Promise(resolve => {
        const acc: Result[] = [];
        const parser = new Parser();
        parser.on("data", character => acc.push(character));
        parser.on("error", error => acc.push(error));
        parser.on("finish", () => resolve(acc));

        parser.end(Buffer.from(xml));
      });

      expect(actual).toStrictEqual(expected);
    }
  );
});
