import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGA } from './utils/analytics'

// Initialize Google Analytics if VITE_GA_ID is set
try {
  const GA_ID = import.meta.env.VITE_GA_ID;
  if (GA_ID) {
    initGA(GA_ID);
  }
} catch (e) {
  // import.meta may not be available in some editors; ignore
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
