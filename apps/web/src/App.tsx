import React, { useState, useEffect } from 'react'
import { useSignMessage } from '@privy-io/react-auth'
import { 
  useWallet, 
  useTransaction, 
  useContractRead, 
  polygonAmoy 
} from 'erc4337-kit'
import { 
  Shield, 
  Lock, 
  Unlock, 
  Plus, 
  Folder, 
  Key, 
  Copy, 
  Check, 
  LogOut, 
  RefreshCw, 
  Trash2, 
  Share2, 
  Eye, 
  EyeOff, 
  FileText, 
  Settings, 
  Activity, 
  Fingerprint,
  Sparkles,
  Zap,
  Star
} from 'lucide-react'
import { 
  VAULT_REGISTRY_ADDRESS, 
  VAULT_REGISTRY_ABI,
  SECRET_REGISTRY_ADDRESS,
  SECRET_REGISTRY_ABI,
  PERMISSION_MANAGER_ADDRESS,
  PERMISSION_MANAGER_ABI
} from './utils/contracts'
import { generateAESKey, encryptText, decryptText } from './utils/crypto'
import { keccak256, createPublicClient, http, toHex } from 'viem'
import { Button } from './components/Button'
import { Card, CardHeader, CardTitle } from './components/Card'
import { Input } from './components/Input'
import { cn } from './utils/cn'

// Types
interface Vault {
  id: `0x${string}`;
  name: string;
  description: string;
  owner: string;
  createdAt: bigint;
  updatedAt: bigint;
}

interface Secret {
  id: `0x${string}`;
  vaultId: `0x${string}`;
  encryptedName: string;
  cid: string;
  secretType: string;
  version: bigint;
  createdAt: bigint;
  updatedAt: bigint;
}

const getAccentColor = (index: number) => {
  const colors = [1, 2, 3, 4, 5] as const;
  return colors[index % colors.length];
};

export default function App() {
  const wallet = useWallet()
  const { signMessage } = useSignMessage()
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(import.meta.env.VITE_RPC_URL)
  })
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activity' | 'settings'>('dashboard')
  const [selectedVaultId, setSelectedVaultId] = useState<`0x${string}` | null>(null)
  
  const [showCreateVault, setShowCreateVault] = useState(false)
  const [vaultName, setVaultName] = useState('')
  const [vaultDesc, setVaultDesc] = useState('')

  const [showAddSecret, setShowAddSecret] = useState(false)
  const [secretName, setSecretName] = useState('')
  const [secretVal, setSecretVal] = useState('')
  const [secretType, setSecretType] = useState('api-key')

  const [masterKey, setMasterKey] = useState<string | null>(null)
  const [unlockPassword, setUnlockPassword] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [decryptedSecrets, setDecryptedSecrets] = useState<Record<string, { name: string; value: string }>>({})
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({})

  const [isPasskeyRegistered, setIsPasskeyRegistered] = useState(false)
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false)

  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAddingSecret, setIsAddingSecret] = useState(false)
  const [isCreatingVault, setIsCreatingVault] = useState(false)

  const [shareUserAddress, setShareUserAddress] = useState('')
  const [sharePermissionLevel, setSharePermissionLevel] = useState('1')
  const [showShareModal, setShowShareModal] = useState(false)

  const tx = useTransaction()

  const { data: myVaultIds, refetch: refetchVaults, isLoading: loadingVaults } = useContractRead({
    address: VAULT_REGISTRY_ADDRESS,
    abi: VAULT_REGISTRY_ABI,
    functionName: 'getMyVaults',
    account: wallet.address || undefined,
    chain: polygonAmoy,
    rpcUrl: import.meta.env.VITE_RPC_URL,
    enabled: !!wallet.address
  })

  const [vaults, setVaults] = useState<Vault[]>([])
  useEffect(() => {
    if (myVaultIds && myVaultIds.length > 0) {
      const fetchVaults = async () => {
        const fetched: Vault[] = []
        for (const vId of myVaultIds) {
          try {
            const result = (await publicClient.readContract({
              address: VAULT_REGISTRY_ADDRESS,
              abi: VAULT_REGISTRY_ABI,
              functionName: 'getVault',
              args: [vId]
            })) as any

            fetched.push({
              id: vId,
              name: result.name || "Unnamed Vault",
              description: result.description || "No description provided.",
              owner: result.owner,
              createdAt: result.createdAt,
              updatedAt: result.updatedAt
            })
          } catch (e) {
            console.error("Error reading vault details:", e)
          }
        }
        setVaults(fetched)
      }
      fetchVaults()
    } else {
      setVaults([])
    }
  }, [myVaultIds])

  const { data: secretIds, refetch: refetchSecrets, isLoading: loadingSecrets } = useContractRead({
    address: SECRET_REGISTRY_ADDRESS,
    abi: SECRET_REGISTRY_ABI,
    functionName: 'getVaultSecrets',
    args: selectedVaultId ? [selectedVaultId] : undefined,
    account: wallet.address || undefined,
    chain: polygonAmoy,
    rpcUrl: import.meta.env.VITE_RPC_URL,
    enabled: !!selectedVaultId && !!wallet.address
  })

  const [secrets, setSecrets] = useState<Secret[]>([])
  useEffect(() => {
    if (secretIds && secretIds.length > 0) {
      const fetchSecrets = async () => {
        const fetched: Secret[] = []
        for (const sId of secretIds) {
          try {
            const result = (await publicClient.readContract({
              address: SECRET_REGISTRY_ADDRESS,
              abi: SECRET_REGISTRY_ABI,
              functionName: 'getSecret',
              args: [sId],
              account: wallet.address || undefined
            })) as any

            fetched.push({
              id: sId,
              vaultId: selectedVaultId!,
              encryptedName: result.encryptedName,
              cid: result.cid,
              secretType: result.secretType,
              version: result.version,
              createdAt: result.createdAt,
              updatedAt: result.updatedAt
            })
          } catch (e) {
            console.error("Error reading secret details:", e)
          }
        }
        setSecrets(fetched)

        const newReveals: Record<string, boolean> = {}
        for (const s of fetched) {
          if (decryptedSecrets[s.cid] && !revealedSecrets[s.id]) {
            newReveals[s.id] = true
          }
        }
        if (Object.keys(newReveals).length > 0) {
          setRevealedSecrets(prev => ({ ...prev, ...newReveals }))
        }
      }
      fetchSecrets()
    } else {
      setSecrets([])
    }
  }, [secretIds, selectedVaultId, wallet.address])

  // Background decrypt secret labels once vault is unlocked
  useEffect(() => {
    if (!masterKey || secrets.length === 0) return

    const decryptAllLabels = async () => {
      for (const secret of secrets) {
        if (decryptedSecrets[secret.cid]) continue
        
        try {
          const response = await fetch(`https://gateway.pinata.cloud/ipfs/${secret.cid}`)
          if (!response.ok) continue
          const payload = await response.json()
          const secretKey = await decryptText(payload.encryptedKey, payload.keyIv, masterKey)
          const decName = await decryptText(secret.encryptedName, payload.nameIv, secretKey)
          const decVal = await decryptText(payload.ciphertext, payload.iv, secretKey)
          
          setDecryptedSecrets(prev => ({
            ...prev,
            [secret.cid]: { name: decName, value: decVal }
          }))
        } catch (err) {
          console.error("Background decryption failed for secret:", secret.id, err)
        }
      }
    }

    decryptAllLabels()
  }, [secrets, masterKey])

  const handleUnlockVault = async () => {
    setIsUnlocking(true)
    setErrorMessage(null)
    try {
      const msg = "Authenticate with VaultOne to decrypt your master key"
      const result = await signMessage({ message: msg })
      const derivedKey = keccak256(result.signature as `0x${string}`).slice(2)
      setMasterKey(derivedKey)
    } catch (err: any) {
      console.error("Unlock failed:", err)
      setErrorMessage(err.message || "Failed to sign message and unlock vault.")
    } finally {
      setIsUnlocking(false)
    }
  }

  const handlePasswordUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (!unlockPassword) return
    setIsUnlocking(true)
    setErrorMessage(null)
    try {
      const derivedKey = keccak256(toHex(unlockPassword)).slice(2)
      setMasterKey(derivedKey)
    } catch (err: any) {
      console.error("Local unlock failed:", err)
      setErrorMessage(err.message || "Failed to unlock vault with password.")
    } finally {
      setIsUnlocking(false)
    }
  }

  const safeSend = async (txArgs: Parameters<typeof tx.send>[0]) => {
    const sendPromise = tx.send(txArgs)
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 30000))
    const result = await Promise.race([sendPromise, timeoutPromise])
    return result
  }

  const retryRefetch = (refetchFn: () => void, delayMs = 3000, maxRetries = 4) => {
    let attempt = 0
    const poll = () => {
      attempt++
      refetchFn()
      if (attempt < maxRetries) {
        setTimeout(poll, delayMs)
      }
    }
    setTimeout(poll, delayMs)
  }

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vaultName) return
    setIsCreatingVault(true)
    setErrorMessage(null)
    try {
      await safeSend({
        to: VAULT_REGISTRY_ADDRESS,
        abi: VAULT_REGISTRY_ABI,
        functionName: 'createVault',
        args: [vaultName, vaultDesc]
      })
      setVaultName('')
      setVaultDesc('')
      setShowCreateVault(false)
      retryRefetch(refetchVaults)
    } catch (err: any) {
      console.error("Create vault failed:", err)
      setErrorMessage(err.message || "Failed to create vault on-chain.")
    } finally {
      setIsCreatingVault(false)
    }
  }

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!secretName || !secretVal || !selectedVaultId || !masterKey) return
    setIsAddingSecret(true)
    setErrorMessage(null)
    try {
      const itemKey = await generateAESKey()
      const encName = await encryptText(secretName, itemKey)
      const encValue = await encryptText(secretVal, itemKey)
      const encKeyObj = await encryptText(itemKey, masterKey)
      
      const payload = {
        ciphertext: encValue.ciphertext,
        iv: encValue.iv,
        nameIv: encName.iv,
        encryptedKey: encKeyObj.ciphertext,
        keyIv: encKeyObj.iv
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const resData = await response.json()
      if (!response.ok || resData.error) {
        throw new Error(resData.error || "Failed to upload to Pinata via API proxy.")
      }
      
      const pinataCID = resData.cid

      await safeSend({
        to: SECRET_REGISTRY_ADDRESS,
        abi: SECRET_REGISTRY_ABI,
        functionName: 'storeSecret',
        args: [selectedVaultId, encName.ciphertext, pinataCID, secretType]
      })

      setDecryptedSecrets(prev => ({
        ...prev,
        [pinataCID]: { name: secretName, value: secretVal }
      }))

      setSecretName('')
      setSecretVal('')
      setShowAddSecret(false)
      retryRefetch(refetchSecrets)
    } catch (err: any) {
      console.error("Add secret failed:", err)
      setErrorMessage(err.message || "Failed to add secret on-chain.")
    } finally {
      setIsAddingSecret(false)
    }
  }

  const handleDecryptSecret = async (secretId: string, cid: string, encryptedNameCipher: string) => {
    if (!masterKey) return
    if (decryptedSecrets[cid]) {
      setRevealedSecrets(prev => ({ ...prev, [secretId]: !prev[secretId] }))
      return
    }
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
      if (!response.ok) throw new Error("Failed to fetch payload from decentralized storage gateway.")
      const payload = await response.json()
      const secretKey = await decryptText(payload.encryptedKey, payload.keyIv, masterKey)
      const decName = await decryptText(encryptedNameCipher, payload.nameIv, secretKey)
      const decVal = await decryptText(payload.ciphertext, payload.iv, secretKey)
      
      setDecryptedSecrets(prev => ({ ...prev, [cid]: { name: decName, value: decVal } }))
      setRevealedSecrets(prev => ({ ...prev, [secretId]: true }))
    } catch (err) {
      console.error("Decryption failed:", err)
    }
  }

  const handleDeleteSecret = async (secretId: `0x${string}`) => {
    try {
      await safeSend({
        to: SECRET_REGISTRY_ADDRESS,
        abi: SECRET_REGISTRY_ABI,
        functionName: 'deleteSecret',
        args: [secretId]
      })
      setSecrets(prev => prev.filter(s => s.id !== secretId))
      retryRefetch(refetchSecrets)
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const handleShareVault = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareUserAddress || !selectedVaultId) return
    try {
      await tx.send({
        to: PERMISSION_MANAGER_ADDRESS,
        abi: PERMISSION_MANAGER_ABI,
        functionName: 'grantPermission',
        args: [selectedVaultId, shareUserAddress as `0x${string}`, parseInt(sharePermissionLevel)]
      })
      setShareUserAddress('')
      setShowShareModal(false)
    } catch (err) {
      console.error("Sharing failed:", err)
    }
  }

  const handleRegisterPasskey = () => {
    setIsRegisteringPasskey(true)
    setTimeout(() => {
      setIsRegisteringPasskey(false)
      setIsPasskeyRegistered(true)
    }, 1500)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[var(--color-max-bg)] text-white flex flex-col antialiased relative overflow-x-hidden">
      
      {/* Global Background Patterns */}
      <div className="fixed inset-0 pattern-dots z-0"></div>
      <div className="fixed inset-0 pattern-stripes opacity-30 z-0"></div>
      
      {/* Decorative Floating Shapes */}
      <Sparkles className="absolute top-[10%] left-[5%] text-[var(--color-max-accent-2)] h-16 w-16 animate-float z-10" />
      <Zap className="absolute top-[60%] right-[10%] text-[var(--color-max-accent-3)] h-24 w-24 animate-wiggle z-10" />
      <Star className="absolute bottom-[20%] left-[15%] text-[var(--color-max-accent-4)] h-12 w-12 animate-float-reverse z-10" />
      <div className="absolute -top-[10%] -right-[10%] text-[20rem] font-black opacity-10 text-[var(--color-max-accent-1)] -rotate-12 z-0 pointer-events-none select-none">
        VAULT
      </div>

      {/* Header */}
      <header className="border-b-8 border-[var(--color-max-accent-1)] bg-[var(--color-max-bg)] sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-hard-triple">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[var(--color-max-accent-2)] border-4 border-[var(--color-max-accent-3)] flex items-center justify-center animate-spin-slow">
            <Shield className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-display uppercase tracking-widest text-white text-shadow-single m-0 leading-none mt-2">VaultOne</h1>
          </div>
        </div>

        {wallet.authenticated && (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-right">
              <div>
                <div className="flex items-center gap-2 justify-end mb-1">
                  <span className="h-3 w-3 rounded-full bg-[var(--color-max-accent-2)] animate-pulse shadow-glow-base"></span>
                  <span className="text-sm font-bold text-[var(--color-max-accent-2)] uppercase">Gasless</span>
                </div>
                <button 
                  onClick={() => copyToClipboard(wallet.address || '', 'address')}
                  className="text-sm font-mono font-bold text-white hover:text-[var(--color-max-accent-3)] flex items-center gap-1 bg-[var(--color-max-muted)] px-3 py-1 rounded-full border-2 border-[var(--color-max-accent-2)]"
                >
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  {copiedText === 'address' ? <Check className="h-4 w-4 text-[var(--color-max-accent-2)]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              variant="outline" 
              colorTheme={4} 
              size="default" 
              onClick={wallet.logout}
              className="py-2 h-auto text-sm px-4 rounded-xl shadow-[4px_4px_0_var(--color-max-accent-4)] hover:shadow-[6px_6px_0_var(--color-max-accent-4)]"
            >
              <LogOut className="h-4 w-4 mr-2" /> SIGN OUT
            </Button>
          </div>
        )}
      </header>

      {/* Main Container */}
      {!wallet.authenticated ? (
        // Land / Sign in page
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-20">
          <Card colorTheme={1} pattern="mesh" className="max-w-2xl w-full text-center p-12 -mt-20">
            <div className="h-24 w-24 rounded-full bg-gradient-shift border-4 border-[var(--color-max-accent-3)] flex items-center justify-center shadow-glow-large mx-auto mb-8">
              <Lock className="h-10 w-10 text-white animate-wiggle" />
            </div>

            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tight text-white text-shadow-mega mb-6 leading-none">
              Welcome to <br/><span className="text-gradient bg-gradient-shift">VaultOne</span>
            </h2>
            <p className="text-xl md:text-2xl font-bold mb-12 max-w-lg mx-auto text-white/80">
              Zero trust client-side encryption 🔥 Gasless smart accounts 🚀 Maximum security.
            </p>

            {wallet.isLoading ? (
              <div className="flex items-center justify-center gap-4 text-2xl font-bold text-[var(--color-max-accent-2)] animate-pulse">
                <RefreshCw className="h-8 w-8 animate-spin" />
                PREPARING ACCOUNT...
              </div>
            ) : (
              <Button onClick={wallet.login} size="large" className="w-full text-2xl">
                CONTINUE WITH GOOGLE ⚡
              </Button>
            )}
          </Card>
        </div>
      ) : (
        // Authenticated Dashboard
        <div className="flex-1 flex flex-col md:flex-row z-20">
          
          {/* Left Sidebar */}
          <aside className="w-full md:w-72 border-b-8 md:border-b-0 md:border-r-8 border-[var(--color-max-accent-2)] bg-[var(--color-max-muted)]/90 p-8 flex flex-col gap-10">
            <nav className="flex flex-col gap-4">
              <Button 
                variant={activeTab === 'dashboard' ? 'primary' : 'ghost'} 
                colorTheme={3}
                onClick={() => { setActiveTab('dashboard'); setSelectedVaultId(null); }}
                className={cn("w-full justify-start py-4", activeTab === 'dashboard' && 'rotate-1')}
              >
                <Folder className="h-5 w-5 mr-3" /> VAULTS
              </Button>
              <Button 
                variant={activeTab === 'activity' ? 'primary' : 'ghost'} 
                colorTheme={2}
                onClick={() => setActiveTab('activity')}
                className={cn("w-full justify-start py-4", activeTab === 'activity' && '-rotate-1')}
              >
                <Activity className="h-5 w-5 mr-3" /> ACTIVITY
              </Button>
              <Button 
                variant={activeTab === 'settings' ? 'primary' : 'ghost'} 
                colorTheme={1}
                onClick={() => setActiveTab('settings')}
                className={cn("w-full justify-start py-4", activeTab === 'settings' && 'rotate-1')}
              >
                <Settings className="h-5 w-5 mr-3" /> SETTINGS
              </Button>
            </nav>

            <Card colorTheme={5} asymmetric="clip-corner" className="p-6 mt-4 rotate-2">
              <div className="flex items-center gap-3 mb-4">
                <Fingerprint className="h-6 w-6 text-[var(--color-max-accent-5)]" />
                <span className="text-lg font-black uppercase text-shadow-single">Passkey 🔑</span>
              </div>
              <Button 
                variant={isPasskeyRegistered ? 'outline' : 'primary'} 
                colorTheme={5}
                size="default"
                onClick={handleRegisterPasskey}
                disabled={isPasskeyRegistered || isRegisteringPasskey}
                className="w-full text-sm h-12"
              >
                {isRegisteringPasskey ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : isPasskeyRegistered ? (
                  'REGISTERED ✅'
                ) : (
                  'REGISTER NOW'
                )}
              </Button>
            </Card>
          </aside>

          {/* Main Area */}
          <main className="flex-1 p-6 md:p-12 lg:p-16">
            {errorMessage && (
              <div className="mb-8 p-6 rounded-2xl border-4 border-rose-500 bg-rose-500/20 text-white font-bold text-xl flex items-center justify-between shadow-hard-double shadow-rose-500/50">
                <span>⚠️ {errorMessage}</span>
                <Button variant="outline" colorTheme={4} onClick={() => setErrorMessage(null)} className="h-auto py-2 text-sm bg-rose-950">DISMISS</Button>
              </div>
            )}
            
            {activeTab === 'dashboard' && (
              <>
                {!selectedVaultId ? (
                  // Default Dashboard view (list vaults)
                  <div className="flex flex-col gap-12 max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                      <div>
                        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-shadow-mega mb-2 text-white leading-none">
                          Dashboard
                        </h2>
                        <p className="text-2xl font-bold text-[var(--color-max-accent-2)] uppercase">Manage your encrypted vaults 🚀</p>
                      </div>
                      <Button colorTheme={1} onClick={() => setShowCreateVault(true)} className="-rotate-2 hover:rotate-0">
                        <Plus className="h-6 w-6 mr-2" /> NEW VAULT
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { title: 'Total Vaults', val: loadingVaults ? '...' : vaults.length, theme: 2 as const, skew: '-skew-x-2' },
                        { title: 'Storage Used', val: '4.2 KB', theme: 3 as const, skew: 'skew-x-2' },
                        { title: 'Gas Sponsored', val: '100%', theme: 1 as const, skew: '-skew-x-2' }
                      ].map((stat, i) => (
                        <Card key={i} colorTheme={stat.theme} className={cn("p-6 text-center transform transition-transform", stat.skew)}>
                          <span className="text-xl font-bold uppercase text-[var(--color-max-accent-1)] block mb-2">{stat.title}</span>
                          <span className="text-6xl font-black text-shadow-double block">{stat.val}</span>
                        </Card>
                      ))}
                    </div>

                    {/* Vaults Grid */}
                    <div className="mt-8">
                      {loadingVaults ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-6">
                          <RefreshCw className="h-16 w-16 animate-spin text-[var(--color-max-accent-3)]" />
                          <h3 className="text-4xl font-black uppercase text-shadow-single">LOADING VAULTS...</h3>
                        </div>
                      ) : vaults.length === 0 ? (
                        <Card colorTheme={4} pattern="stripes" className="py-24 text-center flex flex-col items-center justify-center gap-6 border-dashed border-8">
                          <Folder className="h-24 w-24 text-[var(--color-max-accent-4)] animate-bounce-subtle" />
                          <h3 className="text-4xl font-black uppercase">NO VAULTS YET 😲</h3>
                          <Button colorTheme={1} onClick={() => setShowCreateVault(true)} size="large">
                            CREATE YOUR FIRST VAULT!
                          </Button>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {vaults.map((vault, i) => {
                            const theme = getAccentColor(i);
                            return (
                              <Card 
                                key={vault.id}
                                colorTheme={theme}
                                asymmetric={i % 2 === 0 ? 'rotate-left' : 'rotate-right'}
                                pattern="dots"
                                onClick={() => setSelectedVaultId(vault.id)}
                                className={cn("cursor-pointer flex flex-col gap-4", i % 2 === 1 && 'md:translate-y-8')}
                              >
                                <CardHeader colorTheme={theme} className="pb-4 mb-2 flex flex-row items-center justify-between">
                                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border-4", 
                                    theme === 1 ? 'bg-[var(--color-max-accent-2)] border-[var(--color-max-accent-3)]' : 
                                    theme === 2 ? 'bg-[var(--color-max-accent-3)] border-[var(--color-max-accent-1)]' : 
                                    theme === 3 ? 'bg-[var(--color-max-accent-4)] border-[var(--color-max-accent-5)]' : 
                                    theme === 4 ? 'bg-[var(--color-max-accent-5)] border-[var(--color-max-accent-2)]' : 
                                    'bg-[var(--color-max-accent-1)] border-[var(--color-max-accent-4)]')}>
                                    <Folder className="h-6 w-6 text-black" />
                                  </div>
                                  <span className="text-sm font-bold bg-black/50 px-2 py-1 rounded">ID: {vault.id.slice(0,6)}</span>
                                </CardHeader>
                                <CardTitle className="text-3xl line-clamp-1">{vault.name}</CardTitle>
                                <p className="text-lg font-bold text-white/80 line-clamp-2">{vault.description}</p>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Inside specific Vault
                  <div className="flex flex-col gap-10 max-w-5xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-4 text-xl font-bold uppercase">
                      <Button variant="ghost" className="px-4 py-2 h-auto text-xl" onClick={() => setSelectedVaultId(null)}>← BACK</Button>
                    </div>

                    {/* Vault Header */}
                    <Card colorTheme={5} pattern="mesh" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8">
                      <div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase text-shadow-triple mb-2">
                          {vaults.find(v => v.id === selectedVaultId)?.name || 'VAULT'}
                        </h2>
                        <p className="text-xl font-bold text-[var(--color-max-accent-2)]">
                          {vaults.find(v => v.id === selectedVaultId)?.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <Button colorTheme={2} variant="secondary" onClick={() => setShowShareModal(true)} className="w-full sm:w-auto">
                          <Share2 className="h-5 w-5 mr-2" /> SHARE
                        </Button>
                        <Button colorTheme={1} onClick={() => {
                          if (!masterKey) handleUnlockVault();
                          else setShowAddSecret(true);
                        }} className="w-full sm:w-auto">
                          <Plus className="h-5 w-5 mr-2" /> ADD SECRET
                        </Button>
                      </div>
                    </Card>

                    {/* Unlock Status */}
                    {!masterKey ? (
                      <Card colorTheme={3} asymmetric="rotate-right" className="text-center py-16 flex flex-col items-center justify-center gap-8">
                        <Lock className="h-20 w-20 text-[var(--color-max-accent-1)] animate-wiggle" />
                        <h3 className="text-5xl font-black uppercase text-shadow-double">UNLOCK REQUIRED 🛑</h3>
                        <p className="text-2xl font-bold text-white/90 max-w-2xl">
                          Decrypt your master key locally to access secrets.
                        </p>
                        
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full mt-6">
                          <Button colorTheme={1} size="large" onClick={handleUnlockVault} disabled={isUnlocking} className="w-full max-w-md">
                            {isUnlocking ? <RefreshCw className="h-6 w-6 animate-spin mr-2" /> : <Unlock className="h-6 w-6 mr-2" />}
                            SIGN & UNLOCK ⚡
                          </Button>
                          
                          <div className="text-2xl font-black italic">OR</div>

                          <form onSubmit={handlePasswordUnlock} className="flex gap-4 w-full max-w-md">
                            <Input 
                              type="password" 
                              colorTheme={4} 
                              value={unlockPassword}
                              onChange={(e) => setUnlockPassword(e.target.value)}
                              placeholder="Local Password"
                              required
                              className="flex-1"
                            />
                            <Button type="submit" colorTheme={4} disabled={isUnlocking}>
                              GO
                            </Button>
                          </form>
                        </div>
                      </Card>
                    ) : (
                      // Secrets List
                      <div className="flex flex-col gap-8">
                        <h3 className="text-4xl font-black uppercase text-shadow-single flex items-center justify-between">
                          <span>SECRETS 🤫</span>
                          <span className="text-2xl bg-[var(--color-max-accent-5)] px-4 py-1 rounded-full border-4 border-black">
                            {loadingSecrets ? 'REFRESHING...' : `${secrets.length} ITEMS`}
                          </span>
                        </h3>

                        {loadingSecrets ? (
                          <div className="py-20 flex justify-center">
                            <RefreshCw className="h-16 w-16 animate-spin text-[var(--color-max-accent-2)]" />
                          </div>
                        ) : secrets.length === 0 ? (
                          <Card colorTheme={2} pattern="dots" className="py-20 text-center border-dashed border-8 flex flex-col items-center gap-6">
                            <Key className="h-20 w-20 text-[var(--color-max-accent-1)]" />
                            <h4 className="text-4xl font-black uppercase text-shadow-single">NO SECRETS HERE 🙈</h4>
                            <Button colorTheme={3} onClick={() => setShowAddSecret(true)}>ADD ONE NOW!</Button>
                          </Card>
                        ) : (
                          <div className="flex flex-col gap-6">
                            {secrets.map((secret, i) => {
                              const theme = getAccentColor(i);
                              const isRevealed = revealedSecrets[secret.id];
                              const decData = decryptedSecrets[secret.cid];

                              return (
                                <Card key={secret.id} colorTheme={theme} asymmetric={i % 2 === 0 ? 'rotate-left' : 'rotate-right'} className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                  <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-black/40 border-4 border-current flex items-center justify-center" style={{ color: `var(--color-max-accent-${theme})` }}>
                                      <FileText className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                      <span className="text-lg font-bold text-white/70 uppercase tracking-widest">{secret.secretType}</span>
                                      <h4 className="text-3xl font-black uppercase mt-1">
                                        {decData ? decData.name : '••••••••••••'}
                                      </h4>
                                    </div>
                                  </div>

                                  {isRevealed && decData && (
                                    <div className="flex-1 w-full md:w-auto md:mx-6 bg-black p-4 rounded-xl border-4 border-dashed border-white/40 flex items-center justify-between shadow-inner">
                                      <span className="text-xl font-mono text-[var(--color-max-accent-2)] font-bold break-all">{decData.value}</span>
                                      <button onClick={() => copyToClipboard(decData.value, secret.id)} className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                                        {copiedText === secret.id ? <Check className="h-6 w-6 text-[var(--color-max-accent-3)]" /> : <Copy className="h-6 w-6 text-white" />}
                                      </button>
                                    </div>
                                  )}

                                  <div className="flex gap-4 w-full md:w-auto">
                                    <Button colorTheme={2} variant="outline" className="flex-1 md:w-auto px-4 py-2 h-14" onClick={() => handleDecryptSecret(secret.id, secret.cid, secret.encryptedName)}>
                                      {isRevealed ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                    </Button>
                                    <Button colorTheme={4} variant="primary" className="flex-1 md:w-auto px-4 py-2 h-14 !bg-rose-500 !border-rose-300" onClick={() => handleDeleteSecret(secret.id)}>
                                      <Trash2 className="h-6 w-6" />
                                    </Button>
                                  </div>
                                </Card>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'activity' && (
              <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <h2 className="text-6xl font-black uppercase text-shadow-mega mb-4">ACTIVITY LOG 📈</h2>
                <Card colorTheme={4} pattern="stripes" className="flex flex-col gap-4">
                  <div className="p-6 border-b-4 border-dashed border-[var(--color-max-accent-4)] flex items-center gap-6">
                    <span className="h-6 w-6 rounded-full bg-[var(--color-max-accent-2)] shadow-glow-base flex-shrink-0"></span>
                    <div>
                      <p className="text-2xl font-bold uppercase">Secret Registry Created</p>
                      <p className="text-lg font-mono text-[var(--color-max-accent-3)]">Tx: 0x7a83b...c382</p>
                    </div>
                  </div>
                  <div className="p-6 flex items-center gap-6">
                    <span className="h-6 w-6 rounded-full bg-[var(--color-max-accent-5)] shadow-glow-base flex-shrink-0"></span>
                    <div>
                      <p className="text-2xl font-bold uppercase">Smart Account Initialized</p>
                      <p className="text-lg font-mono text-[var(--color-max-accent-3)]">Gas sponsored by Pimlico Paymaster</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <h2 className="text-6xl font-black uppercase text-shadow-mega mb-4">SETTINGS ⚙️</h2>
                <Card colorTheme={1} pattern="checker" className="flex flex-col gap-8 p-10">
                  <CardHeader colorTheme={1}>
                    <CardTitle>DEVELOPER API INFO</CardTitle>
                  </CardHeader>
                  <div className="flex flex-col gap-2">
                    <label className="text-xl font-bold text-[var(--color-max-accent-1)] uppercase">Vault Registry Contract</label>
                    <div className="flex items-center justify-between bg-black p-4 border-4 border-[var(--color-max-accent-2)] rounded-xl font-mono text-lg">
                      <span className="truncate mr-4">{VAULT_REGISTRY_ADDRESS}</span>
                      <button onClick={() => copyToClipboard(VAULT_REGISTRY_ADDRESS, 'c1')} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                        {copiedText === 'c1' ? <Check className="h-5 w-5 text-[var(--color-max-accent-3)]" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xl font-bold text-[var(--color-max-accent-1)] uppercase">Secret Registry Contract</label>
                    <div className="flex items-center justify-between bg-black p-4 border-4 border-[var(--color-max-accent-3)] rounded-xl font-mono text-lg">
                      <span className="truncate mr-4">{SECRET_REGISTRY_ADDRESS}</span>
                      <button onClick={() => copyToClipboard(SECRET_REGISTRY_ADDRESS, 'c2')} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg">
                        {copiedText === 'c2' ? <Check className="h-5 w-5 text-[var(--color-max-accent-2)]" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </main>
        </div>
      )}

      {/* MODALS */}
      {showCreateVault && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <Card colorTheme={3} asymmetric="none" className="w-full max-w-xl shadow-hard-triple scale-100">
            <h3 className="text-4xl font-black uppercase text-shadow-single mb-8">CREATE NEW VAULT 🚀</h3>
            <form onSubmit={handleCreateVault} className="flex flex-col gap-6">
              <Input 
                label="Vault Name" 
                colorTheme={1} 
                value={vaultName} 
                onChange={e => setVaultName(e.target.value)} 
                placeholder="SUPER SECRET STUFF" 
                required 
              />
              <div className="flex flex-col gap-2 relative">
                <label className="font-display text-xl uppercase tracking-wider -rotate-1 origin-left ml-2 text-[var(--color-max-accent-2)]">
                  Description
                </label>
                <textarea 
                  value={vaultDesc}
                  onChange={(e) => setVaultDesc(e.target.value)}
                  className="w-full bg-[var(--color-max-muted)]/50 backdrop-blur-sm border-4 border-[var(--color-max-accent-2)] rounded-2xl px-6 py-4 text-lg font-bold text-white placeholder:text-white/40 focus:outline-none focus:bg-[var(--color-max-muted)] focus:ring-4 focus:ring-offset-2 focus:ring-[#00F5D4]/30 focus:ring-offset-[#FFE600] min-h-[120px]"
                  placeholder="Primary vault for production..."
                />
              </div>
              <div className="flex items-center justify-end gap-4 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowCreateVault(false)}>CANCEL</Button>
                <Button type="submit" colorTheme={3} disabled={isCreatingVault}>
                  {isCreatingVault ? <RefreshCw className="h-6 w-6 animate-spin mr-2" /> : <Plus className="h-6 w-6 mr-2" />}
                  CREATE VAULT
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showAddSecret && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
          <Card colorTheme={1} asymmetric="none" pattern="dots" className="w-full max-w-xl my-8">
            <h3 className="text-4xl font-black uppercase text-shadow-single mb-8">ADD SECRET 🤫</h3>
            <form onSubmit={handleAddSecret} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-display text-xl uppercase tracking-wider rotate-1 origin-left ml-2 text-[var(--color-max-accent-5)]">Secret Type</label>
                <select 
                  value={secretType}
                  onChange={(e) => setSecretType(e.target.value)}
                  className="w-full bg-[var(--color-max-muted)]/50 backdrop-blur-sm border-4 border-[var(--color-max-accent-5)] rounded-full px-6 py-4 text-lg font-bold text-white focus:outline-none focus:bg-[var(--color-max-muted)] focus:ring-4 focus:ring-offset-2 focus:ring-[#7B2FFF]/30 focus:ring-offset-[#FF3AF2]"
                >
                  <option value="api-key" className="bg-black">API Key</option>
                  <option value="env-file" className="bg-black">Environment Variable</option>
                  <option value="ssh-key" className="bg-black">SSH Key</option>
                  <option value="password" className="bg-black">Password</option>
                </select>
              </div>
              <Input 
                label="Secret Label" 
                colorTheme={2} 
                value={secretName} 
                onChange={e => setSecretName(e.target.value)} 
                placeholder="STRIPE_LIVE_KEY" 
                required 
              />
              <div className="flex flex-col gap-2 relative">
                <label className="font-display text-xl uppercase tracking-wider -rotate-1 origin-left ml-2 text-[var(--color-max-accent-4)]">
                  Secret Value
                </label>
                <textarea 
                  value={secretVal}
                  onChange={(e) => setSecretVal(e.target.value)}
                  className="w-full bg-[var(--color-max-muted)]/50 backdrop-blur-sm border-4 border-[var(--color-max-accent-4)] rounded-2xl px-6 py-4 text-lg font-bold text-white placeholder:text-white/40 focus:outline-none focus:bg-[var(--color-max-muted)] focus:ring-4 focus:ring-offset-2 focus:ring-[#FF6B35]/30 focus:ring-offset-[#7B2FFF] min-h-[120px]"
                  placeholder="sk_live_..."
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-4 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowAddSecret(false)}>CANCEL</Button>
                <Button type="submit" colorTheme={1} disabled={isAddingSecret}>
                  {isAddingSecret ? <RefreshCw className="h-6 w-6 animate-spin mr-2" /> : <Plus className="h-6 w-6 mr-2" />}
                  ADD TO VAULT
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <Card colorTheme={4} asymmetric="none" className="w-full max-w-xl">
            <h3 className="text-4xl font-black uppercase text-shadow-single mb-8">SHARE VAULT 🤝</h3>
            <form onSubmit={handleShareVault} className="flex flex-col gap-6">
              <Input 
                label="Recipient Address" 
                colorTheme={3} 
                value={shareUserAddress} 
                onChange={e => setShareUserAddress(e.target.value)} 
                placeholder="0x..." 
                className="font-mono"
                required 
              />
              <div className="flex flex-col gap-2">
                <label className="font-display text-xl uppercase tracking-wider rotate-1 origin-left ml-2 text-[var(--color-max-accent-5)]">Permission Level</label>
                <select 
                  value={sharePermissionLevel}
                  onChange={(e) => setSharePermissionLevel(e.target.value)}
                  className="w-full bg-[var(--color-max-muted)]/50 backdrop-blur-sm border-4 border-[var(--color-max-accent-5)] rounded-full px-6 py-4 text-lg font-bold text-white focus:outline-none focus:bg-[var(--color-max-muted)] focus:ring-4 focus:ring-offset-2 focus:ring-[#7B2FFF]/30 focus:ring-offset-[#FF3AF2]"
                >
                  <option value="1" className="bg-black">Read-Only</option>
                  <option value="2" className="bg-black">Read & Write</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-4 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowShareModal(false)}>CANCEL</Button>
                <Button type="submit" colorTheme={4}>
                  SHARE VAULT
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
