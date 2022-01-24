import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x47B36997D21a4c41191dBA0B71050C279c770c49"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Student Enginner DAO Ticket",
        description: "With this, you can join the DAO.",
        image: readFileSync("scripts/assets/dao_token.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (e) {
    console.error(e);
  }
})();
