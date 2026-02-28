import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
