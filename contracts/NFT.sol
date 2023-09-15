// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma experimental ABIEncoderV2;

import "../chiru-labs/ERC721A.sol";
import "../openzeppelin/utils/cryptography/ECDSA.sol";
import "../openzeppelin/access/Ownable.sol";
import "../openzeppelin/utils/cryptography/MerkleProof.sol";
import "../openzeppelin/security/ReentrancyGuard.sol";

contract NFT is ERC721A, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    bytes32 private merkleRoot;
    string private baseTokenURI;
    uint256 public totalNFTs;
    uint256 public publicSalePrice = 0.01 ether;
    mapping(address => uint256) public NFTtracker;
    mapping(address => bool) public AdminList;
  
    bool public publicSaleStarted;
    bool public presaleStarted;

    event BaseURIChanged(string baseURI);
    event PublicSaleMint(address mintTo, uint256 tokensCount);

    constructor(string memory baseURI) ERC721A("Collection", "NFT") Ownable(msg.sender){
        baseTokenURI = baseURI;     
        totalNFTs = 0;
    }

    //Mint

    function PublicMint(uint256 quantity) external payable whenPublicSaleStarted nonReentrant  {
        require(publicSalePrice * quantity <= msg.value, "Fund amount is incorrect");
        _safeMint(msg.sender, quantity);
        totalNFTs += quantity;
        NFTtracker[msg.sender] += quantity;
    }

    function AdminMint(uint256 quantity, address to) external payable nonReentrant  {
        require(AdminList[msg.sender], "Caller doesn't have admin role");
        _safeMint(to, quantity);
        totalNFTs += quantity;
        NFTtracker[msg.sender] += quantity;
    }

    function PresaleMint(uint256 quantity, bytes32[] calldata _merkleProof) external payable whenPresaleStarted nonReentrant  {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Presale must be minted from our website");
        _safeMint(msg.sender, quantity);
        totalNFTs += quantity;
        NFTtracker[msg.sender] += quantity;
    }

    //Sales

    modifier whenPublicSaleStarted() {
        require(publicSaleStarted, "Public sale has not started yet");
        _;
    }

    modifier whenPresaleStarted() {
        require(presaleStarted, "Presale has not started yet");
        _;
    }

    function togglePublicSaleStarted() external onlyOwner {
        publicSaleStarted = !publicSaleStarted;
    }

    function togglePresaleStarted() external onlyOwner {
        presaleStarted = !presaleStarted;
    }

    //NFT Metadata Methods

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721A) returns (string memory) 
    {
        string memory _tokenURI = super.tokenURI(tokenId);
        return string(abi.encodePacked(_tokenURI, ".json"));
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
        emit BaseURIChanged(baseURI);
    }

    // Setting

    function setAdminRole(address newAdmin, bool state) external onlyOwner {
        AdminList[newAdmin] = state;
    }

    function setMerkleRoot(bytes32 newRoot) external onlyOwner {
        merkleRoot = newRoot;
    }

    // Withdraw

    function withdrawAll() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Insufficent balance");
        _widthdraw(owner(), address(this).balance);
    }

    function _widthdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{ value: _amount }("");
        require(success, "Failed to widthdraw Ether");
    }

}