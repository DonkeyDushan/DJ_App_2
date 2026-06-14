import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppProviders } from './AppProviders';
import { Main } from './app/pages/Main/Main';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <Main />
    </AppProviders>
  </React.StrictMode>,
);