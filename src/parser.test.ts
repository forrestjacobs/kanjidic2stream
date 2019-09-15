import { Parser } from "./parser";

const BASE_CHARACTER = {
  codepoints: {
    jis208: [],
    jis212: [],
    jis213: [],
    ucs: []
  },
  radicals: {
    classical: [],
    nelson_c: []
  },
  strokeCounts: [],
  variants: {
    jis208: [],
    jis212: [],
    jis213: [],
    deroo: [],
    njecd: [],
    s_h: [],
    nelson_c: [],
    oneill: [],
    ucs: []
  },
  radNames: [],
  dicRefs: {
    nelson_c: [],
    nelson_n: [],
    halpern_njecd: [],
    halpern_kkd: [],
    halpern_kkld: [],
    halpern_kkld_2ed: [],
    heisig: [],
    heisig6: [],
    gakken: [],
    oneill_names: [],
    oneill_kk: [],
    henshall: [],
    sh_kk: [],
    sh_kk2: [],
    sakade: [],
    jf_cards: [],
    henshall3: [],
    tutt_cards: [],
    crowley: [],
    kanji_in_context: [],
    busy_people: [],
    kodansha_compact: [],
    maniette: [],
    moro: []
  },
  queryCodes: {
    sh_desc: [],
    four_corner: [],
    deroo: [],
    misclass: [],
    skip: []
  },
  readingMeanings: [],
  nanori: []
};

describe("Parser", () => {
  const dataHandler = jest.fn();
  const errorHandler = jest.fn();
  let parser: Parser;

  beforeEach(() => {
    jest.resetAllMocks();
    parser = new Parser();
    parser.on("data", dataHandler);
    parser.on("error", errorHandler);
  });

  test("parses a minimal kanjidic2 doc", () => {
    parser.write("<kanjidic2>");

    parser.write("<character><literal>日</literal></character>");
    expect(dataHandler).toBeCalledTimes(1);
    expect(dataHandler).toHaveBeenNthCalledWith(1, {
      ...BASE_CHARACTER,
      literal: "日"
    });

    parser.end("</kanjidic2>");
    expect(errorHandler).toHaveBeenCalledTimes(0);
  });

  test("ignores everything before <kanjidic2>", () => {
    parser.write("Ye_u0MZ{]a%p9ratB]/' <ka");
    parser.write("njidi");
    parser.end("c2><character><literal>日</literal></character></kanjidic2>");

    expect(dataHandler).toHaveBeenCalledWith({
      ...BASE_CHARACTER,
      literal: "日"
    });
  });

  test("parses multiple characters", () => {
    parser.write("<kanjidic2>");

    parser.write("<character><literal>一</literal></character>");
    expect(dataHandler).toBeCalledTimes(1);
    expect(dataHandler).toHaveBeenNthCalledWith(1, {
      ...BASE_CHARACTER,
      literal: "一"
    });

    parser.write("<character><literal>二</literal></character>");
    expect(dataHandler).toBeCalledTimes(2);
    expect(dataHandler).toHaveBeenNthCalledWith(2, {
      ...BASE_CHARACTER,
      literal: "二"
    });

    parser.end("</kanjidic2>");
    expect(errorHandler).toHaveBeenCalledTimes(0);
  });

  test("parses a radical", () => {
    parser.end(`
      <kanjidic2>
        <character>
          <literal>亜</literal>
          <radical>
            <rad_value rad_type="classical">7</rad_value>
          </radical>
        </character>
      </kanjidic2>
    `);

    expect(dataHandler).toHaveBeenCalledWith({
      ...BASE_CHARACTER,
      literal: "亜",
      radicals: {
        classical: [7],
        nelson_c: []
      }
    });
  });

  test("parses classical and nelson radicals", () => {
    parser.end(`
      <kanjidic2>
        <character>
          <literal>応</literal>
          <radical>
            <rad_value rad_type="classical">61</rad_value>
            <rad_value rad_type="nelson_c">53</rad_value>
          </radical>
        </character>
      </kanjidic2>
    `);

    expect(dataHandler).toHaveBeenCalledWith({
      ...BASE_CHARACTER,
      literal: "応",
      radicals: {
        classical: [61],
        nelson_c: [53]
      }
    });
  });

  test("parses meta", () => {
    parser.end(`
      <kanjidic2>
        <character>
          <literal>哀</literal>
          <misc>
            <grade>8</grade>
            <stroke_count>9</stroke_count>
            <freq>1715</freq>
            <jlpt>1</jlpt>
          </misc>
        </character>
      </kanjidic2>
    `);

    expect(dataHandler).toHaveBeenCalledWith({
      ...BASE_CHARACTER,
      literal: "哀",
      grade: 8,
      strokeCounts: [9],
      freq: 1715,
      jlpt: 1
    });
  });

  test("parses multi-stroke counts", () => {
    parser.end(`
      <kanjidic2>
        <character>
          <literal>飴</literal>
          <misc>
            <stroke_count>13</stroke_count>
            <stroke_count>14</stroke_count>
          </misc>
        </character>
      </kanjidic2>
    `);

    expect(dataHandler).toHaveBeenCalledWith({
      ...BASE_CHARACTER,
      literal: "飴",
      strokeCounts: [13, 14]
    });
  });

  test("parses radical names", () => {
    parser.end(`
      <kanjidic2>
        <character>
          <literal>冂</literal>
          <misc>
            <stroke_count>2</stroke_count>
            <rad_name>まきがまえ</rad_name>
            <rad_name>えながまえ</rad_name>
            <rad_name>どうがまえ</rad_name>
            <rad_name>けいがまえ</rad_name>
          </misc>
        </character>
      </kanjidic2>
    `);

    expect(dataHandler).toHaveBeenCalledWith({
      ...BASE_CHARACTER,
      literal: "冂",
      strokeCounts: [2],
      radNames: ["まきがまえ", "えながまえ", "どうがまえ", "けいがまえ"]
    });
  });

  test("parses rm groups", () => {
    parser.end(`
      <kanjidic2>
        <character>
          <literal>决</literal>
          <reading_meaning>
            <rmgroup>
              <reading r_type="ja_on">ケチ</reading>
              <reading r_type="ja_on">ケツ</reading>
              <reading r_type="ja_kun">き.める</reading>
              <reading r_type="ja_kun">き.まる</reading>
              <reading r_type="ja_kun">さ.く</reading>
              <meaning>decide</meaning>
              <meaning>determine</meaning>
              <meaning>judge</meaning>
            </rmgroup>
          </reading_meaning>
        </character>
      </kanjidic2>
    `);

    expect(dataHandler).toHaveBeenCalledWith({
      ...BASE_CHARACTER,
      literal: "决",
      readingMeanings: [
        {
          readings: {
            pinyin: [],
            korean_r: [],
            korean_h: [],
            vietnam: [],
            ja_on: ["ケチ", "ケツ"],
            ja_kun: ["き.める", "き.まる", "さ.く"]
          },
          meanings: {
            en: ["decide", "determine", "judge"]
          }
        }
      ]
    });
  });

  test("parses nanori", () => {
    parser.end(`
      <kanjidic2>
        <character>
          <literal>咸</literal>
          <reading_meaning>
            <nanori>みな</nanori>
            <nanori>しげ</nanori>
          </reading_meaning>
        </character>
      </kanjidic2>
    `);

    expect(dataHandler).toHaveBeenCalledWith({
      ...BASE_CHARACTER,
      literal: "咸",
      nanori: ["みな", "しげ"]
    });
  });
});
