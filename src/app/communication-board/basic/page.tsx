import { Metadata } from "next";
import { Kana } from "../_components/Kana";

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
      <Kana />
    </main>
  );
}
