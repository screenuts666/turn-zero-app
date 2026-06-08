import { settings, applySettingsToUI, initSettingsListeners } from './js/settings.js';
import { playSound, triggerVibration, unlockAudio } from './js/audio.js';
import { getSecureRandomIndex, populateMathContent } from './js/random.js';
import { clearParticles, particles, Particle } from './js/particles.js';
import { addTrail, updateTrail, deactivateTrail, clearTrails, triggerDrawingLoop, updateTrailColor } from './js/trails.js';

// GLOBAL VARIABLES & PALETTE
const colors = [
  "#F9FAF8", // White
  "#0E68AB", // Blue
  "#A64DFF", // Black (Magic Purple for visibility)
  "#D3202A", // Red
  "#00733E", // Green
  "#9CA3AF", // Colorless/Artifact (Elegant Silver/Gray)
  "#F6C644", // Multicolor (Gold)
];

let colorIdx = 0;
let fingers = new Map();
let state = "WAITING";
let countdownInterval;
let timeLeft = settings.countdown;
let isGameActive = false;
let gameMode = "classic";

function secureShuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getSecureRandomIndex(i + 1);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function triggerExplosion(x, y, color) {
  for (let p = 0; p < 35; p++) {
    const angle = (p / 35) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const speed = Math.random() * 5 + 4; // speed in pixels per frame
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    particles.push(new Particle(x, y, color, vx, vy, true));
  }
  triggerDrawingLoop();
}

// DOM Selectors
const msg = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");

const mathBtn = document.getElementById("math-btn");
const mathModal = document.getElementById("math-modal");
const closeMathBtn = document.getElementById("close-math-btn");

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const homeBtn = document.getElementById("home-btn");

// Initialize settings and events
initSettingsListeners();

// START BUTTON HANDLER
startBtn.addEventListener(
  "touchstart",
  (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Safe Fullscreen
    try {
      const docEl = document.documentElement;
      const requestFS =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;

      if (requestFS) {
        requestFS
          .call(docEl)
          .catch((err) => console.log("Fullscreen ignored (normal on iOS)"));
      }
    } catch (error) {
      console.log("Browser does not support Fullscreen API", error);
    }

    // Unlock Audio Context
    unlockAudio();

    // Small confirmation vibration
    triggerVibration(50);

    // Visually start the game
    startScreen.style.opacity = "0";
    setTimeout(() => {
      startScreen.style.display = "none";
      isGameActive = true;
      updateHomeButtonVisibility();
    }, 300);
  },
  { passive: false },
);

// RESTART BUTTON HANDLER
restartBtn.addEventListener(
  "touchstart",
  (e) => {
    e.stopPropagation();
    e.preventDefault();
    resetGame();
  },
  { passive: false },
);

// MAIN TOUCH HANDLER
document.addEventListener(
  "touchstart",
  (e) => {
    if (!isGameActive) return;
    if (state === "ANIMATING" || state === "DONE") return;

    // Don't prevent default on interactive UI buttons
    if (e.target.closest("#restart-btn") || e.target.closest("#math-btn") || e.target.closest("#home-btn")) {
      return;
    }

    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      const el = document.createElement("div");
      el.className = "finger";
      el.style.left = touch.clientX + "px";
      el.style.top = touch.clientY + "px";

      const currentColor = colors[colorIdx % colors.length];
      el.style.backgroundColor = currentColor;
      el.style.color = currentColor;

      document.body.appendChild(el);
      fingers.set(touch.identifier, el);
      colorIdx++;

      // Register and start trail tracking
      addTrail(touch.identifier, touch.clientX, touch.clientY, currentColor);
    }

    playSound("pop");
    triggerVibration(50);

    checkState();
    updateHomeButtonVisibility();
  },
  { passive: false },
);

// MOVEMENT HANDLER
document.addEventListener(
  "touchmove",
  (e) => {
    if (!isGameActive || state === "ANIMATING" || state === "DONE") return;

    // Don't prevent default on interactive UI elements
    if (e.target.closest("#restart-btn") || e.target.closest("#math-btn") || e.target.closest("#home-btn")) {
      return;
    }

    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (fingers.has(touch.identifier)) {
        const el = fingers.get(touch.identifier);
        el.style.left = touch.clientX + "px";
        el.style.top = touch.clientY + "px";

        // Update trail path with the new finger position
        updateTrail(touch.identifier, touch.clientX, touch.clientY);
      }
    }
  },
  { passive: false },
);

// FINGER REMOVAL HANDLER
const removeFinger = (e) => {
  if (!isGameActive) return;

  if (e.target.closest("#restart-btn") || e.target.closest("#math-btn") || e.target.closest("#home-btn")) {
    return;
  }

  e.preventDefault();

  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (fingers.has(touch.identifier)) {
      const el = fingers.get(touch.identifier);
      if (state === "WAITING" || state === "COUNTDOWN") {
        el.remove();
      }
      fingers.delete(touch.identifier);
    }
    // Deactivate the trail so it fades out smoothly
    deactivateTrail(touch.identifier);
  }

  if (state === "WAITING" || state === "COUNTDOWN") {
    if (fingers.size < 2) resetGame();
  }
  updateHomeButtonVisibility();
};

document.addEventListener("touchend", removeFinger, { passive: false });
document.addEventListener("touchcancel", removeFinger, { passive: false });

// STATE CHECK
function checkState() {
  if (fingers.size > 1 && state === "WAITING") {
    state = "COUNTDOWN";
    timeLeft = settings.countdown;
    msg.innerText = timeLeft;

    countdownInterval = setInterval(() => {
      timeLeft--;
      playSound("tic");
      triggerVibration(20);

      if (timeLeft > 0) {
        msg.innerText = timeLeft;
      } else {
        clearInterval(countdownInterval);
        startSelection();
      }
    }, 1000);
  }
}

// WINNER SELECTION & EXPLOSIONS
function startSelection() {
  state = "ANIMATING";
  msg.innerText = "Selecting...";
  updateHomeButtonVisibility();

  const fingerArray = Array.from(fingers.values());
  fingerArray.forEach((el) => el.classList.add("pulsing"));

  setTimeout(() => {
    state = "DONE";

    if (gameMode === "classic") {
      const winnerTouchId = Array.from(fingers.keys())[getSecureRandomIndex(fingers.size)];
      const winnerFinger = fingers.get(winnerTouchId);

      fingers.forEach((el, id) => {
        el.classList.remove("pulsing");
        if (id === winnerTouchId) {
          el.classList.add("winner");
          msg.innerText = "YOU GO FIRST!";
          playSound("win");
          triggerVibration([300, 100, 300]);

          // Trigger particle explosion!
          const x = parseFloat(el.style.left);
          const y = parseFloat(el.style.top);
          const color = el.style.backgroundColor;
          triggerExplosion(x, y, color);

          // Show restart and math flex buttons
          restartBtn.style.display = "inline-flex";
          if (mathBtn) mathBtn.style.display = "block";
        } else {
          el.style.opacity = "0";
          setTimeout(() => el.remove(), 500);
        }
      });

    } else if (gameMode === "teams") {
      // Split into 2 teams: Cyan (#00E5FF) and Magenta (#FF007F)
      const touchIds = Array.from(fingers.keys());
      secureShuffle(touchIds);

      const half = Math.ceil(touchIds.length / 2);
      const teamA = touchIds.slice(0, half);
      const teamB = touchIds.slice(half);

      teamA.forEach((id) => {
        const el = fingers.get(id);
        el.classList.remove("pulsing");
        el.style.backgroundColor = "#00E5FF";
        el.style.color = "#00E5FF";
        el.style.borderColor = "#00E5FF";
        el.innerText = "A";

        // Update corresponding trail color!
        updateTrailColor(id, "#00E5FF");

        // Spawn team explosion
        const x = parseFloat(el.style.left);
        const y = parseFloat(el.style.top);
        triggerExplosion(x, y, "#00E5FF");
      });

      teamB.forEach((id) => {
        const el = fingers.get(id);
        el.classList.remove("pulsing");
        el.style.backgroundColor = "#FF007F";
        el.style.color = "#FF007F";
        el.style.borderColor = "#FF007F";
        el.innerText = "B";

        // Update corresponding trail color!
        updateTrailColor(id, "#FF007F");

        // Spawn team explosion
        const x = parseFloat(el.style.left);
        const y = parseFloat(el.style.top);
        triggerExplosion(x, y, "#FF007F");
      });

      msg.innerText = "TEAMS ASSIGNED!";
      playSound("win");
      triggerVibration([300, 100, 300]);

      restartBtn.style.display = "inline-flex";
      if (mathBtn) mathBtn.style.display = "block";

    } else if (gameMode === "order") {
      // Assign playing order
      const touchIds = Array.from(fingers.keys());
      secureShuffle(touchIds);

      touchIds.forEach((id, idx) => {
        const el = fingers.get(id);
        el.classList.remove("pulsing");
        el.innerText = idx + 1;

        // Spawn order explosion
        const x = parseFloat(el.style.left);
        const y = parseFloat(el.style.top);
        const color = el.style.backgroundColor;
        triggerExplosion(x, y, color);
      });

      msg.innerText = "ORDER DECIDED!";
      playSound("win");
      triggerVibration([300, 100, 300]);

      restartBtn.style.display = "inline-flex";
      if (mathBtn) mathBtn.style.display = "block";
    }

    updateHomeButtonVisibility();
  }, 2000);
}

// FULL RESET
function resetGame() {
  clearInterval(countdownInterval);
  state = "WAITING";

  // Hide buttons
  restartBtn.style.display = "none";
  if (mathBtn) mathBtn.style.display = "none";

  document.querySelectorAll(".finger").forEach((el) => el.remove());
  fingers.clear();
  msg.innerText = "Place your fingers";

  // Reset trails, particles, and canvas
  clearTrails();
  clearParticles();

  updateHomeButtonVisibility();
}

// --- TERMINAL MATH FLEX LOGIC ---
if (mathBtn && mathModal && closeMathBtn) {
  mathBtn.addEventListener(
    "touchstart",
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Build the super nerdy terminal output
      populateMathContent();

      mathModal.style.display = "flex";
      setTimeout(() => (mathModal.style.opacity = "1"), 10);
    },
    { passive: false },
  );

  closeMathBtn.addEventListener(
    "touchstart",
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      mathModal.style.opacity = "0";
      setTimeout(() => (mathModal.style.display = "none"), 200);
    },
    { passive: false },
  );
}

// HOME BUTTON VISIBILITY
function updateHomeButtonVisibility() {
  if (isGameActive && state === "WAITING" && fingers.size === 0) {
    homeBtn.classList.add("visible");
    homeBtn.style.display = "flex";
  } else {
    homeBtn.classList.remove("visible");
    setTimeout(() => {
      if (!homeBtn.classList.contains("visible")) {
        homeBtn.style.display = "none";
      }
    }, 300);
  }
}

// HOME BUTTON CLICK
if (homeBtn) {
  homeBtn.addEventListener(
    "touchstart",
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      isGameActive = false;
      resetGame();

      startScreen.style.display = "flex";
      setTimeout(() => {
        startScreen.style.opacity = "1";
      }, 10);
    },
    { passive: false },
  );
}

// SETTINGS PANEL INTERACTIONS
if (settingsBtn && settingsModal && closeSettingsBtn) {
  settingsBtn.addEventListener(
    "touchstart",
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      applySettingsToUI();
      settingsModal.style.display = "flex";
      setTimeout(() => (settingsModal.style.opacity = "1"), 10);
    },
    { passive: false },
  );

  closeSettingsBtn.addEventListener(
    "touchstart",
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      settingsModal.style.opacity = "0";
      setTimeout(() => (settingsModal.style.display = "none"), 200);
    },
    { passive: false },
  );
}

// MODE SELECTOR BUTTONS BINDINGS
const modeButtons = document.querySelectorAll(".mode-btn");
modeButtons.forEach((btn) => {
  btn.addEventListener(
    "touchstart",
    (e) => {
      e.stopPropagation();
      e.preventDefault();

      // Update active state class
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Set the game mode
      gameMode = btn.getAttribute("data-mode");

      // Trigger a small tactile feedback
      triggerVibration(30);
    },
    { passive: false },
  );
});
