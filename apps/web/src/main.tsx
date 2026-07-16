import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChainProvider, polygonAmoy } from 'erc4337-kit'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChainProvider
      privyAppId={import.meta.env.VITE_PRIVY_APP_ID}
      chain={polygonAmoy}
      rpcUrl={import.meta.env.VITE_RPC_URL}
      pimlicoApiKey={import.meta.env.VITE_PIMLICO_API_KEY}
      loginMethods={['google', 'email']}
      appearance={{ theme: 'dark', accentColor: '#7c3aed' }}
    >
      <App />
    </ChainProvider>
  </StrictMode>,
)
