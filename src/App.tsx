import React from 'react';
import { RootLayout } from './app/layout/RootLayout';
import { GameRoute } from './app/routes/GameRoute';
import NotFoundRoute from './app/routes/NotFoundRoute';
import './styles/globals.css';
import './styles/ui.css';

const DEBUG_ROUTE_ENABLED =
  typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

export function App() {
  const [path, setPath] = React.useState(getCurrentPath);

  React.useEffect(() => {
    const updatePath = () => setPath(getCurrentPath());
    window.addEventListener('popstate', updatePath);
    window.addEventListener('hashchange', updatePath);
    return () => {
      window.removeEventListener('popstate', updatePath);
      window.removeEventListener('hashchange', updatePath);
    };
  }, []);

  let route: React.ReactNode;
  if (path === '/' || path === '/game') {
    route = <GameRoute />;
  } else if (path === '/debug' && DEBUG_ROUTE_ENABLED) {
    route = <main className="debug-route" role="main"><h1>Debug route</h1><p>Debug tools are available from the development source route.</p><a className="hud-button" href="/">Return to game</a></main>;
  } else {
    route = <NotFoundRoute />;
  }

  return <RootLayout>{route}</RootLayout>;
}

export default App;
