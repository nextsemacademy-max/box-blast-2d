import { BlockBlastGame } from './engine/Game';

// Initialize Game Engine
window.addEventListener('DOMContentLoaded', () => {
  new BlockBlastGame();
});

// Register Service Worker for Offline PWA Support
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('[Box Blast 2D] Service Worker active, offline enabled:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Box Blast 2D] Service Worker registration skipped:', err);
      });
  });
}
