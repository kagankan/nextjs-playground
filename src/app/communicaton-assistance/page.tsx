import { Metadata } from "next";
import dynamic from "next/dynamic";

// navigatorでエラーになるため dynamic import
const FaceDirectionDetector = dynamic(
  () => import("./_components/FaceDirectionDetector"),
  { ssr: false }
);

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
