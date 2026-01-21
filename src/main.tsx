import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

// Mouse tracking for interactive gradient
let mouseX = 50;
let mouseY = 50;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 100;
  mouseY = (e.clientY / window.innerHeight) * 100;
  
  document.documentElement.style.setProperty('--mouse-x', `${mouseX}%`);
  document.documentElement.style.setProperty('--mouse-y', `${mouseY}%`);
});

// Set initial values
document.documentElement.style.setProperty('--mouse-x', '50%');
document.documentElement.style.setProperty('--mouse-y', '50%');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
