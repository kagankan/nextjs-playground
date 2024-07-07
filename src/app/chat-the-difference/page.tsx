import { Metadata } from "next";
import { Hero } from "./_components/Hero";
import { Message } from "./_components/Message";
import { dataset } from "./api/dataset";

export const metadata: Metadata = {
  title: "見えない間違い探し",
};

export default function Chat() {
  return (
    <div className=" bg-slate-100">
      <main className=" min-h-screen  px-[5%] max-w-4xl mx-auto flex flex-col">
        <Hero />
        {/* <Visual /> */}
        <Message dataset={dataset} />
      </main>
    </div>
  );
}
