import './polyfills'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Global error catcher for production debugging
window.onerror = (msg, _url, line, col, error) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background: #1a0000; color: #ff4444; padding: 20px; font-family: monospace; border: 1px solid red; margin: 20px; border-radius: 8px;">
        <h1 style="margin: 0 0 10px 0; font-size: 1.2rem;">PROD_ERROR: Runtime Failure</h1>
        <p style="margin: 0;">${msg}</p>
        <small style="opacity: 0.7;">Line: ${line} | Col: ${col}</small>
        <pre style="margin-top: 10px; font-size: 0.8rem; background: #000; padding: 10px; overflow: auto;">${error?.stack || 'No stack trace'}</pre>
      </div>
    `;
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <App />
)
