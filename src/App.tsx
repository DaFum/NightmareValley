import React from 'react';
import { RootLayout } from './app/layout/RootLayout';
import { GameRoute } from './app/routes/GameRoute';
import NotFoundRoute from './app/routes/NotFoundRoute';
import DebugRoute from './app/routes/DebugRoute';
import './styles/globals.css';
import './styles/ui.css';

const DEBUG_ROUTE_ENABLED =
  typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';

function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname || '/';
}

type PatchedWindow = Window & {
  __historyPatched?: boolean;
  __originalPushState?: typeof history.pushState;
  __originalReplaceState?: typeof history.replaceState;
};

// Use a window property as the patch guard so HMR module re-evaluation does not
// double-patch history (module-scoped variables reset on each hot reload cycle).
// Originals are also stored on window so wrappers always call the true originals even after HMR.
if (typeof window !== 'undefined' && typeof history !== 'undefined' && !(window as PatchedWindow).__historyPatched) {
  (window as PatchedWindow).__originalPushState = history.pushState;
  (window as PatchedWindow).__originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const result = (window as PatchedWindow).__originalPushState!.apply(this, args);
    window.dispatchEvent(new Event('pushstate'));
    return result;
  };

  history.replaceState = function (...args) {
    const result = (window as PatchedWindow).__originalReplaceState!.apply(this, args);
    window.dispatchEvent(new Event('replacestate'));
    return result;
  };

  (window as PatchedWindow).__historyPatched = true;
}

export function App() {
  const [path, setPath] = React.useState(getCurrentPath);

  React.useEffect(() => {
    const updatePath = () => setPath(getCurrentPath());

    window.addEventListener('popstate', updatePath);
    window.addEventListener('hashchange', updatePath);
    window.addEventListener('pushstate', updatePath);
    window.addEventListener('replacestate', updatePath);
    return () => {
      window.removeEventListener('popstate', updatePath);
      window.removeEventListener('hashchange', updatePath);
      window.removeEventListener('pushstate', updatePath);
      window.removeEventListener('replacestate', updatePath);
    };
  }, []);

  let route: React.ReactNode;
  if (path === '/' || path === '/game') {
    route = <GameRoute />;
  } else if (path === '/debug' && DEBUG_ROUTE_ENABLED) {
    route = <DebugRoute />;
  } else {
    route = <NotFoundRoute />;
  }

  return <RootLayout>{route}</RootLayout>;
}

export default App;
