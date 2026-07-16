const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of VaultOne smart contracts...");

  // 1. Deploy VaultRegistry
  console.log("Deploying VaultRegistry...");
  const VaultRegistry = await hre.ethers.getContractFactory("VaultRegistry");
  const vaultRegistry = await VaultRegistry.deploy();
  await vaultRegistry.waitForDeployment();
  const vaultRegistryAddress = await vaultRegistry.getAddress();
  console.log(`VaultRegistry deployed to: ${vaultRegistryAddress}`);

  // 2. Deploy PermissionManager (depends on VaultRegistry)
  console.log("Deploying PermissionManager...");
  const PermissionManager = await hre.ethers.getContractFactory("PermissionManager");
  const permissionManager = await PermissionManager.deploy(vaultRegistryAddress);
  await permissionManager.waitForDeployment();
  const permissionManagerAddress = await permissionManager.getAddress();
  console.log(`PermissionManager deployed to: ${permissionManagerAddress}`);

  // 3. Deploy SecretRegistry (depends on PermissionManager)
  console.log("Deploying SecretRegistry...");
  const SecretRegistry = await hre.ethers.getContractFactory("SecretRegistry");
  const secretRegistry = await SecretRegistry.deploy(permissionManagerAddress);
  await secretRegistry.waitForDeployment();
  const secretRegistryAddress = await secretRegistry.getAddress();
  console.log(`SecretRegistry deployed to: ${secretRegistryAddress}`);

  console.log("\nDeployment completed successfully!");
  console.log("-----------------------------------");
  console.log(`VaultRegistry:     ${vaultRegistryAddress}`);
  console.log(`PermissionManager: ${permissionManagerAddress}`);
  console.log(`SecretRegistry:     ${secretRegistryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
