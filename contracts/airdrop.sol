// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardAirdrop is Ownable {
    IMaXXHash public MaXXHash;
    IERC20 public MAXXToken;

    constructor(address MaXXHashAddress, address MAXXTokenAddress) Ownable(msg.sender) {
        MaXXHash = IMaXXHash(MaXXHashAddress);
        MAXXToken = IERC20(MAXXTokenAddress);
    }

    function airdrop() external onlyOwner {
        uint256 totalSupply = MaXXHash.totalSupply();
        uint256 tokenBalance = MAXXToken.balanceOf(address(this));
        require(
            tokenBalance >= totalSupply,
            "Insufficient token balance for airdrop"
        );
        uint256 amountPerHolder = tokenBalance / totalSupply;

        for (uint256 i = 1; i <= totalSupply; i++) {
            address holder = MaXXHash.ownerOf(i);
            if (holder != address(0)) {
                MAXXToken.transfer(holder, amountPerHolder);
            }
        }
    }

    function setMaXXHashAddress(address maXXHashAddress) external onlyOwner {
        MaXXHash = IMaXXHash(maXXHashAddress);
    }

    function setTokenAddress(address tokenAddress) external onlyOwner {
        MAXXToken = IERC20(tokenAddress);
    }

    function withdrawTokens(address tokenAddress) external onlyOwner {
        uint256 tokenBalance = IERC20(tokenAddress).balanceOf(address(this));
        IERC20(tokenAddress).transfer(msg.sender, tokenBalance);
    }
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

interface IMaXXHash {
    function ownerOf(uint256 tokenId) external view returns (address);

    function totalSupply() external view returns (uint256);
}
