export const VAULT_REGISTRY_ADDRESS = import.meta.env.VITE_VAULT_REGISTRY_ADDRESS as `0x${string}`;
export const PERMISSION_MANAGER_ADDRESS = import.meta.env.VITE_PERMISSION_MANAGER_ADDRESS as `0x${string}`;
export const SECRET_REGISTRY_ADDRESS = import.meta.env.VITE_SECRET_REGISTRY_ADDRESS as `0x${string}`;

export const VAULT_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" }
    ],
    "name": "createVault",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "vaultId", "type": "bytes32" }],
    "name": "getVault",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "id", "type": "bytes32" },
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "address", "name": "owner", "type": "address" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }
        ],
        "internalType": "struct VaultRegistry.Vault",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyVaults",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "vaultId", "type": "bytes32" },
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "isOwner",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const PERMISSION_MANAGER_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "vaultId", "type": "bytes32" },
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint8", "name": "level", "type": "uint8" }
    ],
    "name": "grantPermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "vaultId", "type": "bytes32" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "revokePermission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "vaultId", "type": "bytes32" },
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint8", "name": "requiredLevel", "type": "uint8" }
    ],
    "name": "hasPermission",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "vaultId", "type": "bytes32" },
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getPermissionLevel",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const SECRET_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "vaultId", "type": "bytes32" },
      { "internalType": "string", "name": "encryptedName", "type": "string" },
      { "internalType": "string", "name": "cid", "type": "string" },
      { "internalType": "string", "name": "secretType", "type": "string" }
    ],
    "name": "storeSecret",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "secretId", "type": "bytes32" },
      { "internalType": "string", "name": "cid", "type": "string" }
    ],
    "name": "updateSecret",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "secretId", "type": "bytes32" }],
    "name": "deleteSecret",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "secretId", "type": "bytes32" }],
    "name": "getSecret",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "id", "type": "bytes32" },
          { "internalType": "bytes32", "name": "vaultId", "type": "bytes32" },
          { "internalType": "string", "name": "encryptedName", "type": "string" },
          { "internalType": "string", "name": "cid", "type": "string" },
          { "internalType": "string", "name": "secretType", "type": "string" },
          { "internalType": "uint256", "name": "version", "type": "uint256" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "updatedAt", "type": "uint256" },
          { "internalType": "bool", "name": "isDeleted", "type": "bool" }
        ],
        "internalType": "struct SecretRegistry.Secret",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "vaultId", "type": "bytes32" }],
    "name": "getVaultSecrets",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "secretId", "type": "bytes32" }],
    "name": "getSecretVersions",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "cid", "type": "string" },
          { "internalType": "uint256", "name": "version", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct SecretRegistry.SecretVersion",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
