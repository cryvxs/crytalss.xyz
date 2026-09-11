// Service configuration
const API_KEY = "2e10e484bd9c85a23b21304276c2eb76";
const USERNAME = "crystalvxs";

// Page elements
const lastfmStatusElement = document.getElementById("lastfmStatus");
const lastfmTrackElement = document.getElementById("lastfmTrack");
const lastfmArtistElement = document.getElementById("lastfmArtist");
const lastfmArtworkElement = document.getElementById("lastfmArtwork");
const steamStatusElement = document.getElementById("steamStatus");
const steamGameElement = document.getElementById("steamGame");
const steamDetailElement = document.getElementById("steamDetail");
const steamArtworkElement = document.getElementById("steamArtwork");
const steamLinkElement = document.getElementById("steamLink");
const recentGamesElement = document.getElementById("recentGames");
const profileEmojiElement = document.getElementById("profileEmoji");
const faviconElement = document.querySelector('link[rel="icon"]');

// Profile emoji and favicon
const profileEmojis = [
  "Images/emoji.png",
  "Images/bigsunsmallcloud.png",
  "Images/cloudy.png",
  "Images/rainy.png",
  "Images/snowy.png",
  "Images/stormy.png"
];

if (profileEmojiElement) {
  const randomEmoji = profileEmojis[Math.floor(Math.random() * profileEmojis.length)];
  profileEmojiElement.src = randomEmoji;
  if (faviconElement) faviconElement.href = randomEmoji;
}

// Shared animation helper
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

// Easter egg
function initializeEasterEgg() {
  // If the easter egg has been completed, don't show again
  const easterEggCookie = document.cookie
    .split("; ")
    .find(row => row.startsWith("easterEggViewed="));

  if (easterEggCookie) {
    return;
  }
  
  const easterEggChance = Math.random();
  if (easterEggChance < 1/50) { // 2% chance >:)
    document.body.classList.add("easter-egg");
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
    // Third click: fade in man3.png and keep it visible, then disable clicks.
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

// Shared time formatting
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

// Last.fm status
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
      if (lastfmArtworkElement) lastfmArtworkElement.style.display = "none";
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
    if (lastfmArtworkElement && artwork) {
      lastfmArtworkElement.src = artwork;
      lastfmArtworkElement.style.display = "block";
    }
  } catch (error) {
    if (lastfmStatusElement) lastfmStatusElement.textContent = "Last.fm unavailable";
    if (lastfmTrackElement) lastfmTrackElement.textContent = "try again later";
    if (lastfmArtistElement) lastfmArtistElement.textContent = "";
    if (lastfmArtworkElement) {
      lastfmArtworkElement.src = "Images/lastfm.png";
      lastfmArtworkElement.style.display = "none";
    }
    console.error("Last.fm fetch failed", error);
  }
}

// Steam status and recently played games
async function updateSteamStatus() {
  if (!steamGameElement) return;

  try {
    const response = await fetch("/steam-status.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Steam status fetch failed");
    const data = await response.json();

    const nowPlaying = data?.now_playing;
    const currentGame = data?.current_game;
    const recentGame = data?.recent_game;
    const recentGames = Array.isArray(data?.recent_games) ? data.recent_games : recentGame ? [recentGame] : [];

    if (recentGamesElement) {
      recentGamesElement.replaceChildren();
      recentGames.slice(0, 4).forEach(game => {
        if (!game?.appid || !game?.name) return;

        const gameLink = document.createElement("a");
        gameLink.className = "recent-game-row";
        gameLink.href = `https://store.steampowered.com/app/${game.appid}/`;
        gameLink.target = "_blank";
        gameLink.rel = "noreferrer noopener";

        const gameImage = document.createElement("img");
        gameImage.src = game.img_url || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`;
        gameImage.alt = `${game.name} artwork`;
        gameLink.appendChild(gameImage);

        recentGamesElement.appendChild(gameLink);
      });
    }

    if (nowPlaying && currentGame?.name) {
      if (steamStatusElement) steamStatusElement.textContent = "Now Playing";
      if (steamGameElement) steamGameElement.textContent = currentGame.name;
      if (steamDetailElement) steamDetailElement.textContent = "on Steam";
      if (steamArtworkElement) {
        if (currentGame?.img_url) {
          steamArtworkElement.src = currentGame.img_url;
          steamArtworkElement.style.display = "block";
        } else {
          steamArtworkElement.style.display = "none";
        }
      }
    } else if (recentGame?.name) {
      const timeAgo = getTimeAgoString(recentGame?.last_played_timestamp);
      if (steamStatusElement) steamStatusElement.textContent = timeAgo ? `Last played ${timeAgo}` : "Last Played";
      if (steamGameElement) steamGameElement.textContent = recentGame.name;
      if (steamDetailElement) steamDetailElement.textContent = "on Steam";
      if (steamArtworkElement) {
        if (recentGame?.img_url) {
          steamArtworkElement.src = recentGame.img_url;
          steamArtworkElement.style.display = "block";
        } else {
          steamArtworkElement.style.display = "none";
        }
      }
    } else {
      if (steamStatusElement) steamStatusElement.textContent = "Steam status";
      if (steamGameElement) steamGameElement.textContent = "no recent games found";
      if (steamDetailElement) steamDetailElement.textContent = "";
      if (steamArtworkElement) {
        steamArtworkElement.src = "Images/steam.webp";
        steamArtworkElement.style.display = "none";
      }
    }

    if (steamLinkElement && data?.profile_url) {
      steamLinkElement.href = data.profile_url;
    }
  } catch (error) {
    if (steamStatusElement) steamStatusElement.textContent = "Steam unavailable";
    if (steamGameElement) steamGameElement.textContent = "unable to load status";
    if (steamDetailElement) steamDetailElement.textContent = "";
    if (steamArtworkElement) {
      steamArtworkElement.src = "Images/steam.webp";
      steamArtworkElement.style.display = "none";
    }
    console.error("Steam status fetch failed", error);
  }
}

// Initial load and periodic status refreshes
initializeEasterEgg();
updateLastFM();
updateSteamStatus();
setInterval(updateLastFM, 15000);
setInterval(updateSteamStatus, 30000);
