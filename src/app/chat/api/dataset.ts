import fs from "node:fs";

const imagePathA =
  process.cwd() + "/src/app/chat/api/_images/mark_manpu12_hirameki_a.png";
const imageBufferA = fs.readFileSync(imagePathA);
const imageBase64A = imageBufferA.toString("base64");
const imageUrlA = `data:image/png;base64,${imageBase64A}`;
const imagePathB =
  process.cwd() + "/src/app/chat/api/_images/mark_manpu12_hirameki_b.png";
const imageBufferB = fs.readFileSync(imagePathB);
const imageBase64B = imageBufferB.toString("base64");
const imageUrlB = `data:image/png;base64,${imageBase64B}`;

console.log("dataset");

export const dataset = [
  {
    a: imageUrlA,
    b: imageUrlB,
    answer: "上部の線の大きさが違う",
  },
];
