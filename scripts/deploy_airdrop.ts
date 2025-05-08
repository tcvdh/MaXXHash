import { ethers } from "hardhat";
import { run } from "hardhat";

async function main() {
    const RewardAirdrop = await ethers.getContractFactory("RewardAirdrop");
    const maxxhashAddress = process.env.MAXXHASH_ADDRESS || "";
    const maxxTokenAddress = process.env.MAXX_TOKEN_ADDRESS || "0xFB7a83abe4F4A4E51c77B92E521390B769ff6467";
    
    if (!maxxhashAddress || !maxxTokenAddress) {
        throw new Error("MAXXHASH_ADDRESS and MAXX_TOKEN_ADDRESS must be set in environment variables");
    }
    
    const rewardAirdrop = await RewardAirdrop.deploy(maxxhashAddress, maxxTokenAddress);
    await rewardAirdrop.waitForDeployment();
    const contractAddress = await rewardAirdrop.getAddress();
    console.log("RewardAirdrop deployed to:", contractAddress, "<--(Copy this if auto verification fails)");

    if (process.env.VERIFY == "true") {
        const deploymentBlockNumber = await ethers.provider.getBlockNumber();
        const targetBlockNumber = deploymentBlockNumber + 3;

        console.log("Waiting for 3 block confirmations before verification...");
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
                address: contractAddress,
                constructorArguments: [maxxhashAddress, maxxTokenAddress],
                force: true,
            });
            console.log("RewardAirdrop contract verified");
        } catch (e) {
            console.log("RewardAirdrop contract verification failed:", e);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
