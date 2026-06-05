const music = document.getElementById("music");
const muteBtn = document.getElementById("muteBtn");
const muteIcon = muteBtn.querySelector("img");
const volumePopup = document.getElementById("volumePopup");
const volumeSlider = document.getElementById("volumeSlider");
const visualizerCanvas = document.getElementById("visualizer");
const trackNameInner = document.getElementById("trackNameInner");
const trackNameContainer = document.getElementById("trackName");
const trackNameInner = document.getElementById("trackNameInner");
const trackNameContainer = document.getElementById("trackName");

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

  const barCount = 89;
  let gap = 3;
  const desiredExtra = 2;
  const desiredRatio = 0.95;
  const baseBarWidth = Math.max(1, Math.floor((width - (barCount - 1) * gap) / barCount));
  let barWidth = baseBarWidth + desiredExtra;
  let totalWidth = barCount * barWidth + (barCount - 1) * gap;

  if (totalWidth > width * desiredRatio) {
    const maxAllowedWidth = Math.floor((width * desiredRatio - (barCount - 1) * gap) / barCount);
    barWidth = Math.max(1, maxAllowedWidth);
    totalWidth = barCount * barWidth + (barCount - 1) * gap;
  }

  if (totalWidth > width * desiredRatio) {
    gap = Math.max(1, Math.floor((width * desiredRatio - barCount * barWidth) / (barCount - 1)));
    totalWidth = barCount * barWidth + (barCount - 1) * gap;
  }

  const startX = (width - totalWidth) / 2;
  const centerIndex = (barCount - 1) / 2;
  let x = startX;

  for (let i = 0; i < barCount; i++) {
    const distanceFromCenter = Math.abs(i - centerIndex);
    const freqIndex = Math.min(bufferLength - 1,
      Math.round(distanceFromCenter * ((bufferLength - 1) / 2) / centerIndex)
    );
    const value = Math.max(0, dataArray[freqIndex] - 15) / 240;
    const normalizedDistance = distanceFromCenter / centerIndex;
    const distanceFactor = Math.max(0.03, Math.pow(1 - normalizedDistance, 2.5));
    const dampedValue = value * distanceFactor;
    const barHeight = Math.pow(dampedValue, 1.6) * height;
    const y = height - barHeight;
    const alpha = 0.18 + dampedValue * 0.82;
    canvasCtx.fillStyle = `rgba(255,255,255,${alpha})`;
    canvasCtx.fillRect(x, y, barWidth, barHeight);
    x += barWidth + gap;
  }
}

window.addEventListener("resize", resizeVisualizer);
resizeVisualizer();
drawVisualizer();

document.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
});

const songs = [
  "Music/Spamton.mp3",
  "Music/A_Home_For_Flowers_Empty.mp3",
  "Music/Lost_Library.mp3",
  "Music/Nintendo_Wi-Fi_Connection.mp3",
  "Music/6AM_Rainy_ACNH_OST.mp3",
  "Music/Bubblaine_Underwater.mp3",
  "Music/January_Fourteenth.mp3",
  "Music/GenesisKeys_-_Short_Man's_High_Ground.mp3",
  "Music/FEX_-_Subways_of_your_mind_(NDR-2_)RADIO_DEMO).mp3",
  "Music/Chuck_Person_-_[untitled].mp3",
  "Music/Girl_Like_Me_(Instrumental).mp3"
];

music.volume = 1;
volumeSlider.value = 100;

let muted = false;

function formatTrackName(path) {
  const file = path.split("/").pop().split("?")[0];
  return file.replace(/\.mp3$/i, "");
}

function updateTrackDisplay() {
  const name = formatTrackName(music.src);
  trackNameInner.textContent = name;
  trackNameContainer.classList.remove("scrolling");
  requestAnimationFrame(() => {
    if (trackNameInner.scrollWidth > trackNameContainer.clientWidth) {
      trackNameContainer.classList.add("scrolling");
    }
  });
}

function setRandomSong() {
  const currentFile = music.src.split("/").pop().split("?")[0];
  let nextSong = songs[Math.floor(Math.random() * songs.length)];
  while (songs.length > 1 && nextSong.split("/").pop() === currentFile) {
    nextSong = songs[Math.floor(Math.random() * songs.length)];
  }
  music.src = nextSong;
  updateTrackDisplay();
}

setRandomSong();

muteBtn.addEventListener("click", () => {
  if(!muted) {
    music.pause();
    muteIcon.src = "Images/mute.png";
    muted = true;
  } else {
    music.play().catch(() => {});
    muteIcon.src = "Images/unmute.png";
    muted = false;
  }
});

volumeSlider.addEventListener("input", () => {
  const volume = volumeSlider.value / 100;
  music.volume = volume;
});

music.addEventListener("ended", () => {
  setRandomSong();
  if(!muted) {
    music.play().catch(() => {});
  }
});