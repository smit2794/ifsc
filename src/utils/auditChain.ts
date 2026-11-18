// src/utils/auditChain.ts

/**
 * Synchronous hash helper for building and verifying the tamper-evident audit ledger chain.
 * Uses a deterministic 64-char hex digest computed over previousHash + payload.
 */
function simpleHexDigest(input: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  // Combine into a 64-character deterministic hex string
  return `${hex1}${hex2}${(h1 ^ h2 >>> 0).toString(16).padStart(8, '0')}`.repeat(3).slice(0, 64);
}

export function computeNextHash(previousHash: string, payload: Record<string, unknown> | string): string {
  const content = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return simpleHexDigest(`${previousHash}:${content}`);
}

export function verifyAuditRow(previousHash: string, currentHash: string, payload: Record<string, unknown> | string): boolean {
  return computeNextHash(previousHash, payload) === currentHash;
}
