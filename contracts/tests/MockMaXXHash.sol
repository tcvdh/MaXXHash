// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

contract MockMaXXHash {
    mapping(uint256 => address) private _owners;
    uint256 private _totalSupply;

    function setOwner(uint256 tokenId, address owner) external {
        _owners[tokenId] = owner;
    }

    function setTotalSupply(uint256 supply) external {
        _totalSupply = supply;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        require(tokenId > 0 && tokenId <= _totalSupply, "Token does not exist");
        return _owners[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
}

