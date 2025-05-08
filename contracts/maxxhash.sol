// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MaXXHash is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable
{
    using Strings for uint256;

    event TokensMinted(address indexed to, uint256 indexed amount, uint256 currentTotalSupply);

    uint256 public totalSupply;
    uint256 public maxSupply;
    string private baseURI;
    uint256 public price;

    function initialize(
        uint256 maxSupply_,
        string memory uri_
    ) public initializer {
        __ERC721_init("MaXXHash", "MHR");
        __Ownable_init(msg.sender);

        maxSupply = maxSupply_;
        baseURI = uri_;
        price = 0.01 ether;
        totalSupply = 0;
    }

    function mint(address _to, uint256 amount) external payable {
        require(totalSupply + amount <= maxSupply, "Max supply reached");
        require(msg.value >= price * amount, "Insufficient funds");
        require(_to != address(0), "Zero address not allowed");
        require(amount > 0, "Amount cannot be zero");

        for (uint256 i = 0; i < amount; ++i) {
            _safeMint(_to, totalSupply + 1);
            totalSupply++;
        }
        emit TokensMinted(_to, amount, totalSupply);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);

        string memory URI = _baseURI();
        if (bytes(URI).length == 0) {
            return "";
        }
        return string(abi.encodePacked(URI, tokenId.toString(), ".json"));
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        require(
            _maxSupply >= totalSupply,
            "New max supply cannot be less than total supply"
        );
        maxSupply = _maxSupply;
    }

    function setBaseURI(string memory _URI) external onlyOwner {
        baseURI = _URI;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success, "Withdrawal failed");
    }
}

