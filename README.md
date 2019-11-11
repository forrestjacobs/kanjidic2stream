# kanjidic2stream

Stream Japanese kanji data from a [KANJIDIC2] file in Node.js.

[kanjidic2]: https://www.edrdg.org/wiki/index.php/KANJIDIC_Project

## Usage

kanjidic2stream exports `Parser`, a [transform stream] class. Piping a
KANJIDIC2 xml file to a `Parser` instance produces one object containing the
header data followed by an object for each character. See the example below.
Keep in mind that you need to download and extract the [KANJIDIC2 file] to your
working directory before running the example.

```JavaScript
const { createReadStream } = require("fs");
const { Parser } = require("kanjidic2stream");

// Read the KANJIDIC file and starts parsing.
const stream = createReadStream("./kanjidic2.xml", "utf8").pipe(new Parser());

// Print the KANJIDIC database version followed by each character.
// Output is like:
//   database version: 2019-313
//   character: 亜
//   character: 唖
//   character: 娃
//   ...
stream.on("data", e => {
  if (e.type === "header") {
    console.log("database version:", e.year + '-' + e.versionInYear);
  } else if (e.type === "character") {
    console.log("character", e.literal);
  }
});
```

The header object looks like the example below. If you're using TypeScript,
import `Header` to see its interface.

```JSON
{
  "type": "header",
  "fileVersion": 4,
  "year": 2019,
  "versionInYear": 313,
  "month": 11,
  "day": 9
}
```

The character objects (using [this example xml]) look like the example below. If
you're using TypeScript, import `Character` to see its interface.

```JSON
{
  "type": "character",
  "literal": "本",
  "codepoints": { "ucs": "672c", "jis208": "43-60" },
  "radicals": { "classical": 75, "nelson_c": 2 },
  "grade": 1,
  "strokeCounts": [5],
  "variants": { "jis208": ["52-81"] },
  "freq": 10,
  "radNames": [],
  "jlpt": 4,
  "dicRefs": {
    "nelson_c": ["96"],
    "nelson_n": ["2536"],
    "halpern_njecd": ["3502"],
    "halpern_kkld": ["2183"],
    "heisig": ["211"],
    "gakken": ["15"],
    "oneill_names": ["212"],
    "oneill_kk": ["20"],
    "moro": [{ "vol": "6", "page": "0026", "value": "14421" }],
    "henshall": ["70"],
    "sh_kk": ["25"],
    "sakade": ["45"],
    "jf_cards": ["61"],
    "henshall3": ["76"],
    "tutt_cards": ["47"],
    "crowley": ["6"],
    "kanji_in_context": ["37"],
    "busy_people": ["2.1"],
    "kodansha_compact": ["1046"],
    "maniette": ["215"]
  },
  "queryCodes": {
    "skip": [{ "value": "4-5-3" }],
    "sh_desc": ["0a5.25"],
    "four_corner": ["5023.0"],
    "deroo": ["1855"]
  },
  "readings": {
    "pinyin": ["ben3"],
    "korean_r": ["bon"],
    "korean_h": ["본"],
    "ja_on": ["ホン"],
    "ja_kun": ["もと"]
  },
  "meanings": {
    "en": [
      "book",
      "present",
      "main",
      "true",
      "real",
      "counter for long cylindrical things"
    ],
    "fr": [
      "livre",
      "présent",
      "essentiel",
      "origine",
      "principal",
      "réalité",
      "vérité",
      "compteur d'objets allongés"
    ],
    "es": [
      "libro",
      "origen",
      "base",
      "contador de cosas alargadas"
    ],
    "pt": [
      "livro",
      "presente",
      "real",
      "verdadeiro",
      "principal",
      "sufixo p/ contagem De coisas longas"
    ]
  },
  "nanori": ["まと"]
}
```

[transform stream]: https://nodejs.org/api/stream.html#stream_class_stream_transform
[this example xml]: https://www.edrdg.org/kanjidic/kd2examph.html

## Motivation

There are plenty of KANJIDIC parsers for Node.js, but I wanted to create a
parser that (a) uses the KANJIDIC2 xml file rather than the more limited text
dictionary files, and (b) uses Node.js streams since the xml file is quite
large.

## License

This project is released under the [ISC license]. Keep in mind that the
[KANJIDIC files have their own license][kanjidic license].

[isc license]: https://tldrlegal.com/l/isc
[kanjidic license]: https://www.edrdg.org/wiki/index.php/KANJIDIC_Project#Copyright_and_Permissions

## Building & Contributing

Requires [Yarn].

- Run `yarn run build` to build the project (or `yarn run dev` to build and
  watch for changes.)
- `yarn run perf` tests performance using [Benchmark.js]. You need to run
  `build`, and download and extract the [KANJIDIC2 file] to the root of the
  project before running `perf`.
- Run these before committing:
  - `yarn run format` formats the code in place using [Prettier].
  - `yarn run lint` checks the code using [ESLint].
  - `yarn run test` runs tests using [Jest] (with coverage requirements.)

[yarn]: https://yarnpkg.com/
[benchmark.js]: https://github.com/bestiejs/benchmark.js
[kanjidic2 file]: http://www.edrdg.org/kanjidic/kanjidic2.xml.gz
[prettier]: https://prettier.io/
[eslint]: https://eslint.org/
[jest]: https://jestjs.io/
