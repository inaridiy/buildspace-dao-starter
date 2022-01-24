import sdk from "./1-initialize-sdk.js";

// Grab the app module address.
const appModule = sdk.getAppModule(
  "0xf200C7D8B73e29ca3dA936148861b99294ef15C3"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "Student Enginner DAO's Cool Proposals",
      votingTokenAddress: "0xb59fe658170fA89736cC8414D1a354ca21054A4A",
      proposalStartWaitTimeInSeconds: 0,
      proposalVotingTimeInSeconds: 24 * 60 * 60 * 2, // 2 days
      votingQuorumFraction: 0,
      minimumNumberOfTokensNeededToPropose: "0",
    });
    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address
    );
  } catch (e) {
    console.error("Failed to deploy vote module", e);
  }
})();
