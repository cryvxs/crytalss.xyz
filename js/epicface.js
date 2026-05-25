const epicFace = document.getElementById("epicFace");
let epicCooldown = false;

epicFace.addEventListener("click", () => {
  if(epicCooldown) return;
  epicCooldown = true;

  const s = new Audio("Music/heyapple.mp3");
  s.play().catch(()=>{});

  setTimeout(() => {
    location.reload();
  }, 4000);
});