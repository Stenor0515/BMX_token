const converter = require("ethereum-unit-converter");
require("dotenv").config();

const totalSupply = converter(process.env.TOTAL_SUPPLY, "ether", "wei");
module.exports = [
  process.env.TOKEN_NAME,
  process.env.TOKEN_SYMBOL,
  process.env.TOKEN_DECIMAL,
  totalSupply,
  process.env.ACCOUNT_ADDRESS,
  process.env.WASTING_FEE,
];