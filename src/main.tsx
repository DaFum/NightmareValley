import React from 'react';
import { createRoot } from 'react-dom/client';
import { PixiAppProvider } from './pixi/PixiAppProvider';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <PixiAppProvider>
        <App />
      </PixiAppProvider>
    </React.StrictMode>
  );
}
