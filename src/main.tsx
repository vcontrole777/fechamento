import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TeamViewProvider } from './contexts/TeamViewContext'

createRoot(document.getElementById("root")!).render(
  <TeamViewProvider>
    <App />
  </TeamViewProvider>
);
