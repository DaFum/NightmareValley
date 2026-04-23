import React from 'react';
import { createRoot } from 'react-dom/client';
import { PixiAppProvider } from './pixi/PixiAppProvider';
import App from './App';
import AppProviders from './app/providers/AppProviders';

// Global debugging helpers: capture unhandled promise rejections and errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (ev) => {
    // ev.reason is often an Event for image load failures
    // Log both reason and the full event to aid debugging
    // eslint-disable-next-line no-console
    console.error('Unhandled promise rejection detected:', ev.reason, ev);
  });

  window.addEventListener('error', (ev) => {
    // eslint-disable-next-line no-console
    console.error('Global error event:', ev);
  });
}

const container = document.getElementById('root');
if (!container) {
  console.error("Failed to find the root element to mount the React app. Ensure there is a <div id='root'></div> in index.html.");
  throw new Error("Missing '#root' element.");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AppProviders>
      <PixiAppProvider>
        <App />
      </PixiAppProvider>
    </AppProviders>
  </React.StrictMode>
);
