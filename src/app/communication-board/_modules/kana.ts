export const variants: Record<string, Record<string, string>> = {
  あ: { 小: "ぁ" },
  い: { 小: "ぃ" },
  う: { 小: "ぅ" },
  え: { 小: "ぇ" },
  お: { 小: "ぉ" },
  か: { "゛": "が" },
  き: { "゛": "ぎ" },
  く: { "゛": "ぐ" },
  け: { "゛": "げ" },
  こ: { "゛": "ご" },
  さ: { "゛": "ざ" },
  し: { "゛": "じ" },
  す: { "゛": "ず" },
  せ: { "゛": "ぜ" },
  そ: { "゛": "ぞ" },
  た: { "゛": "だ" },
  ち: { "゛": "ぢ" },
  つ: { "゛": "づ", 小: "っ" },
  て: { "゛": "で" },
  と: { "゛": "ど" },
  は: { "゛": "ば", "゜": "ぱ" },
  ひ: { "゛": "び", "゜": "ぴ" },
  ふ: { "゛": "ぶ", "゜": "ぷ" },
  へ: { "゛": "べ", "゜": "ぺ" },
  ほ: { "゛": "ぼ", "゜": "ぽ" },
  や: { 小: "ゃ" },
  ゆ: { 小: "ゅ" },
  よ: { 小: "ょ" },
};

export const getVariant = (
  kana: string,
  decorator: "゛" | "゜" | "小"
): string => {
  if (variants[kana] && variants[kana][decorator]) {
    return variants[kana][decorator];
  }
  return `${kana}${decorator}`;
};

export const canBeDecorated = (
  kana: string,
  decorator: "゛" | "゜" | "小"
): boolean => {
  return !!variants[kana] && !!variants[kana][decorator];
};
