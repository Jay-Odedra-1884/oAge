'use client'

import { AnonAadhaarProvider } from '@anon-aadhaar/react'
import { WagmiProvider } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ''

const wagmiConfig = getDefaultConfig({
  appName: 'ZK Age Verifier',
  projectId,
  chains: [sepolia],
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* _testing=true uses a mock Aadhaar QR so you can develop without a real one.
              Set to false (and update env) before going to production. */}
          <AnonAadhaarProvider _appName="ZK Age Verifier" _testing={true}>
            {children}
          </AnonAadhaarProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
