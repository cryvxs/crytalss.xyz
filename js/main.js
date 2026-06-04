const overlay = document.getElementById("overlay");
const input = document.getElementById("userMessage");
const sendBtn = document.getElementById("sendBtn");
const typingSound = document.getElementById("typingSound");
const listeningText = document.getElementById("listeningText");

const webhookURL = "https://discord.com/api/webhooks/1491511317700280440/oeLyXzuw63xDE2qhDeM7aQyIYS8uTTsQN_vygEZF8lZNDzlOILyEzDlWt0rH5AiUeuLB";

let unlocked = false;
let typingTimeout;

function setCookie(name, value, days){
  const d = new Date();
  d.setTime(d.getTime() + days*24*60*60*1000);
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/`; 
}

function getCookie(name){
  return document.cookie.split("; ").find(x => x.startsWith(name+"="))?.split("=")[1];
}

if(getCookie("sent")){
  input.disabled = true;
  sendBtn.disabled = true;
  input.placeholder = "you already sent a message";
}

function handleOverlayClick() {
  console.log("Overlay clicked!");
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  setTimeout(() => overlay.remove(), 500);

  music.play().catch(()=>{});
  unlocked = true;

  if(!getCookie("sent")){
    input.disabled = false;
    sendBtn.disabled = false;
  }
}

overlay.addEventListener("click", handleOverlayClick);

input.addEventListener("input", () => {
  if(!unlocked || getCookie("sent")) return;

  typingSound.currentTime = 0;
  typingSound.play().catch(()=>{});

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => typingSound.pause(), 200);
});

sendBtn.addEventListener("click", async () => {
  if(!unlocked || getCookie("sent")) return;

  let msg = input.value.trim();
  if(!msg) return;

  listeningText.classList.add("show");

  await fetch(webhookURL, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ content: msg })
  });

  setCookie("sent", "true", 365);

  input.value = "";
  input.disabled = true;
  sendBtn.disabled = true;
  input.placeholder = "you already sent a message";
  
  setTimeout(() => listeningText.classList.remove("show"), 3000);
});