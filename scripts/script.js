const { BigNumber } = require("ethers");

const bigInt = BigInt(100000 * Math.pow(10, 18));
console.log("bigInt", bigInt);

const int = (100000 * 10 ** 18).toLocaleString();
console.log("int", int);
console.log(BigInt(int))