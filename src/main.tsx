import React from 'react';
import { createRoot } from 'react-dom/client';
import { PixiAppProvider } from './pixi/PixiAppProvider';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  console.error("Failed to find the root element to mount the React app. Ensure there is a <div id='root'></div> in index.html.");
  throw new Error("Missing '#root' element.");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <PixiAppProvider>
      <App />
    </PixiAppProvider>
  </React.StrictMode>
);
