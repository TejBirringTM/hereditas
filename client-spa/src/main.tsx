import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './Router'

import { Provider as StateProvider } from 'react-redux'
import store from './store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StateProvider store={store}>
      <Router />
    </StateProvider>
  </StrictMode>,
);
