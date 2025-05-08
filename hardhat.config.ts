import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const API_KEY = process.env.API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // For local development
    localhost: {
      url: "http://localhost:8545",
    },
    // For testing on testnet
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // For mainnet deployment
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
