// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VaultRegistry {
    struct Vault {
        bytes32 id;
        string name;
        string description;
        address owner;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // Mapping from Vault ID to Vault struct
    mapping(bytes32 => Vault) private _vaults;
    
    // Mapping from owner address to list of Vault IDs they own
    mapping(address => bytes32[]) private _ownerVaults;

    event VaultCreated(bytes32 indexed id, string name, address indexed owner, uint256 createdAt);
    event VaultUpdated(bytes32 indexed id, string name, uint256 updatedAt);
    event VaultDeleted(bytes32 indexed id, address indexed owner);

    modifier onlyVaultOwner(bytes32 vaultId) {
        require(_vaults[vaultId].owner == msg.sender, "VaultRegistry: caller is not the owner");
        _;
    }

    /**
     * @dev Creates a new vault.
     */
    function createVault(string calldata name, string calldata description) external returns (bytes32) {
        bytes32 vaultId = keccak256(abi.encodePacked(msg.sender, name, block.timestamp));
        require(_vaults[vaultId].owner == address(0), "VaultRegistry: vault already exists");

        Vault memory newVault = Vault({
            id: vaultId,
            name: name,
            description: description,
            owner: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _vaults[vaultId] = newVault;
        _ownerVaults[msg.sender].push(vaultId);

        emit VaultCreated(vaultId, name, msg.sender, block.timestamp);
        return vaultId;
    }

    /**
     * @dev Updates an existing vault's details.
     */
    function updateVault(bytes32 vaultId, string calldata name, string calldata description) external onlyVaultOwner(vaultId) {
        Vault storage vault = _vaults[vaultId];
        vault.name = name;
        vault.description = description;
        vault.updatedAt = block.timestamp;

        emit VaultUpdated(vaultId, name, block.timestamp);
    }

    /**
     * @dev Returns vault details.
     */
    function getVault(bytes32 vaultId) external view returns (Vault memory) {
        require(_vaults[vaultId].owner != address(0), "VaultRegistry: vault does not exist");
        return _vaults[vaultId];
    }

    /**
     * @dev Returns all vaults owned by the caller.
     */
    function getMyVaults() external view returns (bytes32[] memory) {
        return _ownerVaults[msg.sender];
    }

    /**
     * @dev Checks if an address is the owner of a vault.
     */
    function isOwner(bytes32 vaultId, address account) external view returns (bool) {
        return _vaults[vaultId].owner == account;
    }
}
