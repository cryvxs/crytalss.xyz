let selectedStars = [];
let triangleFormed = false;

function createStars(count){
  for(let i = 0; i < count; i++){
    const star = document.createElement("div");
    star.className = "star";
    star.textContent = "✦";

    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;

    const depth = Math.random(); 
    const speed = 0.2 + depth * 0.8;

    const dx = (Math.random() - 0.5) * speed;
    const dy = (Math.random() - 0.5) * speed;

    const size = 4 + depth * 14;
    star.style.fontSize = size + "px";
    star.style.opacity = 0.2 + depth * 0.8;

    star.style.pointerEvents = "auto";
    star.style.cursor = "default";

    star.addEventListener("click", (e) => {
      e.stopPropagation();
      if(triangleFormed) return;

      // Play flip sound with current volume
      const flipSound = new Audio("Music/flip.mp3");
      const volumeSlider = document.getElementById("volumeSlider");
      flipSound.volume = parseInt(volumeSlider.value, 10) / 100;
      flipSound.play().catch(()=>{});

      if(selectedStars.includes(star)) {
        selectedStars = selectedStars.filter(s => s !== star);
        star.style.color = "";
        star.style.transform = "";
        star.style.transition = "";
      } else if(selectedStars.length < 3) {
        selectedStars.push(star);
        star.style.color = "#FFFFFF";
        star.style.transition = "transform 0.3s ease";
        star.style.transform = "scale(2)";
        clearInterval(star.moveInterval);
      }

      if(selectedStars.length === 3) {
        drawTriangle();
      }
    });

    document.body.appendChild(star);

    const moveInterval = setInterval(() => {
      x += dx;
      y += dy;

      if(x < 0) x = window.innerWidth;
      if(x > window.innerWidth) x = 0;
      if(y < 0) y = window.innerHeight;
      if(y > window.innerHeight) y = 0;

      star.style.left = x + "px";
      star.style.top = y + "px";
    }, 30);
    
    star.moveInterval = moveInterval;
  }
}

function drawTriangle() {
  triangleFormed = true;

  // Play deltarune sound with fade in and volume sync
  const deltaruneSound = new Audio("Music/deltaruneee.mp3");
  const volumeSlider = document.getElementById("volumeSlider");
  const targetVolume = (parseInt(volumeSlider.value, 10) / 100) * 0.5;
  
  deltaruneSound.volume = 0;
  deltaruneSound.play().catch(()=>{});
  
  // Fade in over 1 second
  const fadeInDuration = 1000;
  const fadeInSteps = 50;
  const stepDuration = fadeInDuration / fadeInSteps;
  const volumeIncrement = targetVolume / fadeInSteps;
  
  let currentStep = 0;
  const fadeInterval = setInterval(() => {
    currentStep++;
    deltaruneSound.volume = Math.min(targetVolume, volumeIncrement * currentStep);
    if(currentStep >= fadeInSteps) clearInterval(fadeInterval);
  }, stepDuration);
  
  setTimeout(() => deltaruneSound.pause(), 3700);
  // Disable all star clicking
  document.querySelectorAll(".star").forEach(star => {
    star.style.pointerEvents = "none";
  });

  // Make profile picture look clickable
  const profile = document.querySelector(".profile");
  profile.classList.add("clickable");
  // Create popup
  const popup = document.createElement("div");
  popup.id = "trianglePopup";
  popup.textContent = "something happened...";
  document.body.appendChild(popup);

  // Remove popup after animation completes
  setTimeout(() => popup.remove(), 6000);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.position = "fixed";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "1";
  svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", "triangleBlur");
  const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
  feGaussianBlur.setAttribute("in", "SourceGraphic");
  feGaussianBlur.setAttribute("stdDeviation", "3");
  filter.appendChild(feGaussianBlur);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const lines = [];
  for(let i = 0; i < 3; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke", "#FFFFFF");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("filter", "url(#triangleBlur)");
    line.style.opacity = "1";
    lines.push({ element: line, starIndex1: i, starIndex2: (i + 1) % 3 });
    svg.appendChild(line);
  }

  document.body.appendChild(svg);

  // Update line positions every frame
  const updateInterval = setInterval(() => {
    lines.forEach(({ element, starIndex1, starIndex2 }) => {
      const star1 = selectedStars[starIndex1];
      const star2 = selectedStars[starIndex2];
      
      const rect1 = star1.getBoundingClientRect();
      const rect2 = star2.getBoundingClientRect();
      
      const x1 = rect1.left + rect1.width / 2;
      const y1 = rect1.top + rect1.height / 2;
      const x2 = rect2.left + rect2.width / 2;
      const y2 = rect2.top + rect2.height / 2;

      element.setAttribute("x1", x1);
      element.setAttribute("y1", y1);
      element.setAttribute("x2", x2);
      element.setAttribute("y2", y2);
    });
  }, 30);
}

createStars(50);