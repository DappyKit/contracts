import { ethers } from 'hardhat'

export const ONE_YEAR = 31536000

/**
 * Represents a multi-hash.
 *
 * @interface MultiHash
 * @property {string} hash - The hash value.
 * @property {number} hashFunction - The index of the hash function used.
 * @property {number} size - The size of the hash value in bytes.
 */
export interface MultiHash {
  hash: string;
  hashFunction: number;
  size: number;
}

/**
 * Generates a multi-hash from the given data.
 *
 * @param {string} data - The data to generate multi-hash from.
 * @return {MultiHash} - The multi-hash object containing the hash, hash function, and size.
 */
export function getMultiHash(data: string): MultiHash {
  return {
    hash: ethers.keccak256(ethers.toUtf8Bytes(data)),
    hashFunction: 12,
    size: 32
  }
}
