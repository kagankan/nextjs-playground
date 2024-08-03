export const speak = (text: string) => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  console.log(voices);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voices[0];
  synth.speak(utterance);
};
