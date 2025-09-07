import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import the main components for routing
import Welcome from './Welcome';
import Logger from './Logger';
import Dashboard from './Dashboard';
import Visualization from './Visualization';

// App component with focus management and Devvit context handling
const App: React.FC = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId') || localStorage.getItem('groupId') || 'default-group';

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
          {/* Route for the Visualization component, passing a dynamic groupId prop */}
          <Route path="/visualization" element={<Visualization groupId={groupId} />} />
          {/* Catch-all route for Devvit webview URLs with webbit_token */}
          <Route path="*" element={<Welcome />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
};

export default App;
