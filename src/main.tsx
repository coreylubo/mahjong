import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'

import '@mantine/core/styles.css'
import './app/app.css'

import { App } from './app/App'
import { SettingsProvider } from './app/settings'
import { theme } from './app/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </MantineProvider>
  </StrictMode>,
)
