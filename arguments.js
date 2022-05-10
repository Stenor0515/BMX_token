const converter = require("ethereum-unit-converter");

const totalSupply = converter(1000, "ether", "wei");
module.exports = [
  "BMX Token",
  "BMX",
  18,
  totalSupply,
  "0x351E86AC58cFeDdBa9e637cb238671874ffDE245",
];