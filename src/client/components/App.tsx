import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import the main components for routing
import Welcome from './Welcome';
import Logger from './Logger';
import Dashboard from './Dashboard';
import Visualization from './Visualization';

// App component with focus management and Devvit context handling
const App: React.FC = () => {
  useEffect(() => {
    // Handle autofocus conflicts by managing focus events
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.hasAttribute('autofocus')) {
        // Check if another element is already focused
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement !== target && activeElement !== document.body) {
          console.warn('Autofocus blocked: another element is already focused');
          // Optionally, blur the current focused element to allow autofocus
          if (activeElement.blur) {
            activeElement.blur();
          }
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  // Parse webbit_token from URL for Devvit context
  const parseWebbitToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const webbitToken = urlParams.get('webbit_token') || hashParams.get('webbitToken');

    if (webbitToken) {
      try {
        // Decode and parse the JWT token (simplified - in production, use proper JWT library)
        const parts = webbitToken.split('.');
        if (parts.length >= 2 && parts[1]) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Parsed Devvit context:', payload);
          return payload;
        }
      } catch (error) {
        console.warn('Failed to parse webbit_token:', error);
      }
    }
    return null;
  };

  const devvitContext = parseWebbitToken();

  return (
    <BrowserRouter basename="/">
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
          {/* Catch-all route for Devvit webview URLs with webbit_token */}
          <Route path="*" element={<Welcome />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
};

export default App;
