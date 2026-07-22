import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import '../index.css';
import { QueryProvider } from '@/app/providers/query-provider';
import { AppRouter } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AppRouter />
      <Toaster position="top-right" richColors closeButton />
    </QueryProvider>
  </StrictMode>,
);
