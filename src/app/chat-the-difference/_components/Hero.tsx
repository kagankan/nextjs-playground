export const Hero = () => {
  return (
    <div className="my-8 max-w-2xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-center">見えない間違い探し</h1>
      <p className="text-center text-lg text-gray-700 mt-4">
        AIに質問して、2つの画像の違いを見つけ出そう！
      </p>
      <ul className="mt-8 list-disc text-sm ml-4 grid gap-1">
        <li>質問内容を入力して、「質問する」ボタンで質問してください。</li>
        <li>
          生成AIによる説明のため、内容に誤りがあったり、聞くたびに違う回答になる場合があります（そのため、正解に到達することが不可能な場合があります）。
        </li>
        <li>
          それまでの質問は記憶していないため、毎回の送信ごとに完結した質問をしてください。
        </li>
      </ul>
    </div>
  );
};
