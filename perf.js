const fs = require("fs");
const Benchmark = require("benchmark");
const { Parser } = require("./lib");

/*
    Benchmarks the parser. Run with "node perf.js". Make sure kanjidic2.xml is
    in the same directory.
*/

var suite = new Benchmark.Suite();

suite
  .add("Parse", {
    defer: true,
    fn: deferred => {
      fs.createReadStream("./kanjidic2.xml", "utf8")
        .pipe(new Parser())
        .on("data", () => {})
        .on("finish", () => deferred.resolve());
    }
  })
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  // run async
  .run();
