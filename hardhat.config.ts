import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("mint_admin", "Airdrop a NFT token")
  .addParam("contract", "Contract address")
  .addParam("to", "Future owner address")
  .setAction(async (taskArgs, hre) => {
    const { contract, to } = taskArgs;
    console.log(`Minting NFT token for contract ${contract}`);
    console.log(`To: ${to}`);
    const NFT_contract = await hre.ethers.getContractAt("NFT", contract);

    const tx = await NFT_contract.AdminMint(1, to);
    
    const blockHash = await tx.wait();
    console.log("Minted NFT", blockHash);
  });

  task("mint_public", "Mint an NFT to msg sender")
  .addParam("contract", "Contract address")
  .addParam("quantity", "Future owner address")
  .setAction(async (taskArgs, hre) => {
    const { contract, quantity } = taskArgs;
    console.log(`Minting NFT token for contract ${contract}`);
    console.log(`Amount: ${quantity}`);
    const NFT_contract = await hre.ethers.getContractAt("NFT", contract);

    const tx = await NFT_contract.PublicMint(quantity);
    const blockHash = await tx.wait();
    console.log("Minted NFT", blockHash);
  });

  task("switch_public", "Switches Public Sales")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const { contract, quantity } = taskArgs;
    console.log(`Switching public sales at contract ${contract}`);
    const NFT_contract = await hre.ethers.getContractAt("NFT", contract);

    const tx = await NFT_contract.togglePublicSaleStarted();
    const blockHash = await tx.wait();
    console.log("Switched", blockHash);
  });

  task("switch_presale", "Switches Whitelist Sales")
  .addParam("contract", "Contract address")
  .setAction(async (taskArgs, hre) => {
    const { contract, quantity } = taskArgs;
    console.log(`Switching public sales at contract ${contract}`);
    const NFT_contract = await hre.ethers.getContractAt("NFT", contract);

    const tx = await NFT_contract.togglePresaleStarted();
    const blockHash = await tx.wait();
    console.log("Switched", blockHash);
  });

const config: HardhatUserConfig = {
  solidity: "0.8.20",
};

export default config;
