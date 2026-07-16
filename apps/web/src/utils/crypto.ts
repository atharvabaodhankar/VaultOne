/**
 * Cryptographic utility functions for client-side AES-256-GCM encryption.
 */

// Helper to convert ArrayBuffer to Hex string
function bufToHex(buffer: ArrayBuffer): string {
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}

// Helper to convert Hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const view = new Uint8Array(hex.length / 2);
  for (let i = 0; i < view.length; i++) {
    view[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return view;
}

/**
 * Generates a random 256-bit AES key and returns its hex representation.
 */
export async function generateAESKey(): Promise<string> {
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exported = await window.crypto.subtle.exportKey("raw", key);
  return bufToHex(exported);
}

/**
 * Encrypts plaintext string using AES-256-GCM with the provided hex key.
 * Returns the hex-encoded ciphertext and hex-encoded IV.
 */
export async function encryptText(plaintext: string, keyHex: string): Promise<{ ciphertext: string; iv: string }> {
  const keyBuf = hexToBuf(keyHex);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is standard for GCM

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBuf,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const enc = new TextEncoder();
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    enc.encode(plaintext)
  );

  return {
    ciphertext: bufToHex(encrypted),
    iv: bufToHex(iv.buffer),
  };
}

/**
 * Decrypts hex-encoded ciphertext using AES-256-GCM with the provided hex key and IV.
 */
export async function decryptText(ciphertextHex: string, ivHex: string, keyHex: string): Promise<string> {
  const keyBuf = hexToBuf(keyHex);
  const ivBuf = hexToBuf(ivHex);
  const cipherBuf = hexToBuf(ciphertextHex);

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBuf,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuf,
    },
    cryptoKey,
    cipherBuf
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
