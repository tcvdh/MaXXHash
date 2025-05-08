import { ethers, upgrades } from "hardhat";
import { run } from "hardhat";

async function main() {
    const Maxxhash = await ethers.getContractFactory("MaXXHash");
    const maxSupply = process.env.MAX_SUPPLY || 100;
    const baseURI = process.env.BASE_URI || "https://ipfs.io/ipfs/bafybeiea2744bntdt4zosavp2wddlylogmwpngg3jz4olg77pq5w7uhqna/";
    const maxxhash = await upgrades.deployProxy(Maxxhash, [maxSupply, baseURI], {
        initializer: "initialize",
    });
    await maxxhash.waitForDeployment();
    const proxyAddress = await maxxhash.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("Proxy deployed to:", proxyAddress);
    console.log("MaXXHash Implementation deployed to:", implementationAddress);

    if (process.env.VERIFY == "true") {
        console.log("Waiting for 5 block confirmations before verification...");
        const deploymentBlockNumber = await ethers.provider.getBlockNumber();
        const targetBlockNumber = deploymentBlockNumber + 5;
        
        console.log(`Current block: ${deploymentBlockNumber}, waiting until block: ${targetBlockNumber}`);
        
        while (await ethers.provider.getBlockNumber() < targetBlockNumber) {
            process.stdout.write(".");
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
        }
        console.log("\nVerifying contract...");
        
        try {
            await run("verify:verify", {
                address: implementationAddress, // Verify the implementation contract, not the proxy
                constructorArguments: []
            });
            console.log("Implementation contract verified");
        } catch (e) {
            console.log("Implementation contract verification failed:", e);
        }
    }
}

main();
