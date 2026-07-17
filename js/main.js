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

if (input && sendBtn && typingSound && listeningText) {
  if(getCookie("sent")){
    input.disabled = true;
    sendBtn.disabled = true;
    input.placeholder = "you already sent a message";
  }

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
}

const API_KEY = "2e10e484bd9c85a23b21304276c2eb76";
const USERNAME = "crystalvxs";
const lastfmStatusElement = document.getElementById("lastfmStatus");
const lastfmTrackElement = document.getElementById("lastfmTrack");
const lastfmArtistElement = document.getElementById("lastfmArtist");
const lastfmArtworkElement = document.getElementById("lastfmArtwork");
const steamStatusElement = document.getElementById("steamStatus");
const steamGameElement = document.getElementById("steamGame");
const steamDetailElement = document.getElementById("steamDetail");
const steamArtworkElement = document.getElementById("steamArtwork");
const steamLinkElement = document.getElementById("steamLink");

function getTimeAgoString(timestamp) {
  if (!timestamp) return '';
  
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;
  
  if (secondsAgo < 60) {
    return 'just now';
  } else if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes}m ago`;
  } else if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours}h ago`;
  } else if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days}d ago`;
  } else {
    const weeks = Math.floor(secondsAgo / 604800);
    return `${weeks}w ago`;
  }
}

async function updateLastFM() {
  if (!lastfmTrackElement) return;
  if (!API_KEY) {
    lastfmTrackElement.textContent = "last.fm key not set";
    return;
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(USERNAME)}&api_key=${API_KEY}&format=json&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    const recentTracks = data.recenttracks?.track;
    const track = Array.isArray(recentTracks) ? recentTracks[0] : recentTracks;

    if (!track) {
      if (lastfmStatusElement) lastfmStatusElement.textContent = "No recent track";
      if (lastfmTrackElement) lastfmTrackElement.textContent = "nothing found yet";
      if (lastfmArtistElement) lastfmArtistElement.textContent = "check your Last.fm profile";
      if (lastfmArtworkElement) lastfmArtworkElement.src = "Images/lastfm.png";
      return;
    }

    const artist = track.artist?.["#text"] || "unknown artist";
    const song = track.name || "unknown track";
    const nowPlaying = track["@attr"]?.nowplaying === "true";
    const artwork = track.image?.[3]?.["#text"] || track.image?.[track.image.length - 1]?.["#text"] || "Images/lastfm.png";
    const truncatedSong = song.length > 25 ? `${song.slice(0, 25)}..` : song;
    const timestamp = track.date?.uts;

    let statusText = "Now Playing";
    if (!nowPlaying && timestamp) {
      const timeAgo = getTimeAgoString(parseInt(timestamp));
      statusText = `Last played ${timeAgo}`;
    } else if (!nowPlaying) {
      statusText = "Last Played";
    }

    if (lastfmStatusElement) lastfmStatusElement.textContent = statusText;
    if (lastfmTrackElement) lastfmTrackElement.textContent = truncatedSong;
    if (lastfmArtistElement) lastfmArtistElement.textContent = artist;
    if (lastfmArtworkElement && artwork) lastfmArtworkElement.src = artwork;
  } catch (error) {
    if (lastfmStatusElement) lastfmStatusElement.textContent = "Last.fm unavailable";
    if (lastfmTrackElement) lastfmTrackElement.textContent = "try again later";
    if (lastfmArtistElement) lastfmArtistElement.textContent = "";
    if (lastfmArtworkElement) lastfmArtworkElement.src = "Images/lastfm.png";
    console.error("Last.fm fetch failed", error);
  }
}

async function updateSteamStatus() {
  if (!steamGameElement) return;

  try {
    const response = await fetch('/steam-status.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Steam status fetch failed');
    const data = await response.json();

    const nowPlaying = data?.now_playing;
    const currentGame = data?.current_game;
    const recentGame = data?.recent_game;

    if (nowPlaying && currentGame?.name) {
      steamStatusElement.textContent = 'Now Playing';
      steamGameElement.textContent = currentGame.name;
      steamDetailElement.textContent = 'on Steam';
      steamArtworkElement.src = currentGame?.img_url || 'Images/steam.webp';
    } else if (recentGame?.name) {
      const timeAgo = getTimeAgoString(recentGame?.last_played_timestamp);
      steamStatusElement.textContent = timeAgo ? `Last played ${timeAgo}` : 'Last Played';
      steamGameElement.textContent = recentGame.name;
      steamDetailElement.textContent = 'on Steam';
      steamArtworkElement.src = recentGame?.img_url || 'Images/steam.webp';
    } else {
      steamStatusElement.textContent = 'Steam status';
      steamGameElement.textContent = 'no recent games found';
      steamDetailElement.textContent = '';
      steamArtworkElement.src = 'Images/steam.webp';
    }

    if (steamLinkElement && data?.profile_url) {
      steamLinkElement.href = data.profile_url;
    }
  } catch (error) {
    if (steamStatusElement) steamStatusElement.textContent = 'Steam unavailable';
    if (steamGameElement) steamGameElement.textContent = 'unable to load status';
    if (steamDetailElement) steamDetailElement.textContent = '';
    if (steamArtworkElement) steamArtworkElement.src = 'Images/steam.webp';
    console.error('Steam status fetch failed', error);
  }
}

updateLastFM();
updateSteamStatus();
setInterval(updateLastFM, 15000); // refresh every 15 seconds
setInterval(updateSteamStatus, 30000); // refresh every 30 seconds