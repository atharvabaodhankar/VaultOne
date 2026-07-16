# VaultOne — System Design (MVP)

> **Version:** 1.0
> **Project:** VaultOne
> **Tagline:** Zero Trust Secrets Management powered by ERC-4337 Smart Accounts.

---

# 1. Project Vision

VaultOne is a decentralized secret management platform that allows developers to securely store and manage sensitive information such as:

* API Keys
* Environment Variables
* SSH Keys
* Private Certificates
* Secret JSON Files
* Recovery Codes
* Private Notes

The platform eliminates passwords and centralized secret storage by combining:

* ERC-4337 Smart Accounts
* Privy Authentication
* WebAuthn (Face ID / Windows Hello / Touch ID)
* Client-side Encryption
* Storacha (Decentralized Storage)
* Polygon Amoy

The application should feel like a premium SaaS product rather than a typical blockchain dApp.

---

# 2. Core Principles

* Zero Trust Architecture
* Passwordless Authentication
* Client-side Encryption
* Decentralized Storage
* Gasless Transactions
* No Seed Phrase
* Minimal Backend
* Clean UX
* Mobile Responsive
* Production-ready Architecture

---

# 3. Tech Stack

## Frontend

* React
* Vite
* TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion
* React Router
* TanStack Query
* React Hook Form
* Zod
* Lucide Icons

---

## Blockchain

* Polygon Amoy
* ERC-4337
* erc4337-kit
* Privy
* Pimlico
* Alchemy

---

## Storage

* Storacha
* IPFS

---

## Authentication

* Google Login (Privy)
* WebAuthn
* Face ID
* Windows Hello
* Touch ID

---

## Backend (Only if Needed)

* Node.js
* Express
* TypeScript

Backend should remain extremely lightweight.

---

# 4. IMPORTANT

The provided **erc4337-kit README** is the official implementation guide.

Antigravity MUST read it before implementing blockchain functionality.

DO NOT manually configure:

* Privy
* Permissionless
* Smart Accounts
* Bundlers
* Paymasters

Always use the abstractions exported by erc4337-kit.

Examples:

* ChainProvider
* useWallet()
* useTransaction()
* useContractRead()
* createContractClient()
* Session Keys
* Paymaster Policies

---

# 5. High Level Flow

User

↓

Google Login

↓

Privy Authentication

↓

ERC-4337 Smart Account

↓

Register WebAuthn Passkey

↓

Encrypt Secret

↓

Upload Encrypted File to Storacha

↓

Receive CID

↓

Store Metadata + CID on Polygon

↓

Secret Available

---

# 6. Authentication Flow

Google Login

↓

Privy

↓

Smart Account Created

↓

Register WebAuthn

↓

Credential ID Stored

↓

Future Login

↓

Face ID / Windows Hello

↓

Access Vault

Never store:

* Face Images
* Face Coordinates
* Fingerprints
* Biometric Templates

Use only WebAuthn credential information.

---

# 7. Encryption Flow

Plain Secret

↓

Generate AES-256-GCM Key

↓

Encrypt

↓

Encrypted Blob

↓

Upload to Storacha

↓

Receive CID

↓

Store CID on Blockchain

↓

Retrieve

↓

Decrypt Locally

Encryption and decryption MUST happen only on the client.

---

# 8. Storage Model

Storacha stores

* Encrypted Files

Blockchain stores

* CID
* Owner
* Version
* Created Time
* Updated Time
* Metadata

Never store plaintext secrets.

---

# 9. Smart Contracts

contracts/

* VaultRegistry.sol
* SecretRegistry.sol
* PermissionManager.sol

Responsibilities

## VaultRegistry

* Create Vault
* Own Vault
* Vault Metadata

## SecretRegistry

* Store Secret Metadata
* CID
* Version
* Delete
* Rotate

## PermissionManager

* Secret Sharing
* Read Access
* Edit Access
* Revocation

---

# 10. Folder Structure

```text
vaultone/

apps/
    web/
    api/

packages/
    contracts/
    shared/

docs/

system_design.md

README.md
```

---

## Frontend

```text
apps/web/src/

components/

pages/

layouts/

providers/

hooks/

services/

contexts/

types/

utils/

styles/

assets/
```

---

## Backend

```text
apps/api/src/

controllers/

routes/

middlewares/

services/

auth/

storage/

crypto/

web3/

utils/

types/
```

---

## Contracts

```text
packages/contracts/

contracts/

interfaces/

libraries/

scripts/

test/
```

---

# 11. Features

## Authentication

* Google Login
* Passwordless Login
* Smart Account
* WebAuthn

---

## Vault

* Create Vault
* Delete Vault
* Rename Vault

---

## Secret Management

* Create
* Read
* Update
* Delete
* Rotate
* Version History

Supported

* API Keys
* .env
* SSH Keys
* Certificates
* JSON
* Notes

---

## Secret Sharing

* Share
* Revoke
* Expire
* Read Only
* Edit

---

## Security

* Client-side Encryption
* Face Authentication
* Immutable Metadata
* Audit History

---

# 12. UI

Theme

Monochrome

Inspired by

* GitHub
* Linear
* Raycast
* Vercel

Requirements

* Dark Theme
* Fully Responsive
* Premium Typography
* Rounded Cards
* Thin Borders
* Subtle Shadows
* Smooth Motion
* Minimal Design

No rainbow gradients.

---

# 13. Pages

Landing

Dashboard

Vault

Secret Details

Upload Secret

Activity

Settings

Profile

Security

---

# 14. Dashboard

Cards

* Secret Count
* Recent Activity
* Smart Account
* Storage Usage
* Security Status

Sidebar

* Dashboard
* Vault
* Secrets
* Activity
* Settings

---

# 15. Future Roadmap

Phase 1

* Secret CRUD
* Storacha
* Smart Accounts
* CID Storage

Phase 2

* WebAuthn
* Face Authentication
* Secret Rotation
* Version History

Phase 3

* Sharing
* Guardian Recovery
* Session Keys

Phase 4

* CLI
* VSCode Extension
* GitHub Actions
* AI Integration
* SDK

---

# 16. Antigravity IDE Instructions

1. Read the complete **erc4337-kit README** before generating blockchain code.
2. Treat erc4337-kit as the only ERC-4337 integration layer.
3. Use Polygon Amoy for development.
4. Build a clean monorepo structure.
5. Keep the backend minimal.
6. Do all encryption on the client.
7. Use Storacha instead of Pinata.
8. Store only encrypted files in Storacha.
9. Store only metadata and CID on-chain.
10. Build reusable React components.
11. Follow Clean Architecture.
12. Prioritize developer experience and code quality.
13. Make the UI premium, monochrome, responsive, and production-ready.
14. Write scalable code with clear separation of concerns.
15. Build VaultOne like a real SaaS product, not a blockchain demo.

---

# Success Criteria

A user should be able to:

* Login with Google.
* Automatically receive an ERC-4337 Smart Account.
* Register Face Authentication through WebAuthn.
* Create a vault.
* Encrypt secrets locally.
* Upload encrypted secrets to Storacha.
* Store metadata on Polygon Amoy.
* Retrieve and decrypt secrets securely.
* Share secrets securely (future).
* Use the application without ever handling a private key or seed phrase.

**End Goal:** Deliver a polished, production-quality decentralized secrets manager that showcases ERC-4337 account abstraction, passwordless authentication, decentralized storage, and excellent developer experience.
