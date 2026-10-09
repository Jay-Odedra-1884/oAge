// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Minimal interface for the deployed AnonAadhaar verifier contract.
/// Deployed addresses: https://github.com/anon-aadhaar/anon-aadhaar/tree/main/packages/contracts
interface IAnonAadhaar {
    function verifyAnonAadhaarProof(
        uint256 nullifier,
        uint256 timestamp,
        uint256 signal,
        uint256[4] calldata revealArray,
        uint256[8] calldata groth16Proof
    ) external view returns (bool);
}
