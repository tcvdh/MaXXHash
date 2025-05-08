# MaXXHash

This repository contains the MaXXHash smart contract implementation and deployment scripts.

## Prerequisites

- npm or yarn
- An Ethereum wallet with funds for deployment
- API keys for the target networks (like Etherscan for verification)

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd maxxhash
npm install
# or
yarn install
```

## Configuration

1. Create a `.env` file in the root directory with the following variables:

```
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
API_KEY=your_alchemy_api_key_here
VERIFY=true/false (automatic)
baseURI=ipfs_to_base_uri_here
maxSupply=MAX_SUPPLY_HERE
```

2. Update the `hardhat.config.ts` file if necessary to include any additional networks.

## Deployment

To deploy the MaXXHash contract, run:

```bash
npx hardhat run scripts/deploy_contract.ts --network <network-name>
```

Replace `<network-name>` with the desired network (e.g., `mainnet`, `goerli`, etc.).

The script will output the deployed contract address. Save this address for verification.

## Contract Verification

After deployment, verify the contract on the blockchain explorer:

```bash
npx hardhat verify --network <network-name> <deployed-proxy-address> --force
```

Alternatively, you can use the built-in verification in the deployment script by setting the ENV variable

