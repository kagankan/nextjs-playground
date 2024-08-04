import { Metadata } from "next";
import { Kana } from "../_components/Kana";
import { TableKana } from "../_components/TableKana";

export const metadata: Metadata = {
  title: "コミュニケーションボード（50音表）",
};

export default function Page() {
  return (
    <main className="h-screen  flex flex-col">
      {/* <Kana /> */}
      <TableKana />
    </main>
  );
}
