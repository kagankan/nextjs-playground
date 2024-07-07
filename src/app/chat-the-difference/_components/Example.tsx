import { ChatLog } from "./ChatLog";
import { Visual } from "./Visual";
import { dataset } from "../api/dataset";

export const Example = () => {
  return (
    <div className="bg-white p-6 rounded-2xl grid gap-4">
      <p className="text-xl font-bold">例題</p>
      <Visual />
      <ChatLog
        messages={[
          {
            type: "question",
            content: "どんな画像ですか？",
          },
          {
            type: "a",
            content: "赤いイラストです。",
          },
          {
            type: "b",
            content: "青いイラストです。",
          },
          {
            type: "answer",
            content: "色が違う",
          },
          {
            type: "result",
            content: "正解です！",
          },
        ]}
      />
      <Visual imageUrlA={dataset[0].a} imageUrlB={dataset[0].b} />
    </div>
  );
};
