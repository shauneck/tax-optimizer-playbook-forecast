import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components directly in this file to avoid import issues
import LandingPage from './LandingPage';
import PlaybookGenerator from './PlaybookGenerator';
import TaxForecaster from './TaxForecaster';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/playbook" element={<PlaybookGenerator />} />
          <Route path="/forecaster" element={<TaxForecaster />} />
          <Route path="/optimizer" element={<PlaybookGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;