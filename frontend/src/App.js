import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PlaybookGenerator from './PlaybookGenerator';
import TaxForecaster from './TaxForecaster';
import LandingPage from './LandingPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/playbook" element={<PlaybookGenerator />} />
          <Route path="/forecaster" element={<TaxForecaster />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;