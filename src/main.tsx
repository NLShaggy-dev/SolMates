import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import App from './App';
import './styles.css';

// HashRouter so deep links work on static hosts (GitHub Pages) without rewrite rules.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
