const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MaXXHash Contract", function () {
  let maxxHash;
  let owner;
  let user1;
  let user2;
  let users;
  
  const INITIAL_MAX_SUPPLY = 10000;
  const INITIAL_BASE_URI = "ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx/";
  const DEFAULT_PRICE = ethers.parseEther("0.01");
  const MAX_MINT_AMOUNT = 10;
  
  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, ...users] = await ethers.getSigners();
    
    // Deploy using upgrades library
    const MaXXHash = await ethers.getContractFactory("MaXXHash");
    
    // Use deployProxy to handle initialization correctly
    maxxHash = await upgrades.deployProxy(
      MaXXHash, 
      [INITIAL_MAX_SUPPLY, INITIAL_BASE_URI], 
      { initializer: 'initialize' }
    );
    
    // Set max mint amount
    await maxxHash.setMaxMintAmount(MAX_MINT_AMOUNT);
  });
  
  describe("Initialization", function () {
    it("Should set the correct initial values", async function () {
      expect(await maxxHash.name()).to.equal("MaXXHash");
      expect(await maxxHash.symbol()).to.equal("MHR");
      expect(await maxxHash.maxSupply()).to.equal(INITIAL_MAX_SUPPLY);
      expect(await maxxHash.price()).to.equal(DEFAULT_PRICE);
      expect(await maxxHash.totalSupply()).to.equal(0);
      expect(await maxxHash.owner()).to.equal(owner.address);
      expect(await maxxHash.maxMintAmount()).to.equal(MAX_MINT_AMOUNT);
    });
  });
  
  describe("Minting", function () {
    it("Should mint tokens correctly", async function () {
      const mintAmount = 3;
      const totalPrice = DEFAULT_PRICE * BigInt(mintAmount);
      
      await expect(maxxHash.connect(user1).mint(user1.address, mintAmount, { value: totalPrice }))
        .to.emit(maxxHash, "TokensMinted")
        .withArgs(user1.address, mintAmount, mintAmount);
      
      expect(await maxxHash.totalSupply()).to.equal(mintAmount);
      expect(await maxxHash.ownerOf(1)).to.equal(user1.address);
      expect(await maxxHash.ownerOf(2)).to.equal(user1.address);
      expect(await maxxHash.ownerOf(3)).to.equal(user1.address);
    });
    
    it("Should fail if minting more than maxMintAmount", async function () {
      const maxMintAmount = await maxxHash.maxMintAmount();
      const excessAmount = Number(maxMintAmount) + 1;
      const totalPrice = DEFAULT_PRICE * BigInt(excessAmount);
      
      await expect(
        maxxHash.connect(user1).mint(user1.address, excessAmount, { value: totalPrice })
      ).to.be.revertedWith("Exceeds max mint amount");
    });
    
    it("Should fail if insufficient funds provided", async function () {
      const mintAmount = 3;
      const insufficientFunds = DEFAULT_PRICE * BigInt(mintAmount) - 1n;
      
      await expect(
        maxxHash.connect(user1).mint(user1.address, mintAmount, { value: insufficientFunds })
      ).to.be.revertedWith("Insufficient funds");
    });
    
    it("Should fail if minting to zero address", async function () {
      const mintAmount = 1;
      const totalPrice = DEFAULT_PRICE * BigInt(mintAmount);
      
      await expect(
        maxxHash.connect(user1).mint(ethers.ZeroAddress, mintAmount, { value: totalPrice })
      ).to.be.revertedWith("Zero address not allowed");
    });
    
    it("Should fail if amount is zero", async function () {
      await expect(
        maxxHash.connect(user1).mint(user1.address, 0, { value: 0 })
      ).to.be.revertedWith("Amount cannot be zero");
    });
    
    it("Should fail if max supply would be exceeded", async function () {
      // Set max supply to a small number
      await maxxHash.setMaxSupply(2);
      
      // Try to mint more than max supply
      await expect(
        maxxHash.connect(user1).mint(user1.address, 3, { value: DEFAULT_PRICE * 3n })
      ).to.be.revertedWith("Max supply reached");
    });
    
    it("Should fail when trying to mint through a contract", async function () {
      // This is a simple way to simulate a contract call in a test
      // For actual contract-to-contract testing, you would deploy a mock contract
      // that attempts to call mint
      const MaliciousContractFactory = await ethers.getContractFactory("MaliciousMinter");
      const maliciousContract = await MaliciousContractFactory.deploy(await maxxHash.getAddress());
      
      await expect(
        maliciousContract.attemptMint(user1.address, 1, { value: DEFAULT_PRICE })
      ).to.be.revertedWith("No contracts allowed");
    });
  });
  
  describe("TokenURI", function () {
    it("Should return the correct token URI", async function () {
      // Mint a token first
      await maxxHash.connect(user1).mint(user1.address, 1, { value: DEFAULT_PRICE });
      
      const tokenId = 1;
      const expectedURI = `${INITIAL_BASE_URI}${tokenId}.json`;
      expect(await maxxHash.tokenURI(tokenId)).to.equal(expectedURI);
    });
    
    it("Should return empty string if baseURI is empty", async function () {
      // Set empty base URI
      await maxxHash.setBaseURI("");
      
      // Mint a token
      await maxxHash.connect(user1).mint(user1.address, 1, { value: DEFAULT_PRICE });
      
      // Verify empty URI
      expect(await maxxHash.tokenURI(1)).to.equal("");
    });
    
    it("Should revert for non-existent token", async function () {
      await expect(maxxHash.tokenURI(999)).to.be.reverted;
    });
  });
  
  describe("Owner Functions", function () {
    it("Should allow owner to change price", async function () {
      const newPrice = ethers.parseEther("0.05");
      await maxxHash.setPrice(newPrice);
      expect(await maxxHash.price()).to.equal(newPrice);
    });
    
    it("Should allow owner to change max mint amount", async function () {
      const newMaxMint = 20;
      await maxxHash.setMaxMintAmount(newMaxMint);
      expect(await maxxHash.maxMintAmount()).to.equal(newMaxMint);
    });
    
    it("Should allow owner to change max supply", async function () {
      const newMaxSupply = 20000;
      await maxxHash.setMaxSupply(newMaxSupply);
      expect(await maxxHash.maxSupply()).to.equal(newMaxSupply);
    });
    
    it("Should not allow setting max supply below current total supply", async function () {
      // Mint some tokens first
      await maxxHash.connect(user1).mint(user1.address, 5, { value: DEFAULT_PRICE * 5n });
      
      // Try to set max supply below the current total supply
      await expect(maxxHash.setMaxSupply(3)).to.be.revertedWith(
        "New max supply cannot be less than total supply"
      );
    });
    
    it("Should allow owner to change base URI", async function () {
      const newURI = "https://api.example.com/metadata/";
      await maxxHash.setBaseURI(newURI);
      
      // Mint a token and check its URI
      await maxxHash.connect(user1).mint(user1.address, 1, { value: DEFAULT_PRICE });
      expect(await maxxHash.tokenURI(1)).to.equal(`${newURI}1.json`);
    });
    
    it("Should allow owner to withdraw funds", async function () {
      // Mint some tokens to add funds to the contract
      await maxxHash.connect(user1).mint(user1.address, 5, { value: DEFAULT_PRICE * 5n });
      
      const contractBalance = await ethers.provider.getBalance(await maxxHash.getAddress());
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      // Owner withdraws funds
      const tx = await maxxHash.withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      
      // Check balances after withdrawal
      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      const finalContractBalance = await ethers.provider.getBalance(await maxxHash.getAddress());
      
      expect(finalContractBalance).to.equal(0);
      expect(finalOwnerBalance + gasCost - initialOwnerBalance).to.equal(contractBalance);
    });
    
    it("Should prevent non-owner from calling owner functions", async function () {
      await expect(maxxHash.connect(user1).setPrice(ethers.parseEther("0.1"))).to.be.reverted;
      await expect(maxxHash.connect(user1).setMaxMintAmount(50)).to.be.reverted;
      await expect(maxxHash.connect(user1).setMaxSupply(15000)).to.be.reverted;
      await expect(maxxHash.connect(user1).setBaseURI("newuri")).to.be.reverted;
      await expect(maxxHash.connect(user1).withdraw()).to.be.reverted;
    });
  });
});

