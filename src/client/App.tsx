import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome';
import Logger from './components/Logger';
import Dashboard from './components/Dashboard';
import Visualization from './components/Visualization';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/logger" element={<Logger />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/visualization" element={<Visualization groupId="default-group" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
