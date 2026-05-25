const profile = document.querySelector(".profile");
let cooldown = false;

profile.addEventListener("click", () => {
  if(cooldown) return;

  const s = new Audio("Music/secret.mp3");
  s.play().catch(()=>{});

  cooldown = true;
  setTimeout(() => cooldown = false, 3000);
});