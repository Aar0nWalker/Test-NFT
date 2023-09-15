import { ethers } from "hardhat";

async function main() {

  const token_uri = "ipfs://*your_uri";
  const contract_instanse = await ethers.deployContract("NFT", [token_uri]);

  await contract_instanse.waitForDeployment();

  console.log('NFT Contract Deployed at ' + contract_instanse.target);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error)
    process.exit(1)
  })