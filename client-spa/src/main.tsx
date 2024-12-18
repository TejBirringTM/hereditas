import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './Router'
import { isDebugMode } from './libs/debug'

import { Provider as StateProvider } from 'react-redux'
import store from './store'

import posthog from 'posthog-js';
import { PostHogProvider} from 'posthog-js/react'
const posthogApiKey = import.meta.env.VITE_POSTHOG_PUBLIC_API_KEY as string;
const posthogHostUrl = import.meta.env.VITE_POSTHOG_HOST_URL as string;
posthog.init(
  posthogApiKey,
  {
    api_host: posthogHostUrl,
    capture_heatmaps: true,
    debug: isDebugMode(),
    person_profiles:  "always",
    autocapture: false,
    disable_session_recording: false,
    capture_performance: true,
    ip: true,
    enable_recording_console_log: true
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog} >
      <StateProvider store={store}>
        <Router />
      </StateProvider>
    </PostHogProvider>
  </StrictMode>,
);
