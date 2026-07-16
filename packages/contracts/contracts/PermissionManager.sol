// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVaultRegistry {
    function isOwner(bytes32 vaultId, address account) external view returns (bool);
}

contract PermissionManager {
    enum PermissionLevel { NONE, READ, WRITE }

    IVaultRegistry public immutable vaultRegistry;

    // vaultId => user address => permission level
    mapping(bytes32 => mapping(address => PermissionLevel)) private _vaultPermissions;

    event PermissionGranted(bytes32 indexed vaultId, address indexed user, PermissionLevel level, address indexed grantor);
    event PermissionRevoked(bytes32 indexed vaultId, address indexed user, address indexed grantor);

    modifier onlyVaultOwner(bytes32 vaultId) {
        require(vaultRegistry.isOwner(vaultId, msg.sender), "PermissionManager: caller is not the vault owner");
        _;
    }

    constructor(address _vaultRegistryAddress) {
        require(_vaultRegistryAddress != address(0), "PermissionManager: invalid registry address");
        vaultRegistry = IVaultRegistry(_vaultRegistryAddress);
    }

    /**
     * @dev Grant permission to a user for a vault.
     */
    function grantPermission(bytes32 vaultId, address user, PermissionLevel level) external onlyVaultOwner(vaultId) {
        require(user != address(0), "PermissionManager: invalid user address");
        require(user != msg.sender, "PermissionManager: owner already has full access");
        _vaultPermissions[vaultId][user] = level;

        emit PermissionGranted(vaultId, user, level, msg.sender);
    }

    /**
     * @dev Revoke permission from a user for a vault.
     */
    function revokePermission(bytes32 vaultId, address user) external onlyVaultOwner(vaultId) {
        _vaultPermissions[vaultId][user] = PermissionLevel.NONE;

        emit PermissionRevoked(vaultId, user, msg.sender);
    }

    /**
     * @dev Check if a user has at least a specific permission level for a vault.
     */
    function hasPermission(bytes32 vaultId, address user, PermissionLevel requiredLevel) external view returns (bool) {
        if (vaultRegistry.isOwner(vaultId, user)) {
            return true; // Owner always has permission
        }
        return uint8(_vaultPermissions[vaultId][user]) >= uint8(requiredLevel);
    }

    /**
     * @dev Get permission level of a user for a vault.
     */
    function getPermissionLevel(bytes32 vaultId, address user) external view returns (PermissionLevel) {
        if (vaultRegistry.isOwner(vaultId, user)) {
            return PermissionLevel.WRITE;
        }
        return _vaultPermissions[vaultId][user];
    }
}
