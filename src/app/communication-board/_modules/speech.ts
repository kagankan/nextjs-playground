const synth = window.speechSynthesis;
const voices = synth.getVoices();

export const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[0];
  utterance.pitch = 1.5;
  utterance.rate = 0.5;
  synth.speak(utterance);
};
