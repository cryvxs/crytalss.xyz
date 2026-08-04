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
const discordStatusPill = document.getElementById("discordStatusPill");
const discordStatusText = document.getElementById("discordStatusText");
const discordStatusDot = document.getElementById("discordStatusDot");

function fadeAudio(element, targetVolume, duration) {
  return new Promise(resolve => {
    const startVolume = element.volume;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.volume = startVolume + (targetVolume - startVolume) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };
    animate();
  });
}

function fadeOpacity(element, targetOpacity, duration) {
  return new Promise(resolve => {
    const startOpacity = parseFloat(window.getComputedStyle(element).opacity);
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.style.opacity = startOpacity + (targetOpacity - startOpacity) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };
    animate();
  });
}

async function initializeEasterEgg() {
  const musicElement = document.getElementById("music");

  // Always play the normal music first
  if (musicElement) {
    musicElement.volume = 0;
    musicElement.src = "Music/rakuichi.mp3";
    musicElement.play().catch(e => console.log("Audio autoplay blocked", e));
    await fadeAudio(musicElement, 1, 500);
  }

  // If the easter egg has already been completed, don't show it again
  const easterEggCookie = document.cookie
    .split("; ")
    .find(row => row.startsWith("easterEggViewed="));

  if (easterEggCookie) {
    return;
  }
  
  const easterEggChance = Math.random();
  if (easterEggChance < 1/50) { // 2% chance >:)
    document.body.classList.add("easter-egg");
    if (musicElement) {
      await fadeAudio(musicElement, 0, 500);
      musicElement.src = "Music/chpt5egg.mp3";
      musicElement.play().catch(e => console.log("Audio autoplay blocked", e));
      await fadeAudio(musicElement, 1, 500);
    }
    const faviconLink = document.querySelector('link[rel="icon"]');
    if (faviconLink) {
      faviconLink.href = "Images/egg.png";
    }
    const treeElement = document.getElementById("easter-egg-tree");
    if (treeElement) {
      treeElement.style.display = "block";
      treeElement.addEventListener("click", toggleMan);
    }
  }
}

let easterEggClickCount = 0;
let treeClickCooldown = false;

async function toggleMan() {
  if (treeClickCooldown) return;
  
  treeClickCooldown = true;
  setTimeout(() => {
    treeClickCooldown = false;
  }, 1500);
  
  easterEggClickCount++;
  
  const manElement = document.getElementById("easter-egg-man");
  const man2Element = document.getElementById("easter-egg-man2");
  const man3Element = document.getElementById("easter-egg-man3");
  const treeElement = document.getElementById("easter-egg-tree");
  
  if (easterEggClickCount === 1) {
    // First click: fade in man.png over 1 second, then fade out over 1 second
    if (manElement) {
      manElement.style.display = "block";
      manElement.style.opacity = "0";
      await fadeOpacity(manElement, 1, 1000);
      await fadeOpacity(manElement, 0, 1000);
      manElement.style.display = "none";
    }
  } else if (easterEggClickCount === 2) {
    // Second click: fade in man2.png over 1 second, then fade out over 1 second
    if (man2Element) {
      man2Element.style.display = "block";
      man2Element.style.opacity = "0";
      await fadeOpacity(man2Element, 1, 1000);
      await fadeOpacity(man2Element, 0, 1000);
      man2Element.style.display = "none";
    }
  } else if (easterEggClickCount === 3) {
    // Third click: play egg.mp3 sound effect
    const eggSound = document.getElementById("egg-sound");
    if (eggSound) {
      eggSound.src = "Music/egg.mp3";
      eggSound.play().catch(e => console.log("Sound autoplay blocked", e));
    }
  } else if (easterEggClickCount === 4) {
    // Fourth click: fade in man3.png over 1 second and keep it forever, disable clicks, set cookie
    if (man3Element) {
      man3Element.style.display = "block";
      man3Element.style.opacity = "0";
      await fadeOpacity(man3Element, 1, 1000);
    }
    
    // Set cookie so this easter egg won't trigger again
    const date = new Date();
    date.setFullYear(date.getFullYear() + 10);
    document.cookie = `easterEggViewed=true; expires=${date.toUTCString()}; path=/`;
    
    // Remove click listener
    if (treeElement) {
      treeElement.removeEventListener("click", toggleMan);
    }
  }
}

function getTimeAgoString(timestamp) {
  if (!timestamp) return "";

  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;

  if (secondsAgo < 60) {
    return "just now";
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
    const response = await fetch("/steam-status.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Steam status fetch failed");
    const data = await response.json();

    const nowPlaying = data?.now_playing;
    const currentGame = data?.current_game;
    const recentGame = data?.recent_game;

    if (nowPlaying && currentGame?.name) {
      if (steamStatusElement) steamStatusElement.textContent = "Now Playing";
      if (steamGameElement) steamGameElement.textContent = currentGame.name;
      if (steamDetailElement) steamDetailElement.textContent = "on Steam";
      if (steamArtworkElement) steamArtworkElement.src = currentGame?.img_url || "Images/steam.webp";
    } else if (recentGame?.name) {
      const timeAgo = getTimeAgoString(recentGame?.last_played_timestamp);
      if (steamStatusElement) steamStatusElement.textContent = timeAgo ? `Last played ${timeAgo}` : "Last Played";
      if (steamGameElement) steamGameElement.textContent = recentGame.name;
      if (steamDetailElement) steamDetailElement.textContent = "on Steam";
      if (steamArtworkElement) steamArtworkElement.src = recentGame?.img_url || "Images/steam.webp";
    } else {
      if (steamStatusElement) steamStatusElement.textContent = "Steam status";
      if (steamGameElement) steamGameElement.textContent = "no recent games found";
      if (steamDetailElement) steamDetailElement.textContent = "";
      if (steamArtworkElement) steamArtworkElement.src = "Images/steam.webp";
    }

    if (steamLinkElement && data?.profile_url) {
      steamLinkElement.href = data.profile_url;
    }
  } catch (error) {
    if (steamStatusElement) steamStatusElement.textContent = "Steam unavailable";
    if (steamGameElement) steamGameElement.textContent = "unable to load status";
    if (steamDetailElement) steamDetailElement.textContent = "";
    if (steamArtworkElement) steamArtworkElement.src = "Images/steam.webp";
    console.error("Steam status fetch failed", error);
  }
}

function updateDiscordStatus() {
  fetch("/discord-status.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const now = new Date();
      const hours = now.getHours();
      const schedule = data?.schedule;
      const startHour = Number(schedule?.startHour ?? 12);
      const endHour = Number(schedule?.endHour ?? 2);
      const isOnline = hours >= startHour || hours < endHour;

      if (discordStatusPill) {
        discordStatusPill.dataset.status = isOnline ? "online" : "offline";
      }

      if (discordStatusText) {
        discordStatusText.textContent = isOnline ? "online" : "offline";
      }
    })
    .catch(() => {
      if (discordStatusPill) {
        discordStatusPill.dataset.status = "offline";
      }
      if (discordStatusText) {
        discordStatusText.textContent = "offline";
      }
    });
}

initializeEasterEgg();
updateLastFM();
updateSteamStatus();
updateDiscordStatus();
setInterval(updateLastFM, 15000);
setInterval(updateSteamStatus, 30000);
setInterval(updateDiscordStatus, 30000);