// Page elements
const spotifyStatusElement = document.getElementById("spotifyStatus");
const spotifyTrackElement = document.getElementById("spotifyTrack");
const spotifyArtistElement = document.getElementById("spotifyArtist");
const spotifyArtworkElement = document.getElementById("spotifyArtwork");
const spotifyLinkElement = document.getElementById("spotifyLink");
const steamStatusElement = document.getElementById("steamStatus");
const steamGameElement = document.getElementById("steamGame");
const steamDetailElement = document.getElementById("steamDetail");
const steamArtworkElement = document.getElementById("steamArtwork");
const steamLinkElement = document.getElementById("steamLink");
const recentGamesElement = document.getElementById("recentGames");
const profileEmojiElement = document.getElementById("profileEmoji");
const faviconElement = document.querySelector('link[rel="icon"]');
const messageForm = document.getElementById("messageForm");
const messageTextElement = document.getElementById("messageText");
const messageFormStatusElement = document.getElementById("messageFormStatus");
const MESSAGE_ENDPOINT = "https://crytalss-message-relay.noahkaminskyg.workers.dev";
const MESSAGE_COOLDOWN_COOKIE = "messageCooldownUntil";
const MESSAGE_COOLDOWN_MS = 60 * 60 * 1000;

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

// Spotify status
async function updateSpotifyStatus() {
  if (!spotifyTrackElement) return;
  try {
    const response = await fetch("/spotify-status.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Spotify status fetch failed");
    const data = await response.json();
    const track = data?.track;
    if (!track?.name) {
      if (spotifyStatusElement) spotifyStatusElement.textContent = "Spotify status";
      if (spotifyTrackElement) spotifyTrackElement.textContent = "nothing playing yet";
      if (spotifyArtistElement) spotifyArtistElement.textContent = "open Spotify and start listening";
      if (spotifyArtworkElement) {
        spotifyArtworkElement.src = "Images/spotify.png";
        spotifyArtworkElement.style.display = "none";
      }
      if (spotifyLinkElement) spotifyLinkElement.href = "https://open.spotify.com/";
      return;
    }

    let statusText = "Last Played";
    if (data.now_playing) {
      statusText = "Now Playing";
    } else if (data.paused) {
      statusText = "Paused";
    } else if (track.played_at) {
      const playedAt = Math.floor(Date.parse(track.played_at) / 1000);
      const timeAgo = getTimeAgoString(playedAt);
      if (timeAgo) statusText = `Last played ${timeAgo}`;
    }

    if (spotifyStatusElement) spotifyStatusElement.textContent = statusText;
    if (spotifyTrackElement) spotifyTrackElement.textContent = track.name;
    if (spotifyArtistElement) spotifyArtistElement.textContent = track.artists || "unknown artist";
    if (spotifyArtworkElement) {
      if (track.artwork_url) {
        spotifyArtworkElement.src = track.artwork_url;
        spotifyArtworkElement.style.display = "block";
      } else {
        spotifyArtworkElement.src = "Images/spotify.png";
        spotifyArtworkElement.style.display = "none";
      }
    }
    if (spotifyLinkElement) spotifyLinkElement.href = track.url || "https://open.spotify.com/";
  } catch (error) {
    if (spotifyStatusElement) spotifyStatusElement.textContent = "Spotify unavailable";
    if (spotifyTrackElement) spotifyTrackElement.textContent = "try again later";
    if (spotifyArtistElement) spotifyArtistElement.textContent = "";
    if (spotifyArtworkElement) {
      spotifyArtworkElement.src = "Images/spotify.png";
      spotifyArtworkElement.style.display = "none";
    }
    if (spotifyLinkElement) spotifyLinkElement.href = "https://open.spotify.com/";
    console.error("Spotify status fetch failed", error);
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

if (messageForm && messageTextElement && messageFormStatusElement) {
  function getMessageCooldownRemaining() {
    const cookie = document.cookie.split("; ").find(value => value.startsWith(`${MESSAGE_COOLDOWN_COOKIE}=`));
    if (!cookie) return 0;

    const cooldownUntil = Number(cookie.slice(MESSAGE_COOLDOWN_COOKIE.length + 1));
    if (!Number.isFinite(cooldownUntil)) return 0;

    const remaining = cooldownUntil - Date.now();
    if (remaining <= 0) {
      document.cookie = `${MESSAGE_COOLDOWN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
      return 0;
    }
    return remaining;
  }

  function setMessageCooldown() {
    const cooldownUntil = Date.now() + MESSAGE_COOLDOWN_MS;
    document.cookie = `${MESSAGE_COOLDOWN_COOKIE}=${cooldownUntil}; Max-Age=3600; Path=/; SameSite=Lax; Secure`;
  }

  function formatMessageCooldown(remaining) {
    const minutes = Math.ceil(remaining / 60000);
    return `please wait ${minutes} minute${minutes === 1 ? "" : "s"} before sending another message.`;
  }

  const initialCooldown = getMessageCooldownRemaining();
  if (initialCooldown > 0) {
    messageFormStatusElement.textContent = formatMessageCooldown(initialCooldown);
  }

  messageForm.addEventListener("submit", async event => {
    event.preventDefault();
    const cooldownRemaining = getMessageCooldownRemaining();
    if (cooldownRemaining > 0) {
      messageFormStatusElement.textContent = formatMessageCooldown(cooldownRemaining);
      return;
    }

    const message = messageTextElement.value.trim();
    if (!message) {
      messageTextElement.focus();
      return;
    }
    if (!MESSAGE_ENDPOINT) {
      alert("The message form isn't connected yet.");
      return;
    }

    const submitButton = messageForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    messageFormStatusElement.textContent = "sending…";

    try {
      const response = await fetch(MESSAGE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          website: messageForm.elements.website.value
        })
      });
      if (!response.ok) throw new Error(`Message submission failed (${response.status})`);
      setMessageCooldown();
      messageTextElement.value = "";
      messageFormStatusElement.textContent = `message sent, thank you! ${formatMessageCooldown(MESSAGE_COOLDOWN_MS)}`;
    } catch (error) {
      messageFormStatusElement.textContent = "couldn't send your message. please try again later.";
      console.error("Message submission failed", error);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

// Initial load and periodic status refreshes
initializeEasterEgg();
updateSpotifyStatus();
updateSteamStatus();
setInterval(updateSpotifyStatus, 30000);
setInterval(updateSteamStatus, 30000);
