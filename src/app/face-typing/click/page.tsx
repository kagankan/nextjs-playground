import { Metadata } from "next";
import { BinaryKana } from "../_components/BinaryKana";

export const metadata: Metadata = {
  title: "二分探索文字選択",
};

export default function Page() {
  return (
    <div className=" bg-slate-100">
      <main className=" min-h-screen  flex flex-col">
        <BinaryKana />
      </main>
    </div>
  );
}
