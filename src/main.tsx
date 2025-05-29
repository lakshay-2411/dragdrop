import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WebsiteBuilder from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebsiteBuilder />
  </StrictMode>,
)
