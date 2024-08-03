export const speak = (text: string) => {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return;
  }
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[0];
  utterance.pitch = 1.5;
  utterance.rate = 0.5;
  synth.speak(utterance);
};
