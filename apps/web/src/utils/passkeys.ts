/**
 * Native WebAuthn Passkeys Helper
 * Allows registering a biometric credential and using it to authenticate.
 */

// Helper to convert base64url to Uint8Array
function bufferFromBase64(base64: string): Uint8Array {
  const binary = window.atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert ArrayBuffer to base64url
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function registerPasskey(username: string = "user@vaultone.io"): Promise<{ credentialId: string; publicKey: string }> {
  if (!navigator.credentials) {
    throw new Error("WebAuthn is not supported in this browser or context (requires HTTPS or localhost).");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  const creationOptions: CredentialCreationOptions = {
    publicKey: {
      challenge,
      rp: {
        name: "VaultOne",
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: username,
        displayName: username.split('@')[0],
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      timeout: 60000,
      authenticatorSelection: {
        authenticatorAttachment: "platform", // forces TouchID, FaceID, Windows Hello
        userVerification: "required",
        residentKey: "required",
      },
    },
  };

  const credential = (await navigator.credentials.create(creationOptions)) as PublicKeyCredential;
  if (!credential) {
    throw new Error("Failed to generate credential.");
  }

  const credentialId = credential.id;
  
  // Extract public key if available
  let publicKey = "";
  if (credential.response instanceof AuthenticatorAttestationResponse) {
    const pubKeyBuffer = credential.response.getPublicKey?.();
    if (pubKeyBuffer) {
      publicKey = bufferToBase64(pubKeyBuffer);
    }
  }

  return { credentialId, publicKey };
}

export async function authenticatePasskey(credentialId: string): Promise<boolean> {
  if (!navigator.credentials) {
    throw new Error("WebAuthn is not supported.");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const assertionOptions: CredentialRequestOptions = {
    publicKey: {
      challenge,
      rpId: window.location.hostname,
      allowCredentials: [
        {
          id: bufferFromBase64(credentialId) as any,
          type: "public-key",
        },
      ],
      userVerification: "required",
      timeout: 60000,
    },
  };

  const assertion = await navigator.credentials.get(assertionOptions);
  return !!assertion;
}
