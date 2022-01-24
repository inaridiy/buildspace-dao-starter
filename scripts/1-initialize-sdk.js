import { ThirdwebSDK } from "@3rdweb/sdk";
import ethers from "ethers";

import dotenv from "dotenv";
dotenv.config();

!process.env.PRIVATE_KEY && console.log("Private key is not found.");
!process.env.ALCHEMY_API_URL && console.log("Alchemy API URL is not found.");
!process.env.WALLET_ADDRESS && console.log("Wallet address is not found.");

const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    process.env.PRIVATE_KEY,
    ethers.providers.getDefaultProvider(process.env.ALCHEMY_API_URL)
  )
);

(async () => {
  try {
    const apps = await sdk.getApps();
    console.log("Your app address is:", apps[0].address);
  } catch (e) {
    console.error("Failed to get apps from the sdk", e);
    process.exit(1);
  }
})();

export default sdk;
//0xf200C7D8B73e29ca3dA936148861b99294ef15C3
