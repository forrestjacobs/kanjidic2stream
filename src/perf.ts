import { createReadStream } from "fs";
import { Suite, Event } from "benchmark";
import { Parser } from ".";

/*
    Benchmarks the parser. Run with "node perf.js". Make sure kanjidic2.xml is
    in the same directory.
*/

interface Deferred {
  resolve(): void;
}

new Suite()
  .add("Parse", {
    defer: true,
    fn: (deferred: Deferred) => {
      createReadStream("./kanjidic2.xml", "utf8")
        .pipe(new Parser())
        .on("data", () => {})
        .on("finish", () => deferred.resolve());
    }
  })
  .on("cycle", (event: Event): void => {
    console.log(String(event.target));
  })
  // run async
  .run();