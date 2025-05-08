const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RewardAirdrop", function () {
  let rewardAirdrop;
  let owner;
  let user1;
  let user2;
  let mockMaXXHash;
  let mockMAXXToken;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy mock MaXXHash contract
    mockMaXXHash = await ethers.deployContract("MockMaXXHash");
//    const MockMaXXHash = await ethers.getContractFactory("MockMaXXHash");
//    mockMaXXHash = await MockMaXXHash.deploy();
//    await mockMaXXHash.waitForDeployment();

    // Deploy mock MAXX token
    mockMAXXToken = await ethers.deployContract("MockERC20", ["MAXX Token", "MAXX"]);
//    mockMAXXToken = await MockERC20.deploy("MAXX Token", "MAXX");
//    await mockMAXXToken.waitForDeployment();

    // Deploy RewardAirdrop with initial MaXXHash and MAXXToken addresses
    rewardAirdrop = await ethers.deployContract("RewardAirdrop", [mockMaXXHash.getAddress(), mockMAXXToken.getAddress()]);
//    rewardAirdrop = await RewardAirdrop.deploy(mockMaXXHash.address, mockMAXXToken.address);
//    await rewardAirdrop.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should set the correct owner", async function () {
      expect(await rewardAirdrop.owner()).to.equal(owner.address);
    });

    it("Should set the correct MaXXHash address", async function () {
      expect(await rewardAirdrop.MaXXHash()).to.equal(await mockMaXXHash.getAddress());
    });

    it("Should set the correct MAXXToken address", async function () {
      expect(await rewardAirdrop.MAXXToken()).to.equal(await mockMAXXToken.getAddress());
    });

    it("Should allow changing MaXXHash address", async function () {
      await rewardAirdrop.setMaXXHashAddress(user1.address);
      expect(await rewardAirdrop.MaXXHash()).to.equal(user1.address);
    });

    it("Should allow changing token address", async function () {
      await rewardAirdrop.setTokenAddress(user1.address);
      expect(await rewardAirdrop.MAXXToken()).to.equal(user1.address);
    });

    it("Should not allow non-owner to change MaXXHash address", async function () {
      await expect(
        rewardAirdrop.connect(user1).setMaXXHashAddress(user2.address)
      ).to.be.revertedWithCustomError(rewardAirdrop, "OwnableUnauthorizedAccount");
    });

    it("Should not allow non-owner to change token address", async function () {
      await expect(
        rewardAirdrop.connect(user1).setTokenAddress(user2.address)
      ).to.be.revertedWithCustomError(rewardAirdrop, "OwnableUnauthorizedAccount");
    });
  });

  describe("Airdrop functionality", function () {
    beforeEach(async function () {
      // Set up MaXXHash NFT owners
      await mockMaXXHash.setTotalSupply(3);
      await mockMaXXHash.setOwner(1, user1.address);
      await mockMaXXHash.setOwner(2, user2.address);
      await mockMaXXHash.setOwner(3, owner.address);

      // Transfer tokens to the airdrop contract
      const airdropAmount = ethers.parseEther("300"); // 100 tokens per holder
      await mockMAXXToken.mint(rewardAirdrop.getAddress(), airdropAmount);
    });

    it("Should distribute tokens evenly among NFT holders", async function () {
      // Verify initial balances
      expect(await mockMAXXToken.balanceOf(user1.address)).to.equal(0);
      expect(await mockMAXXToken.balanceOf(user2.address)).to.equal(0);
      expect(await mockMAXXToken.balanceOf(owner.address)).to.equal(0);
      
      // Execute airdrop
      await rewardAirdrop.airdrop();
      
      // Each holder should get an equal share: 300 / 3 = 100 tokens each
      const expectedTokens = ethers.parseEther("100");
      
      expect(await mockMAXXToken.balanceOf(user1.address)).to.equal(expectedTokens);
      expect(await mockMAXXToken.balanceOf(user2.address)).to.equal(expectedTokens);
      expect(await mockMAXXToken.balanceOf(owner.address)).to.equal(expectedTokens);
    });

    it("Should not allow airdrop if token balance is less than total supply", async function () {
      // First, withdraw all tokens from the contract
      await rewardAirdrop.withdrawTokens(mockMAXXToken.getAddress());
      
      // Now try to execute airdrop with insufficient balance
      await expect(rewardAirdrop.airdrop()).to.be.revertedWith(
        "Insufficient token balance for airdrop"
      );
    });

    it("Should not allow non-owner to execute airdrop", async function () {
      await expect(rewardAirdrop.connect(user1).airdrop())
        .to.be.revertedWithCustomError(rewardAirdrop, "OwnableUnauthorizedAccount");
    });
  });

  describe("Withdrawal functions", function () {
    beforeEach(async function () {
      // Send tokens to contract
      await mockMAXXToken.mint(rewardAirdrop.getAddress(), ethers.parseEther("100"));
    });

    it("Should allow owner to withdraw tokens", async function () {
      const initialBalance = await mockMAXXToken.balanceOf(owner.address);
      
      // Withdraw tokens
      await rewardAirdrop.withdrawTokens(mockMAXXToken.getAddress());
      
      const finalBalance = await mockMAXXToken.balanceOf(owner.address);
      
      // Owner should have received all tokens
      expect(finalBalance - initialBalance)
        .to.equal(ethers.parseEther("100"));
      
      // Contract should have 0 tokens left
      expect(await mockMAXXToken.balanceOf(rewardAirdrop.getAddress()))
        .to.equal(0);
    });

    it("Should not allow non-owner to withdraw tokens", async function () {
      await expect(rewardAirdrop.connect(user1).withdrawTokens(mockMAXXToken.getAddress()))
        .to.be.revertedWithCustomError(rewardAirdrop, "OwnableUnauthorizedAccount");
    });
  });
});
