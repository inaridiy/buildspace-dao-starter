import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0xf200C7D8B73e29ca3dA936148861b99294ef15C3");

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: "Student Enginner DAO Token",
      symbol: "SEDT",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address
    );
  } catch (e) {
    console.error("failed to deploy token module", e);
  }
})();
