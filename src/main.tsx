import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/**
 * Register the service worker only on origins where it can actually work:
 * https (the published site) and localhost (the booth laptop's local server).
 * On file:// registration throws — and not attempting the wrong path beats
 * catching its failure, because a swallowed error hides real ones with it.
 */
const swCapableOrigin =
  location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
if ('serviceWorker' in navigator && import.meta.env.PROD && swCapableOrigin) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
