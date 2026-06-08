import { triggerVibration } from './audio.js';

export const SettingsKeys = {
  SOUND: "tr_settings_sound",
  VIBRATION: "tr_settings_vibration",
  COUNTDOWN: "tr_settings_countdown"
};

export const settings = {
  sound: true,
  vibration: true,
  countdown: 5
};

export function loadSettings() {
  const savedSound = localStorage.getItem(SettingsKeys.SOUND);
  const savedVibe = localStorage.getItem(SettingsKeys.VIBRATION);
  const savedCountdown = localStorage.getItem(SettingsKeys.COUNTDOWN);
  
  if (savedSound !== null) settings.sound = savedSound === "true";
  if (savedVibe !== null) settings.vibration = savedVibe === "true";
  if (savedCountdown !== null) settings.countdown = parseInt(savedCountdown, 10);
}

export function saveSettings() {
  localStorage.setItem(SettingsKeys.SOUND, settings.sound);
  localStorage.setItem(SettingsKeys.VIBRATION, settings.vibration);
  localStorage.setItem(SettingsKeys.COUNTDOWN, settings.countdown);
}

export function applySettingsToUI() {
  const soundToggle = document.getElementById("sound-toggle");
  const vibrateToggle = document.getElementById("vibrate-toggle");
  const timerSlider = document.getElementById("timer-slider");
  const timerVal = document.getElementById("timer-val");
  
  if (soundToggle) soundToggle.checked = settings.sound;
  if (vibrateToggle) vibrateToggle.checked = settings.vibration;
  if (timerSlider) timerSlider.value = settings.countdown;
  if (timerVal) timerVal.innerText = settings.countdown + "s";
}

// Initialize settings listeners
export function initSettingsListeners() {
  const soundToggle = document.getElementById("sound-toggle");
  const vibrateToggle = document.getElementById("vibrate-toggle");
  const timerSlider = document.getElementById("timer-slider");
  const timerVal = document.getElementById("timer-val");

  if (soundToggle) {
    soundToggle.addEventListener("change", (e) => {
      settings.sound = e.target.checked;
      saveSettings();
    });
  }

  if (vibrateToggle) {
    vibrateToggle.addEventListener("change", (e) => {
      settings.vibration = e.target.checked;
      saveSettings();
      if (settings.vibration) {
        triggerVibration(50);
      }
    });
  }

  if (timerSlider && timerVal) {
    timerSlider.addEventListener("input", (e) => {
      settings.countdown = parseInt(e.target.value, 10);
      timerVal.innerText = settings.countdown + "s";
      saveSettings();
    });
  }
}
