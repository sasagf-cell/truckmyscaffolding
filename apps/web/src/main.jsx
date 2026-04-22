
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import '@/i18n/index.js';
import { toast } from 'sonner';

// Unregister Service Workers in development to prevent caching issues
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        console.log('ServiceWorker unregistered successfully.');
      }
    });
  });
}

// Render App - BrowserRouter is inside App.jsx, NOT here
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
