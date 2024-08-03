import { atom } from "jotai";

// 注視によるクリックまでの長さ
export const attentionDurationAtom = atom(1000);

export const enableAttentionAtom = atom(true);
export const enableClickAtom = atom(true);
