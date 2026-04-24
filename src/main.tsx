import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Logger } from './lib/logger';

// Global debugging helpers: capture unhandled promise rejections and errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (ev) => {
    if (import.meta.env.DEV && ev.reason instanceof Event && !('message' in ev.reason)) {
      return;
    }
    Logger.error('Unhandled promise rejection detected:', ev.reason, ev);
  });

  window.addEventListener('error', (ev) => {
    Logger.error('Global error event:', ev);
  });
}

const container = document.getElementById('root');
if (!container) {
  Logger.error("Failed to find the root element to mount the React app. Ensure there is a <div id='root'></div> in index.html.");
  throw new Error("Missing '#root' element.");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
