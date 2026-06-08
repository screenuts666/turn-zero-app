import { initGame } from './js/game.js';

// Initialize the game
initGame();

// Register Service Worker for offline support / Google Play Store APK
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}
