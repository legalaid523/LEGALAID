import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import ArchitecturePage from './pages/ArchitecturePage';

/**
 * App Component
 * Root component for LegalAId application with routing
 */
function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<ChatWindow />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
