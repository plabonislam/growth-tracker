import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { QueryProvider } from '@/app/providers/query-provider';
import { AppRouter } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  </StrictMode>,
);
