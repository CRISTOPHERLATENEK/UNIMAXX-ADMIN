import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')!;
rootEl.setAttribute('translate', 'no');
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
