# kanjidic2stream

Parse [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) (a
great open kanji dictionary) in your Node.js app!

## Usage

```JavaScript
const { createReadStream } = require("fs");
const { Parser } = require("kanjidic2stream");

// Read the given KANJIDIC2 file and start parsing
const stream = createReadStream("./kanjidic2.xml", "utf8").pipe(new Parser());

// Print each character
stream.on("data", e => {
  if (e.type === "character") {
    console.log("character", c.literal);
  }
});
```

The `kanjidic2stream.Parser` class is a [stream] that reads a KANJIDIC2 file and
outputs character objects. Piping [this example KANJIDIC2 xml] through
`kanjidic2stream.Parser` would produce the following character object:

[stream]: https://nodejs.org/api/stream.html
[this example KANJIDIC2 xml]: https://www.edrdg.org/kanjidic/kd2examph.html

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

## Contributing

Requires [Yarn].

- Run `yarn run build` to build the project (or `yarn run dev` to build and
  watch for changes.)
- `yarn run perf` tests performance using [Benchmark.js]. You need to run
  `build`, and download and extract the [KANJIDIC2 file] to the root of the
  project before running `perf`. You can download & extract it on *nix with:

  ```shell
  curl http://www.edrdg.org/kanjidic/kanjidic2.xml.gz | gunzip > kanjidic2.xml
  ```

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
