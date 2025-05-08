import { ethers, upgrades } from "hardhat";

async function main() {
    const Maxxhash = await ethers.getContractFactory("MaXXHash");
    const maxxhash = await upgrades.deployProxy(Maxxhash, [100, "ipfs://test/"], {
        initializer: "initialize",
    });
    await maxxhash.waitForDeployment();
    const proxyAddress = await maxxhash.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("Proxy deployed to:", proxyAddress);
    console.log("MaXXHash Implementation deployed to:", implementationAddress, "<- Copy this address to verify the contract");
}

main();
