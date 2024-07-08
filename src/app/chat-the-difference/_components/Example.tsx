import { ChatLog } from "./ChatLog";
import { Visual } from "./Visual";
import { exampleData } from "../api/dataset";

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
            content:
              "赤い結晶のイラストです。地面から生えているように見えます。",
          },
          {
            type: "b",
            content: "黄色い結晶が描かれたイラストです。地面から生えています。",
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
      <Visual imageUrlA={exampleData.a} imageUrlB={exampleData.b} />
    </div>
  );
};
