// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IAnonAadhaar.sol";

/**
 * AgeVerifier — verifies an anon-aadhaar ZK proof on-chain and records age ≥ 18.
 *
 * Flow:
 *   1. User generates proof in browser (anon-aadhaar SDK, client-side WASM).
 *   2. Frontend calls verifyAge() with the packed proof.
 *   3. Contract delegates to IAnonAadhaar.verifyAnonAadhaarProof().
 *   4. On success, nullifier is stored (prevents re-use) and address is marked verified.
 *
 * revealArray layout (from anon-aadhaar spec):
 *   [0] ageAbove18  — MUST be 1 (this is the only field we enforce)
 *   [1] gender      — optional, pass 0 if not revealing
 *   [2] state       — optional, pass 0 if not revealing
 *   [3] pincode     — optional, pass 0 if not revealing
 *
 * signal: the caller's address cast to uint256, ties the proof to this wallet.
 */
contract AgeVerifier {
    IAnonAadhaar public immutable anonAadhaar;

    mapping(uint256 => bool) public nullifierUsed;
    mapping(address => bool) public isVerified;

    event AgeVerified(address indexed user, uint256 nullifier, uint256 timestamp);

    error AlreadyVerified();
    error NullifierReused();
    error NotAdult();
    error BadProof();

    constructor(address _anonAadhaar) {
        anonAadhaar = IAnonAadhaar(_anonAadhaar);
    }

    /**
     * @param nullifier     Unique identifier derived from Aadhaar + nullifierSeed.
     * @param timestamp     Unix timestamp when proof was generated (checked by verifier).
     * @param revealArray   Four-element array; [0] must equal 1 (ageAbove18).
     * @param groth16Proof  Packed Groth16 proof — use packGroth16Proof() from @anon-aadhaar/core.
     */
    function verifyAge(
        uint256 nullifier,
        uint256 timestamp,
        uint256[4] calldata revealArray,
        uint256[8] calldata groth16Proof
    ) external {
        if (isVerified[msg.sender]) revert AlreadyVerified();
        if (nullifierUsed[nullifier]) revert NullifierReused();
        if (revealArray[0] != 1) revert NotAdult();

        // signal = caller address, proves this wallet owns the proof
        uint256 signal = uint256(uint160(msg.sender));

        if (!anonAadhaar.verifyAnonAadhaarProof(nullifier, timestamp, signal, revealArray, groth16Proof)) {
            revert BadProof();
        }

        nullifierUsed[nullifier] = true;
        isVerified[msg.sender] = true;

        emit AgeVerified(msg.sender, nullifier, timestamp);
    }
}
