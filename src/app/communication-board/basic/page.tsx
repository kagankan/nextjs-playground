import { Metadata } from "next";
import { Kana } from "../_components/Kana";
import { FlickKana } from "../_components/FlickKana";

export const metadata: Metadata = {
  title: "コミュニケーションボード",
};

export default function Page() {
  return (
    <main className="h-screen  flex flex-col">
      {/* <Kana /> */}
      <FlickKana />
    </main>
  );
}
