import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0xb59fe658170fA89736cC8414D1a354ca21054A4A"
);

(async () => {
  try {
    const amount = 10 ** 8;
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();
    console.log(
      "✅ There now is",
      ethers.utils.formatUnits(totalSupply, 18),
      "$SEDT in circulation"
    );
  } catch (e) {
    console.error("Failed to print money", e);
  }
})();
