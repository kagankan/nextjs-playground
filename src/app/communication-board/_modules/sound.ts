export const sound = () => {
  const audioCtx = new window.AudioContext();

  const gainNode = audioCtx.createGain();
  // gainNode.connect(audioCtx.destination);
  gainNode.gain.value = 0.1; // 音量
  const nodes = [audioCtx.createOscillator(), audioCtx.createOscillator()];
  const hz = 1700;
  nodes.map((node) => {
    node.type = "sine";
    node.frequency.setValueAtTime(hz, audioCtx.currentTime);
    // node.connect(audioCtx.destination);
    node.connect(gainNode).connect(audioCtx.destination);
  });

  const length = 0.1;
  const rest = 0.025;
  nodes[0].start(audioCtx.currentTime);
  nodes[0].stop(audioCtx.currentTime + length);
  // nodes[1].start(audioCtx.currentTime + length + rest);
  // nodes[1].stop(audioCtx.currentTime + length * 2 + rest);
};
