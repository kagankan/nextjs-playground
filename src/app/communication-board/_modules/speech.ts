let isPlayingForce = false;

export const speak = (
  text: string,
  options?: {
    pitch?: number;
    rate?: number;
    volume?: number;
    // 中断させずに終わるまで再生する
    forcePlay?: boolean;
  }
) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return;
  }

  if (!text) {
    return;
  }

  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[0];
  utterance.pitch = options?.pitch ?? 1.5;
  utterance.rate = options?.rate ?? 1;
  utterance.volume = options?.volume ?? 1;

  if (!isPlayingForce) {
    synth.cancel();
    if (options?.forcePlay) {
      isPlayingForce = true;
      utterance.addEventListener("end", () => {
        isPlayingForce = false;
      });
    }
    synth.speak(utterance);
  }
};
