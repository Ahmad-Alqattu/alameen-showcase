import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router';
import ShowcaseApp from './deck/ShowcaseApp';
import './i18n';
import './index.css';

/**
 * The company deck, standing on its own.
 *
 * MemoryRouter because the deck calls useNavigate for its exit and its Escape key. Route
 * changes go nowhere and never touch the address bar, which is what a full-screen deck
 * wants anyway — there is no other page here to reach.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryRouter>
      <ShowcaseApp />
    </MemoryRouter>
  </StrictMode>,
);
