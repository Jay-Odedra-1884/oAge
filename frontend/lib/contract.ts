export const AGE_VERIFIER_ADDRESS = (process.env.NEXT_PUBLIC_AGE_VERIFIER_ADDRESS ?? '0x') as `0x${string}`

export const AGE_VERIFIER_ABI = [
  {
    inputs: [
      { name: 'nullifier', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'revealArray', type: 'uint256[4]' },
      { name: 'groth16Proof', type: 'uint256[8]' },
    ],
    name: 'verifyAge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'isVerified',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'nullifier', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'AgeVerified',
    type: 'event',
  },
] as const
