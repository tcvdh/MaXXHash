import { ethers, upgrades } from "hardhat";
import { run } from "hardhat";

const PROXY_ADDRESS = "0xA3d5E60034DB4C00a4217EC83DC28E200891bc82"; // Replace with your proxy address

async function main() {
    const NEWMaXXHash = await ethers.getContractFactory("MaXXHash");
    const newMaXXHash = await upgrades.upgradeProxy(PROXY_ADDRESS, NEWMaXXHash);

    newMaXXHash.waitForDeployment();
    console.log("Contract upgraded successfully");

    console.log("Waiting for the next block...");
    await new Promise((resolve) => {
        ethers.provider.once("block", () => {
            resolve(null);
        });
    });

    // Get the implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log("New implementation address:", implementationAddress);

    if (process.env.VERIFY == "true") {
        console.log("Waiting for 3 block confirmations before verification...");
        const deploymentBlockNumber = await ethers.provider.getBlockNumber();
        const targetBlockNumber = deploymentBlockNumber + 3;

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
                address: implementationAddress, // Verify the implementation contract, not the proxy
                constructorArguments: [],
                force: true,
            });
            console.log("Implementation contract verified");
        } catch (e) {
            console.log("Implementation contract verification failed:", e);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
