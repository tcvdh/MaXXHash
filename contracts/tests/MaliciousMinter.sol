// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "../maxxhash.sol";

// Simple contract to test the tx.origin != msg.sender check
contract MaliciousMinter {
    MaXXHash public nftContract;
    
    constructor(address _nftContract) {
        nftContract = MaXXHash(_nftContract);
    }
    
    function attemptMint(address to, uint256 amount) external payable {
        // This should fail due to tx.origin != msg.sender check
        nftContract.mint{value: msg.value}(to, amount);
    }
}

