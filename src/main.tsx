import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/variables.css';
import '../src/styles/global.css';
import App from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
