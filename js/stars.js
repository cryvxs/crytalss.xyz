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

    document.body.appendChild(star);

    setInterval(() => {
      x += dx;
      y += dy;

      if(x < 0) x = window.innerWidth;
      if(x > window.innerWidth) x = 0;
      if(y < 0) y = window.innerHeight;
      if(y > window.innerHeight) y = 0;

      star.style.left = x + "px";
      star.style.top = y + "px";
    }, 30);
  }
}
createStars(50);