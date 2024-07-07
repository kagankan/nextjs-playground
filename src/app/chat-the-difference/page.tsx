import { Hero } from "./_components/Hero";
import { Message } from "./_components/Message";
import { dataset } from "./api/dataset";

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
