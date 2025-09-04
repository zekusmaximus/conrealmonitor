// Checkpoint: Test with devvit playtest in private sub. Verify client-side routing and component rendering.
import './index.css';
import './styles/global.css';

// Type declaration for PWA events
declare global {
  interface Window {
    installPWA: () => void;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';


// PWA install prompt handling
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e: Event) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e as BeforeInstallPromptEvent;
  // Optionally, send analytics event that PWA install promo was shown.
  console.log('PWA install prompt available');
});

window.addEventListener('appinstalled', () => {
  // Hide the app-provided install promotion
  console.log('PWA was installed');
  // Clear the deferredPrompt so it can be garbage collected
  deferredPrompt = null;
  // Optionally, send analytics event to indicate successful install
});

// Function to trigger the install prompt
window.installPWA = () => {
  if (deferredPrompt) {
    void deferredPrompt.prompt();
    void deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
};

// Global error handling for extension context invalidation
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'object' && event.reason.message && event.reason.message.includes('Extension context invalidated')) {
    console.warn('Extension context invalidated error caught and handled gracefully:', event.reason);
    event.preventDefault(); // Prevent the error from propagating and potentially crashing the app
  }
  // Handle web-share origin errors
  if (event.reason && typeof event.reason === 'object' && event.reason.message && event.reason.message.includes('web-share')) {
    console.warn('Web-share API error caught and handled gracefully:', event.reason);
    event.preventDefault();
  }
});

// Also handle general uncaught errors that might be related
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('Extension context invalidated')) {
    console.warn('Extension context invalidated error caught and handled gracefully:', event.message);
    event.preventDefault();
  }
  // Handle web-share origin errors
  if (event.message && event.message.includes('web-share')) {
    console.warn('Web-share API error caught and handled gracefully:', event.message);
    event.preventDefault();
  }
});

// Disable web-share API in webview contexts where it may not be supported
if (window.navigator && 'share' in window.navigator) {
  const originalShare = window.navigator.share;
  window.navigator.share = function(data) {
    // Check if we're in a webview context that doesn't support web-share
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || !window.location.origin) {
      console.warn('Web-share API disabled in current context');
      return Promise.reject(new Error('Web-share API not supported in this context'));
    }
    return originalShare.call(this, data);
  };
}

// Main application entry point with routing setup
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
