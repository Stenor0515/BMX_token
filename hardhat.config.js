require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
const fs = require('fs');

const contractAddress = require("./contractAddress");
const constructorArguments = require("./arguments");

const PRIVATE_KEY = fs.readFileSync(".secret").toString().trim() || "01234567890123456789";
const BSC_API_KEY = fs.readFileSync(".bsc_api_key").toString().trim() || "01234567890123456789";
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
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
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    mainnet: {
      url: `https://bsc-dataseed1.ninicoin.io`,
      accounts: [PRIVATE_KEY],
      chainId: 56,
      saveDeployments: true,
    },
    testnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: [PRIVATE_KEY],
      chainId: 97,
      saveDeployments: true,
    },
  },
  etherscan: {
    apiKey: BSC_API_KEY,
  },
};
