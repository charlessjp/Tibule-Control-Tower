import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallbackTitle="Control Tower Recovery Mode"
      fallbackSubtitle="An unexpected runtime issue occurred. Click below to safely reload the workspace."
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

