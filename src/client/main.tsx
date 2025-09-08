// Global error handling for extension context invalidation and orphaned iframe errors
window.onunhandledrejection = (event) => {
  console.log('Unhandled promise rejection detected:', event.reason);
  const reasonStr = typeof event.reason === 'string' ? event.reason : (event.reason && typeof event.reason === 'object' && event.reason.message ? event.reason.message : '');
  console.log('Reason type:', typeof event.reason, 'Reason string:', reasonStr);
  if (reasonStr.toLowerCase().includes('extension context invalidated')) {
    console.warn('Extension context invalidated error caught and handled gracefully:', event.reason);
    event.preventDefault(); // Prevent the error from propagating and potentially crashing the app
  }
  if (reasonStr.toLowerCase().includes('web-share')) {
    console.warn('Web-share API error caught and handled gracefully:', event.reason);
    event.preventDefault();
  }
  if (reasonStr.toLowerCase().includes('orphaned iframed')) {
    console.warn('Orphaned iframed error caught and handled gracefully:', event.reason);
    event.preventDefault();
  }
};

// Also handle general uncaught errors that might be related
window.onerror = (message, source, lineno, colno, error) => {
  console.log('Uncaught error detected:', message);
  const messageStr = typeof message === 'string' ? message : String(message);
  console.log('Error message:', messageStr);
  if (messageStr.toLowerCase().includes('extension context invalidated')) {
    console.warn('Extension context invalidated error caught and handled gracefully:', message);
    return true; // Prevent default error handling
  }
  if (messageStr.toLowerCase().includes('web-share')) {
    console.warn('Web-share API error caught and handled gracefully:', message);
    return true;
  }
  if (messageStr.toLowerCase().includes('orphaned iframed')) {
    console.warn('Orphaned iframed error caught and handled gracefully:', message);
    return true;
  }
  // For other errors, allow default handling
  return false;
};

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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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
    console.log('Triggering PWA install prompt');
    void deferredPrompt.prompt();
    void deferredPrompt.userChoice.then((choiceResult) => {
      console.log('PWA install prompt choice:', choiceResult.outcome);
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    }).catch((error) => {
      console.error('PWA install prompt error:', error);
    });
  }
};

// Main application entry point with routing setup
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </StrictMode>
);
