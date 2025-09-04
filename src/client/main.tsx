// Checkpoint: Test with devvit playtest in private sub. Verify client-side routing and component rendering.
import './index.css';
import './styles/global.css';

// Import React Router components for client-side routing
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import the main components for routing
import Welcome from './components/Welcome';
import Logger from './components/Logger';
import Dashboard from './components/Dashboard';
import Visualization from './components/Visualization';

// Main application entry point with routing setup
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Wrap the entire app with BrowserRouter to enable routing */}
    <BrowserRouter>
      <div className="logo">CRM-1970</div>
      <div className="app-container" style={{ background: 'linear-gradient(135deg, var(--primary-bg), var(--highlight))', minHeight: '100vh' }}>
        {/* Define routes for different components */}
        <Routes>
          {/* Default route renders the Welcome component */}
          <Route path="/" element={<Welcome />} />
          {/* Route for the Logger component */}
          <Route path="/logger" element={<Logger />} />
          {/* Route for the Dashboard component */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Route for the Visualization component, passing a default groupId prop */}
          <Route path="/visualization" element={<Visualization groupId="default-group" />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>
);
