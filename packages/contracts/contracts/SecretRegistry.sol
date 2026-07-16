// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPermissionManager {
    enum PermissionLevel { NONE, READ, WRITE }
    function hasPermission(bytes32 vaultId, address user, PermissionLevel requiredLevel) external view returns (bool);
}

contract SecretRegistry {
    struct Secret {
        bytes32 id;
        bytes32 vaultId;
        string encryptedName; // Encrypted on the client side
        string cid;           // Storacha IPFS CID
        string secretType;    // Type identifier (e.g., api-key, env-file, cert)
        uint256 version;
        uint256 createdAt;
        uint256 updatedAt;
        bool isDeleted;
    }

    struct SecretVersion {
        string cid;
        uint256 version;
        uint256 timestamp;
    }

    IPermissionManager public immutable permissionManager;

    // Mapping from Secret ID to Secret struct
    mapping(bytes32 => Secret) private _secrets;

    // Mapping from Vault ID to list of Secret IDs
    mapping(bytes32 => bytes32[]) private _vaultSecrets;

    // Mapping from Secret ID to history of versions
    mapping(bytes32 => SecretVersion[]) private _secretVersions;

    event SecretStored(bytes32 indexed id, bytes32 indexed vaultId, string encryptedName, string cid, uint256 version, address indexed sender);
    event SecretUpdated(bytes32 indexed id, string cid, uint256 version, address indexed sender);
    event SecretDeleted(bytes32 indexed id, address indexed sender);

    modifier onlyWithWriteAccess(bytes32 vaultId) {
        require(
            permissionManager.hasPermission(vaultId, msg.sender, IPermissionManager.PermissionLevel.WRITE),
            "SecretRegistry: caller does not have WRITE access to this vault"
        );
        _;
    }

    modifier onlyWithReadAccess(bytes32 vaultId) {
        require(
            permissionManager.hasPermission(vaultId, msg.sender, IPermissionManager.PermissionLevel.READ),
            "SecretRegistry: caller does not have READ access to this vault"
        );
        _;
    }

    constructor(address _permissionManagerAddress) {
        require(_permissionManagerAddress != address(0), "SecretRegistry: invalid permission manager address");
        permissionManager = IPermissionManager(_permissionManagerAddress);
    }

    /**
     * @dev Stores a new secret or a new version of an existing secret.
     */
    function storeSecret(
        bytes32 vaultId,
        string calldata encryptedName,
        string calldata cid,
        string calldata secretType
    ) external onlyWithWriteAccess(vaultId) returns (bytes32) {
        bytes32 secretId = keccak256(abi.encodePacked(vaultId, encryptedName, block.timestamp));
        require(_secrets[secretId].id == bytes32(0), "SecretRegistry: secret already exists");

        Secret memory newSecret = Secret({
            id: secretId,
            vaultId: vaultId,
            encryptedName: encryptedName,
            cid: cid,
            secretType: secretType,
            version: 1,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            isDeleted: false
        });

        _secrets[secretId] = newSecret;
        _vaultSecrets[vaultId].push(secretId);

        _secretVersions[secretId].push(SecretVersion({
            cid: cid,
            version: 1,
            timestamp: block.timestamp
        }));

        emit SecretStored(secretId, vaultId, encryptedName, cid, 1, msg.sender);
        return secretId;
    }

    /**
     * @dev Rotate/Update a secret's value (creates a new version).
     */
    function updateSecret(bytes32 secretId, string calldata cid) external {
        Secret storage secret = _secrets[secretId];
        require(secret.id != bytes32(0), "SecretRegistry: secret does not exist");
        require(!secret.isDeleted, "SecretRegistry: secret is deleted");
        
        // Verify write access to the vault
        require(
            permissionManager.hasPermission(secret.vaultId, msg.sender, IPermissionManager.PermissionLevel.WRITE),
            "SecretRegistry: caller does not have WRITE access to this vault"
        );

        secret.cid = cid;
        secret.version += 1;
        secret.updatedAt = block.timestamp;

        _secretVersions[secretId].push(SecretVersion({
            cid: cid,
            version: secret.version,
            timestamp: block.timestamp
        }));

        emit SecretUpdated(secretId, cid, secret.version, msg.sender);
    }

    /**
     * @dev Marks a secret as deleted (soft delete).
     */
    function deleteSecret(bytes32 secretId) external {
        Secret storage secret = _secrets[secretId];
        require(secret.id != bytes32(0), "SecretRegistry: secret does not exist");
        require(!secret.isDeleted, "SecretRegistry: secret is already deleted");

        // Verify write access to delete
        require(
            permissionManager.hasPermission(secret.vaultId, msg.sender, IPermissionManager.PermissionLevel.WRITE),
            "SecretRegistry: caller does not have WRITE access to this vault"
        );

        secret.isDeleted = true;
        secret.updatedAt = block.timestamp;

        emit SecretDeleted(secretId, msg.sender);
    }

    /**
     * @dev Returns secret metadata.
     */
    function getSecret(bytes32 secretId) external view returns (Secret memory) {
        Secret memory secret = _secrets[secretId];
        require(secret.id != bytes32(0), "SecretRegistry: secret does not exist");
        require(!secret.isDeleted, "SecretRegistry: secret is deleted");
        
        // Verify read access to the vault
        require(
            permissionManager.hasPermission(secret.vaultId, msg.sender, IPermissionManager.PermissionLevel.READ),
            "SecretRegistry: caller does not have READ access to this vault"
        );

        return secret;
    }

    /**
     * @dev Returns all non-deleted secret IDs in a vault.
     */
    function getVaultSecrets(bytes32 vaultId) external view onlyWithReadAccess(vaultId) returns (bytes32[] memory) {
        uint256 total = _vaultSecrets[vaultId].length;
        
        // Count active (non-deleted) secrets
        uint256 activeCount = 0;
        for (uint256 i = 0; i < total; i++) {
            if (!_secrets[_vaultSecrets[vaultId][i]].isDeleted) {
                activeCount++;
            }
        }

        bytes32[] memory activeSecrets = new bytes32[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < total; i++) {
            bytes32 sId = _vaultSecrets[vaultId][i];
            if (!_secrets[sId].isDeleted) {
                activeSecrets[index] = sId;
                index++;
            }
        }

        return activeSecrets;
    }

    /**
     * @dev Returns version history of a secret.
     */
    function getSecretVersions(bytes32 secretId) external view returns (SecretVersion[] memory) {
        Secret memory secret = _secrets[secretId];
        require(secret.id != bytes32(0), "SecretRegistry: secret does not exist");
        
        // Verify read access
        require(
            permissionManager.hasPermission(secret.vaultId, msg.sender, IPermissionManager.PermissionLevel.READ),
            "SecretRegistry: caller does not have READ access to this vault"
        );

        return _secretVersions[secretId];
    }
}
