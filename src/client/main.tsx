import './index.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="logo">CRM-1970</div>
    <div className="app-container" style={{ background: 'linear-gradient(135deg, var(--primary-bg), var(--highlight))', minHeight: '100vh' }}>
      <App />
    </div>
  </StrictMode>
);
