import fs from "node:fs";

const getBase64Url = (path: `/src${string}`) => {
  const buffer = fs.readFileSync(process.cwd() + path);
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
};

const imageUrlA = getBase64Url(
  "/src/app/chat-the-difference/api/_images/mark_manpu12_hirameki_a.png"
);
const imageUrlB = getBase64Url(
  "/src/app/chat-the-difference/api/_images/mark_manpu12_hirameki_b.png"
);

const imagePath1A = getBase64Url(
  "/src/app/chat-the-difference/api/_images/kid_toy_neji_a.png"
);
const imagePath1B = getBase64Url(
  "/src/app/chat-the-difference/api/_images/kid_toy_neji_b.png"
);

console.log("dataset");

export const dataset = [
  {
    a: imageUrlA,
    b: imageUrlB,
    answer: "上部の線の大きさが違う",
  },
  {
    a: imagePath1A,
    b: imagePath1B,
    answer: "手の動きを表す線がない",
  },
  {
    a: getBase64Url(
      "/src/app/chat-the-difference/api/_images/study_gogaku_man1_english.png"
    ),
    b: getBase64Url(
      "/src/app/chat-the-difference/api/_images/study_gogaku_man7.png"
    ),
    answer: "片方にだけ、本の表紙に「English」の文字が書かれている",
  },
];
