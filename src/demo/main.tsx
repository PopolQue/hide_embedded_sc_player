import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DemoApp from './DemoApp'
import '../lib/SCPlayer.css'

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <DemoApp />
    </StrictMode>
  )
}
