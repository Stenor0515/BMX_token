const hre = require('hardhat')
const contractAddress = require("../contractAddress");
const constructorArguments = require("../arguments");

console.log(contractAddress, constructorArguments)
async function main() {
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: constructorArguments
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })