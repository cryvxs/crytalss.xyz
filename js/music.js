const music = document.getElementById("music");
const muteBtn = document.getElementById("muteBtn");
const muteIcon = muteBtn.querySelector("img");
const volumePopup = document.getElementById("volumePopup");
const volumeSlider = document.getElementById("volumeSlider");
const visualizerCanvas = document.getElementById("visualizer");
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

// Simple cookie helpers (self-contained)
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(name) {
  return document.cookie.split('; ').find(x => x.startsWith(name + '='))?.split('=')[1];
}

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
    const freqIndex = Math.min(bufferLength - 1,
      Math.round(distanceFromCenter * ((bufferLength - 1) / 2) / centerIndex)
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

document.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  if (!muted && music.paused) {
    music.play().catch(() => {});
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
  "Music/GenesisKeys - Short Man's High Ground.mp3",
  "Music/FEX_-_Subways_of_your_mind_(NDR-2_)RADIO_DEMO).mp3",
  "Music/Chuck_Person_-_[untitled].mp3",
  "Music/Girl_Like_Me_(Instrumental).mp3"
];

music.volume = 1;
volumeSlider.value = 100;

// Load saved volume from cookie if present
const savedVol = getCookie('music_vol');
if (savedVol) {
  try {
    const val = parseInt(decodeURIComponent(savedVol), 10);
    if (!Number.isNaN(val)) {
      volumeSlider.value = val;
      music.volume = val / 100;
      console.log('Loaded saved music volume from cookie:', val);
    }
  } catch (e) {}
}

let muted = false;

function formatTrackName(path) {
  const file = path.split("/").pop().split("?")[0];
  const decoded = decodeURIComponent(file.replace(/\+/g, " "));
  return decoded.replace(/\.mp3$/i, "").replace(/_/g, " ");
}

// Marquee variables
let marqueeRAF = null;
let marqueeStart = 0;
let marqueeSpeed = 60; // pixels per second

function stopMarquee() {
  if (marqueeRAF) {
    cancelAnimationFrame(marqueeRAF);
    marqueeRAF = null;
  }
  trackNameInner.style.transform = '';
}

function startMarquee(totalWidth) {
  stopMarquee();
  marqueeStart = performance.now();
  // ensure starting at 0 to avoid visual snapping
  trackNameInner.style.transform = 'translateX(0)';
  function step(now) {
    const elapsed = (now - marqueeStart) / 1000;
    const distance = (elapsed * marqueeSpeed) % totalWidth;
    trackNameInner.style.transform = `translate3d(${-distance}px,0,0)`;
    marqueeRAF = requestAnimationFrame(step);
  }
  marqueeRAF = requestAnimationFrame(step);
}

function updateTrackDisplay() {
  const name = formatTrackName(music.src);
  // If text fits, show plain text and stop marquee
  trackNameInner.style.transform = '';
  trackNameInner.className = '';
  trackNameInner.innerHTML = '';
  trackNameContainer.classList.remove('scrolling');

  // Create two spans for seamless scrolling when needed
  const spanA = document.createElement('span');
  spanA.className = 'm1';
  spanA.textContent = name;
  const spanB = document.createElement('span');
  spanB.className = 'm2';
  spanB.textContent = name;
  trackNameInner.appendChild(spanA);
  trackNameInner.appendChild(spanB);

  // Give browser a tick to layout
  requestAnimationFrame(() => {
    const spanWidth = spanA.offsetWidth;
    const containerWidth = trackNameContainer.clientWidth;
    if (spanWidth > containerWidth) {
      // make inner wide enough (two copies) and start JS marquee
      trackNameContainer.classList.add('scrolling');
      // ensure spans are inline and separated
      spanA.style.display = 'inline-block';
      spanB.style.display = 'inline-block';
      spanB.style.paddingLeft = '48px';
      startMarquee(spanWidth + 48);
    } else {
      // fits: stop marquee and show single text
      stopMarquee();
      trackNameInner.textContent = name;
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
  console.log('Selected random song:', nextSong);
  updateTrackDisplay();
}

setRandomSong();
music.play().catch(() => {});

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
  const value = parseInt(volumeSlider.value, 10);
  const volume = value / 100;
  music.volume = volume;
  // persist to cookie for next visit
  setCookie('music_vol', String(value), 365);
  console.log('Saved music volume to cookie:', value);
});

// Keep the volume popup open while moving between the button and popup
const audioControlEl = document.getElementById('audioControl');
const volumePopupEl = document.getElementById('volumePopup');
let popupTimeout = null;
if (audioControlEl && volumePopupEl) {
  audioControlEl.addEventListener('mouseenter', () => {
    clearTimeout(popupTimeout);
    audioControlEl.classList.add('open');
  });
  audioControlEl.addEventListener('mouseleave', () => {
    popupTimeout = setTimeout(() => audioControlEl.classList.remove('open'), 250);
  });
  volumePopupEl.addEventListener('mouseenter', () => {
    clearTimeout(popupTimeout);
    audioControlEl.classList.add('open');
  });
  volumePopupEl.addEventListener('mouseleave', () => {
    popupTimeout = setTimeout(() => audioControlEl.classList.remove('open'), 250);
  });
}

music.addEventListener("ended", () => {
  setRandomSong();
  if(!muted) {
    music.play().catch(() => {});
  }
});