import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

console.log('main.tsx: Starting initialization');
try {
  const rootElement = document.getElementById('root');
  console.log('main.tsx: Root element found:', !!rootElement);
  
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('main.tsx: Root rendered');
  } else {
    console.error('main.tsx: Root element not found!');
  }
} catch (e) {
  console.error('main.tsx: Error during render:', e);
}
