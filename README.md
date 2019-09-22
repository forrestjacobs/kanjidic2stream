# kanjidic2stream

Read [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) (a great
open kanji dictionary) in your Node.js app! Includes TypeScript support.

TODO: Write example of how to use the library.

## Contributing

Requires [Yarn].

* Run `yarn run build` to build the project (or `yarn run dev` to build and
  watch for changes.)
* `yarn run perf` tests performance using [Benchmark.js]. You need to run
  `build`, and download and extract the [KANJIDIC2 file] to the root of the
  project before running `perf`.
* Run these before committing:
  * `yarn run format` formats the code in place using [Prettier].
  * `yarn run lint` checks the code using [ESLint].
  * `yarn run test` runs tests using [Jest] (with coverage requirements.)

[Yarn]: https://yarnpkg.com/
[Benchmark.js]: https://github.com/bestiejs/benchmark.js
[KANJIDIC2 file]: http://www.edrdg.org/kanjidic/kanjidic2.xml.gz
[Prettier]: https://prettier.io/
[ESLint]: https://eslint.org/
[Jest]: https://jestjs.io/
