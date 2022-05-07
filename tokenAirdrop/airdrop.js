// Airdrop part
const fs = require("fs");
const { parse } = require('csv-parse');
const converter = require("ethereum-unit-converter");
const ethers = require('ethers');
const PRIVATE_KEY = fs.readFileSync(".secret").toString().trim() || "01234567890123456789";

// Contract ABI
const contractAbi = require('../artifacts/contracts/BMX.sol/BMX.json');
const { tokenAddress } = require("../contractAddress");
console.log(tokenAddress.tokenAddress)
const JsonBatchRpcProvider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545");
const signer = new ethers.Wallet(PRIVATE_KEY, JsonBatchRpcProvider);

const BMX = new ethers.Contract(tokenAddress.tokenAddress, contractAbi.abi, signer);

const readStream = (path) => new Promise((resolve, reject) => {
  const parser = parse({ columns: true }, function (err, records) {
    if (err) {
      return reject
    }
    return resolve(records)
  });
  fs.createReadStream(__dirname + path).pipe(parser);
})

  ; (async () => {
    let record = await readStream('/../tokenAirdrop/test_holders.csv')

    console.log("record", record)

    for (let element of record) {
      console.log(parseInt(element.Balance), "e");
      let amount = converter(parseInt(element.Balance), "ether", "wei");
      const airdropTx = await BMX.mint(element.HolderAddress, amount);
      await airdropTx.wait();
      console.log("airdropTx", airdropTx)
    }
  })()