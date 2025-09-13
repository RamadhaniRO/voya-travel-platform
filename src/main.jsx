import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 main.jsx loading with CSS...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ main.jsx loaded successfully with CSS');
