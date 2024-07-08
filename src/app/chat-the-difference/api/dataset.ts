import fs from "node:fs";

const getBase64Url = (path: `/src${string}.png`) => {
  const buffer = fs.readFileSync(process.cwd() + path);
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
};

console.log("dataset");

export const exampleData = {
  a: getBase64Url(
    "/src/app/chat-the-difference/api/_images/kouseki_daiza1_red.png"
  ),
  b: getBase64Url(
    "/src/app/chat-the-difference/api/_images/kouseki_daiza3_yellow.png"
  ),
  answer: "鉱石の色が違う",
} as const;

export const dataset = [
  // 簡単
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/study_gogaku_man1_english.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/study_gogaku_man7.png"
    ),
    answer: "片方にだけ、本の表紙に「English」の文字が書かれている",
  },
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/kuchi_taisou02.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/kuchi_taisou03.png"
    ),
    answer: "口の形が違う（表情が違う）",
  },
  {
    a: getBase64Url("/src/app/chat-the-difference/api/_images/car_red.png"),
    b: getBase64Url("/src/app/chat-the-difference/api/_images/car_blue.png"),
    answer: "車の色が違う",
  },
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/amount_water_glass2.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/amount_water_glass3.png"
    ),
    answer: "入っている水の量が違う",
  },
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/souji_table_fuku_girl.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/souji_table_fuku_schoolgirl.png"
    ),
    answer: "女の子が着ている服が違う",
  },
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/toy_fukimodoshi_fue.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/toy_fukimodoshi_fue_takusan.png"
    ),
    answer: "吹き戻しの数が違う（一方は1本だけ、もう一方はたくさん）",
  },
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/teisyoku_haizen.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/teisyoku_hiyayakko.png"
    ),
    answer: "豆腐（冷奴）が片方にしかない",
  },

  {
    a: getBase64Url("/src/app/chat-the-difference/api/_images/room_living.png"),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/room_living_b_easy.png"
    ),
    answer: "コップの並び順が違う（赤のコップと緑のコップが入れ替わっている）",
  },
  // ここから難しい
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/room_kodomobeya.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/room_kodomobeya_b.png"
    ),
    answer: "机の上の本棚の右上の時計の有無",
  },
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/mizu_junkan_a.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/mizu_junkan_b.png"
    ),
    answer: "太陽の大きさが違う",
  },
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/teisyoku_haizen.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/teisyoku_haizen_b.png"
    ),
    answer: "焼き魚の焼き目の有無",
  },

  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/news_wideshow_smile.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/news_wideshow_b.png"
    ),
    answer:
      "右側の若い男性の表情が違う（一方は笑顔で、もう一方は真面目な表情）",
  },
  {
    a: getBase64Url("/src/app/chat-the-difference/api/_images/room_living.png"),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/room_living_b_hard.png"
    ),
    answer: "テーブルの左下に置かれている、緑色のコップの向きが違う",
  },
] as const;
