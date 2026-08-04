const music = document.getElementById("music");
const visualizerCanvas = document.getElementById("visualizer");

if (!music || !visualizerCanvas) {
  throw new Error("Music and visualizer elements are required.");
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(music);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const canvasCtx = visualizerCanvas.getContext("2d");

function resizeVisualizer() {
  const ratio = window.devicePixelRatio || 1;
  visualizerCanvas.width = visualizerCanvas.clientWidth * ratio;
  visualizerCanvas.height = visualizerCanvas.clientHeight * ratio;
  canvasCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);

  const width = visualizerCanvas.clientWidth;
  const height = visualizerCanvas.clientHeight;
  canvasCtx.clearRect(0, 0, width, height);

  const barCount = 49;
  let gap = 5;
  const desiredExtra = 5;
  const desiredRatio = 0.95;
  const baseBarWidth = Math.max(2, Math.floor((width - (barCount - 1) * gap) / barCount));
  let barWidth = baseBarWidth + desiredExtra;
  let totalWidth = barCount * barWidth + (barCount - 1) * gap;

  if (totalWidth > width * desiredRatio) {
    const maxAllowedWidth = Math.floor((width * desiredRatio - (barCount - 1) * gap) / barCount);
    barWidth = Math.max(2, maxAllowedWidth);
    totalWidth = barCount * barWidth + (barCount - 1) * gap;
  }

  if (totalWidth > width * desiredRatio) {
    gap = Math.max(2, Math.floor((width * desiredRatio - barCount * barWidth) / (barCount - 1)));
    totalWidth = barCount * barWidth + (barCount - 1) * gap;
  }

  const startX = (width - totalWidth) / 2;
  const centerIndex = (barCount - 1) / 2;
  let x = startX;

  for (let i = 0; i < barCount; i++) {
    const distanceFromCenter = Math.abs(i - centerIndex);
    const freqIndex = Math.min(
      bufferLength - 1,
      Math.round((distanceFromCenter * ((bufferLength - 1) / 2)) / centerIndex)
    );
    const value = Math.max(0, dataArray[freqIndex] - 15) / 240;
    const barHeight = Math.pow(value, 1.6) * height;
    const y = height - barHeight;
    const alpha = 0.18 + value * 0.82;
    canvasCtx.fillStyle = `rgba(255,255,255,${alpha})`;
    canvasCtx.fillRect(x, y, barWidth, barHeight);
    x += barWidth + gap;
  }
}

window.addEventListener("resize", resizeVisualizer);
resizeVisualizer();
drawVisualizer();

const tryPlayMusic = () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  if (music.paused) {
    music.play().catch(() => {});
  }
};

document.addEventListener("click", tryPlayMusic, { once: true });

music.preload = "auto";
music.volume = 0.25;
music.src = "Music/rakuichi.mp3";
music.load();
music.loop = true;
music.play().catch(() => {});

music.addEventListener("ended", () => {
  music.currentTime = 0;
  music.play().catch(() => {});
});
