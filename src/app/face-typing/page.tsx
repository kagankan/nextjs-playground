import { Metadata } from "next";
import FaceDirectionDetector from "./_components/FaceDirectionDetector";

export const metadata: Metadata = {
  title: "顔の向きで文字入力",
};

export default function Page() {
  return (
    <div className=" bg-slate-100">
      <main className=" min-h-screen  flex flex-col">
        <FaceDirectionDetector />
      </main>
    </div>
  );
}
