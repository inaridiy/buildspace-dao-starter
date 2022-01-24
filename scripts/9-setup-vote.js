import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteModule = sdk.getTokenModule(
  "0xb59fe658170fA89736cC8414D1a354ca21054A4A"
);
const tokenModule = sdk.getTokenModule(
  "0xb59fe658170fA89736cC8414D1a354ca21054A4A"
);

(async () => {
  try {
    await tokenModule.grantRole("minter", voteModule.address);
    console.log(
      "✅ Successfully gave vote module permissions to act on token module"
    );
  } catch (e) {
    console.error("failed to grant vote module permissions on token module", e);
    process.exit(1);
  }
  try {
    const ownedTokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);
    await tokenModule.transfer(voteModule.address, percent90);
    console.log("✅ Successfully transferred tokens to vote module");
  } catch (e) {
    console.error("failed to transfer tokens to vote module", e);
  }
})();
