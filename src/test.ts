import { readdirSync, readFileSync } from "fs";
import { safeLoadAll } from "js-yaml";
import { Parser, Character } from ".";

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

type Result = Character | Error;

describe.each(FIXTURES)("%s", filename => {
  const yaml = readFileSync(`${FIXTURE_PATH}/${filename}`, "utf8");
  const documents = safeLoadAll(yaml).map(document => [
    document.name,
    document
  ]);
  it.each(documents)(
    "%s",
    (name, { xml, results }: { xml: string; results: Result[] }) => {
      const expected = results.map(e =>
        "literal" in e ? { ...BASE_CHARACTER, ...e } : new Error(e.message)
      );
      const actual: Result[] = [];

      const parser = new Parser();
      parser.on("data", character => actual.push(character));
      parser.on("error", error => actual.push(error));

      parser.end(xml);

      expect(actual).toStrictEqual(expected);
    }
  );
});
