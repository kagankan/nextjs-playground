import { Hero } from "./_components/Hero";
import { Message } from "./_components/Message";
import { Visual } from "./_components/Visual";

export default function Chat() {
  return (
    <main className=" min-h-screen  px-[5%] max-w-4xl mx-auto flex flex-col">
      <Hero />
      {/* <Visual /> */}
      <Message />
    </main>
  );
}
