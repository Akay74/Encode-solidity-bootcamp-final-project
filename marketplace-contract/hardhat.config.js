require("@nomicfoundation/hardhat-toolbox");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.11",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/ls2Mi-phbFoY9ycOLMHUSzlqdOybMmJe",
      accounts: [],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_URL,
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 2000
    }
  }
};