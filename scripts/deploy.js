const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();
const converter = require("ethereum-unit-converter");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.

  // We get the contract to deploy
  const BMXToken = await hre.ethers.getContractFactory("BMX");
  const totalSupply = converter(0, "ether", "wei");
  const BMX = await BMXToken.deploy("BMX Token", "BMX", 18, totalSupply, "0x351E86AC58cFeDdBa9e637cb238671874ffDE245");

  await BMX.deployed();

  console.log("BMX contract deployed to:", BMX.address);

  let contractAddress = `
  const tokenAddress = "${BMX.address}"
  `

  let data = JSON.stringify(contractAddress)
  fs.writeFileSync('contractAddress.js', JSON.parse(data))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
