import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const bundleDropModule = sdk.getBundleDropModule(
  "0x47B36997D21a4c41191dBA0B71050C279c770c49"
);
const tokenModule = sdk.getTokenModule(
  "0xb59fe658170fA89736cC8414D1a354ca21054A4A"
);

(async () => {
  try {
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");
    if (walletAddresses.length === 0) {
      console.log(
        "No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!"
      );
      process.exit(0);
    }

    const airdropTargets = walletAddresses.map((address) => {
      const randomAmount = Math.floor(
        Math.random() * (100000 - 10000 + 1) + 100000
      );
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);
      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      };
      return airdropTarget;
    });
    console.log("🌈 Starting airdrop...");
    await tokenModule.transferBatch(airdropTargets);
  } catch (e) {
    console.error("Failed to airdrop tokens", e);
  }
})();
