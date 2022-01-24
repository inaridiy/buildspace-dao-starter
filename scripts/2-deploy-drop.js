import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule("0xf200C7D8B73e29ca3dA936148861b99294ef15C3");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "Student Enginner DAO",
      description: "A loose student community",
      image: readFileSync("scripts/assets/Logo_-_jstudent.png"),
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });
    console.log(
      "✅ Successfully deployed bundleDrop module, address:",
      bundleDropModule.address
    );
    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata()
    );
  } catch (error) {
    console.log("failed to deploy bundleDrop module", error);
  }
})();
