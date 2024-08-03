import { Metadata } from "next";
import { BinaryKana } from "../_components/BinaryKana";

export const metadata: Metadata = {
  title: "コミュニケーションボード",
};

export default function Page() {
  return (
    <main
      className="font-bold"
      style={{
        fontFamily: "UD デジタル 教科書体 N-B",
      }}
    >
      <ul className="border border-black *:border *:border-black *:py-4 *:px-2 text-6xl">
        <li>
          体のこと
          <ul className="mt-4 border border-black *:border *:border-black *:p-2 ml-8 text-4xl">
            <li>のどが痛い</li>
            <li>気持ち悪い</li>
            <li>吐きそう</li>
            <li>
              ベッド
              <ul className="border border-black *:border *:border-black *:p-2 ml-8 text-3xl flex w-fit">
                <li>を上げる</li>
                <li>を下げる</li>
              </ul>
            </li>
            <li>体の位置を変えてほしい</li>
            <li>暑い</li>
            <li>寒い</li>
            {/* 予備 */}
            <li>　</li>
            <li>　</li>
            <li>それ以外の体のこと</li>
          </ul>
        </li>
        <li>50音表へ</li>
        <li>　</li>
        <li>おわり</li>
      </ul>
    </main>
  );
}
