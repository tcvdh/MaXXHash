import { ethers, upgrades } from "hardhat";
import { run } from "hardhat";

async function main() {
    const Maxxhash = await ethers.getContractFactory("MaXXHash");
    const maxSupply = process.env.MAX_SUPPLY || 100;
    const baseURI = process.env.BASE_URI || "ipfs://bafybeiea2744bntdt4zosavp2wddlylogmwpngg3jz4olg77pq5w7uhqna/";
    const maxxhash = await upgrades.deployProxy(Maxxhash, [maxSupply, baseURI], {
        initializer: "initialize",
        redeployImplementation: "always",
    });
    await maxxhash.waitForDeployment();
    const proxyAddress = await maxxhash.getAddress();
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("Proxy deployed to:", proxyAddress, "<--(Copy this if auto verification fails)");
    console.log("MaXXHash Implementation deployed to:", implementationAddress);

    if (process.env.VERIFY == "true") {
        const deploymentBlockNumber = await ethers.provider.getBlockNumber();
        const targetBlockNumber = deploymentBlockNumber + 5;

        console.log("Waiting for 5 block confirmations before verification...");
        await new Promise((resolve) => {
            ethers.provider.on("block", async (blockNumber) => {
                if (blockNumber >= targetBlockNumber) {
                    ethers.provider.removeAllListeners("block");
                    resolve(null);
                }
                process.stdout.write(".");
            });
        });
        console.log("\nVerifying contract...");

        try {
            await run("verify:verify", {
                address: proxyAddress,
                constructorArguments: [],
                force: true,
            });
            console.log("Implementation contract verified");
        } catch (e) {
            console.log("Implementation contract verification failed:", e);
        }
    }
}

main();
