'use client'

import { useAnonAadhaar, LogInWithAnonAadhaar } from '@anon-aadhaar/react'
import { packGroth16Proof } from '@anon-aadhaar/core'
import { useWriteContract, useReadContract, useAccount } from 'wagmi'
import { AGE_VERIFIER_ADDRESS, AGE_VERIFIER_ABI } from '@/lib/contract'

// ponytail: nullifierSeed is app-specific — change this to any unique number for your app
// to prevent cross-app proof replay
const NULLIFIER_SEED = 1_234_567_890

export function AgeVerifier() {
  const { address, isConnected } = useAccount()
  const [anonAadhaar] = useAnonAadhaar()
  const { writeContract, isPending, isSuccess, error } = useWriteContract()

  const { data: alreadyVerified } = useReadContract({
    address: AGE_VERIFIER_ADDRESS,
    abi: AGE_VERIFIER_ABI,
    functionName: 'isVerified',
    args: [address!],
    query: { enabled: !!address },
  })

  if (!isConnected) {
    return (
      <p className="text-center text-gray-500 text-sm">
        Connect your wallet to begin verification.
      </p>
    )
  }

  if (alreadyVerified) {
    return (
      <div className="rounded-xl border border-green-500/40 bg-green-900/20 p-6 text-center">
        <p className="text-green-400 text-lg font-semibold">Verified</p>
        <p className="text-gray-400 text-sm mt-1">
          Your age is verified on-chain. No personal data was stored.
        </p>
      </div>
    )
  }

  function submitProof() {
    if (anonAadhaar.status !== 'logged-in') return
    const proof = anonAadhaar.pcd.proof

    // packGroth16Proof flattens pi_a, pi_b, pi_c into uint256[8] for Solidity
    // ponytail: field order matches anon-aadhaar/core v2; verify if upgrading the package
    const packed = packGroth16Proof(proof.groth16Proof)

    writeContract({
      address: AGE_VERIFIER_ADDRESS,
      abi: AGE_VERIFIER_ABI,
      functionName: 'verifyAge',
      args: [
        BigInt(proof.nullifier),
        BigInt(proof.timestamp),
        [
          BigInt(proof.ageAbove18 ?? '1'),
          BigInt(proof.gender ?? '0'),
          BigInt(proof.state ?? '0'),
          BigInt(proof.pincode ?? '0'),
        ],
        packed as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint],
      ],
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h2 className="font-semibold text-gray-200">Step 1 — Generate ZK Proof</h2>
        <p className="text-sm text-gray-400">
          Upload your Aadhaar QR code. The proof is generated locally — nothing leaves your device.
        </p>
        {/* LogInWithAnonAadhaar handles QR upload + WASM proof generation */}
        <LogInWithAnonAadhaar
          nullifierSeed={NULLIFIER_SEED}
          fieldsToReveal={['ageAbove18']}
          signal={address}
        />
      </div>

      {anonAadhaar.status === 'logged-in' && !isSuccess && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
          <h2 className="font-semibold text-gray-200">Step 2 — Submit Proof On-Chain</h2>
          <p className="text-sm text-gray-400">
            Proof ready. Submit it to the contract — only the proof goes on-chain, not your Aadhaar data.
          </p>
          <button
            onClick={submitProof}
            disabled={isPending}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
          >
            {isPending ? 'Submitting…' : 'Submit Proof'}
          </button>
          {error && (
            <p className="text-red-400 text-sm break-all">{error.message}</p>
          )}
        </div>
      )}

      {isSuccess && (
        <div className="rounded-xl border border-green-500/40 bg-green-900/20 p-4 text-center">
          <p className="text-green-400 font-semibold">Transaction submitted!</p>
          <p className="text-gray-400 text-sm mt-1">Age verification will be confirmed once the tx is mined.</p>
        </div>
      )}
    </div>
  )
}
