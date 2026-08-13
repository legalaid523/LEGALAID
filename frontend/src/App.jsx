import React from 'react';
import './index.css';
import ChatWindow from './components/ChatWindow';

/**
 * App Component
 * Root component for LegalAid application
 */
function App() {
  return (
    <div className="w-full h-screen">
      <ChatWindow />
    </div>
  );
}

export default App;
