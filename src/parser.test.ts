import { readdirSync, readFileSync } from "fs";
import { safeLoadAll } from "js-yaml";
import { Parser } from ".";
import { Character } from "./character";

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
const FIXTURES = readdirSync(FIXTURE_PATH).filter(filename =>
  filename.endsWith(".yaml")
);

describe("parser", () => {
  it("handles errors", () => {
    const errorCallback = jest.fn();

    const parser = new Parser();
    parser.on("error", errorCallback);

    parser.end("<kanjidic2><bad");

    expect(errorCallback).toHaveBeenCalledTimes(1);
  });
});

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
