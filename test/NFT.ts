const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
import { ethers } from "hardhat";
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

describe("NFT", function () {
  async function deployFixture() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const NFT_contract = await ethers.deployContract("NFT");
    return { NFT_contract, owner, addr1, addr2, addr3 };
  };

  it("Public sale has not started revert", async function () {
    const { NFT_contract, addr1 } = await loadFixture(deployFixture);
    expect(NFT_contract.connect(addr1).PublicMint(1), { value: 10000000000000000n }).to.be.revertedWith('Public sale has not started yet');
  })

  it("Incorrect fund amount revert", async function () {
    const { NFT_contract, addr1 } = await loadFixture(deployFixture);
    await NFT_contract.togglePublicSaleStarted();
    expect(NFT_contract.connect(addr1).PublicMint(1), { value: 10000000000000000n }).to.be.revertedWith('Fund amount is incorrect');
  })

  it("it should be public minted", async function () {
    const { NFT_contract, addr1 } = await loadFixture(deployFixture);
    await NFT_contract.togglePublicSaleStarted();
    await NFT_contract.connect(addr1).PublicMint(1, { value: 10000000000000000n });
    expect(NFT_contract.connect(addr1).balanceOf(addr1) == 1);
  })

  it("Caller doesn't have admin role revert", async function () {
    const { NFT_contract, addr1 } = await loadFixture(deployFixture);
    expect(NFT_contract.connect(addr1).AdminMint(1, addr1)).to.be.revertedWith("Caller doesn't have admin role");
  })

  it("it should be admin minted", async function () {
    const { NFT_contract, addr1, owner } = await loadFixture(deployFixture);
    await NFT_contract.connect(owner).setAdminRole(addr1, true);
    await NFT_contract.connect(addr1).AdminMint(1, addr1);
    expect(NFT_contract.connect(addr1).balanceOf(addr1) == 1);
  })

  it("Presale has not started revert", async function () {
    const { NFT_contract, addr1 } = await loadFixture(deployFixture);
    expect(NFT_contract.connect(addr1).PresaleMint(1)).to.be.revertedWith('Presale has not started yet');
  })

  it("Whitelist revert", async function () {
    const { NFT_contract, addr1 } = await loadFixture(deployFixture);
    await NFT_contract.togglePresaleStarted();
    expect(NFT_contract.connect(addr1).PresaleMint(1)).to.be.revertedWith('Presale must be minted from our website');
  })

  it("it should be presale minted", async function () {
    const { NFT_contract, addr1, addr2, addr3 } = await loadFixture(deployFixture);

    let proof = []
    const whitelistaddresses = [addr1.address.toString(), addr2.address.toString(), addr3.address.toString()]
    const leaves = whitelistaddresses.map((addr) => keccak256(addr));
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    const merkleRootHash = merkleTree.getHexRoot()

    await NFT_contract.setMerkleRoot(merkleRootHash);
    await NFT_contract.togglePresaleStarted();

    const hashedAddress = keccak256(whitelistaddresses[0]);
    proof = merkleTree.getHexProof(hashedAddress);

    await NFT_contract.connect(addr1).PresaleMint(1, proof);

    expect(NFT_contract.connect(addr1).balanceOf(addr1) == 1);
  })

  it("it should be funded", async function () {
    const { NFT_contract, addr1 } = await loadFixture(deployFixture);
    await NFT_contract.togglePublicSaleStarted();
    await NFT_contract.connect(addr1).PublicMint(1, { value: 10000000000000000n });
    expect(await ethers.provider.getBalance(NFT_contract) == 10000000000000000n);
  })

  it("it should be withdrawed", async function () {
    const { NFT_contract, addr1 } = await loadFixture(deployFixture);
    await NFT_contract.togglePublicSaleStarted();
    await NFT_contract.connect(addr1).PublicMint(1, { value: 10000000000000000n });
    await NFT_contract.withdrawAll();
    expect(await ethers.provider.getBalance(NFT_contract) == 0n);
  })

});
