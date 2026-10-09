import { WalletConnect } from '@/components/WalletConnect'
import { AgeVerifier } from '@/components/AgeVerifier'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">ZK Age Verification</h1>
          <p className="text-gray-400 text-sm">
            Prove you're 18+ using Aadhaar — zero personal data on-chain.
          </p>
        </div>

        <div className="flex justify-center">
          <WalletConnect />
        </div>

        <AgeVerifier />

        <p className="text-center text-xs text-gray-600">
          Powered by{' '}
          <a href="https://github.com/anon-aadhaar/anon-aadhaar" className="underline hover:text-gray-400">
            anon-aadhaar
          </a>
          {' '}· Sepolia testnet
        </p>

      </div>
    </main>
  )
}
