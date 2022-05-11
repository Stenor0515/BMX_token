const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BMX token", function () {
  it("Should return the decimals, symbol, name, totalSupply and admin balance", async function () {
    const BMXToken = await ethers.getContractFactory("BMX");
    const BMX = await BMXToken.deploy("Bmxtoken", "BMX", 18, 100000, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 2);
    await BMX.deployed();

    // Get signers
    const owner = await ethers.getSigner();

    expect(await BMX.decimals()).to.equal(18);
    expect(await BMX.symbol()).to.equal("BMX");
    expect(await BMX.name()).to.equal("Bmxtoken");
    expect(await BMX.totalSupply()).to.equal(100000);
    expect(await BMX.adminAccount()).to.equal("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

    // Get owner address and its balance
    const ownerAddress = await owner.getAddress();
    expect(await BMX.balanceOf(ownerAddress)).to.equal(100000);
  });

  it("Should return the result of restrict transfer", async function () {
    const BMXToken = await ethers.getContractFactory("BMX");
    const BMX = await BMXToken.deploy("Bmxtoken", "BMX", 18, 100000, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 2);
    await BMX.deployed();

    // Get signers
    [owner, acc1, acc2, ...accs] = await ethers.getSigners();
    // Get addresses
    const ownerAddress = await owner.getAddress();
    const acc1Address = await acc1.getAddress();
    const acc2Address = await acc2.getAddress();
    // Get balances
    expect(await BMX.balanceOf(ownerAddress)).to.equal(100000);
    expect(await BMX.balanceOf(acc1Address)).to.equal(0);

    // Pre-sale process
    const preSaleTx = await BMX.mint(acc1Address, 1000);
    await preSaleTx.wait();
    expect(await BMX.balanceOf(acc1Address)).to.equal(1000);
    expect(await BMX.totalSupply()).to.equal(101000);

    // Public sale start
    const publicSaleStartTx = await BMX.publicSaleStart();
    await publicSaleStartTx.wait();

    // Public-sale process
    const publicSaleTx = await BMX.mint(acc1Address, 500);
    await publicSaleTx.wait();
    expect(await BMX.balanceOf(acc1Address)).to.equal(1500);
    expect(await BMX.totalSupply()).to.equal(101500);

    // Restrict admin transfer process
    const adminTransferTx = await BMX.adminTransfer(acc1Address, acc2Address, 548);
    await adminTransferTx.wait();
    expect(await BMX.balanceOf(acc1Address)).to.equal(950);
    expect(await BMX.balanceOf(acc2Address)).to.equal(548);
    expect(await BMX.totalSupply()).to.equal(101498);
  });

  it("Should return the result of general transfer", async function () {
    const BMXToken = await ethers.getContractFactory("BMX");
    const BMX = await BMXToken.deploy("Bmxtoken", "BMX", 18, 100000, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 2);
    await BMX.deployed();

    // Get signers
    [owner, acc1, acc2, ...accs] = await ethers.getSigners();
    // Get addresses
    const ownerAddress = await owner.getAddress();
    const acc1Address = await acc1.getAddress();
    const acc2Address = await acc2.getAddress();
    // Get balances
    expect(await BMX.balanceOf(ownerAddress)).to.equal(100000);
    expect(await BMX.balanceOf(acc1Address)).to.equal(0);

    // Pre-sale process
    const preSaleTx = await BMX.mint(acc1Address, 1000);
    await preSaleTx.wait();
    expect(await BMX.balanceOf(acc1Address)).to.equal(1000);
    expect(await BMX.totalSupply()).to.equal(101000);

    // Public-sale process
    const publicSaleTx = await BMX.mint(acc1Address, 1000);
    await publicSaleTx.wait();
    expect(await BMX.balanceOf(acc1Address)).to.equal(2000);
    expect(await BMX.totalSupply()).to.equal(102000);

    // Restrict admin transfer process
    const adminTransferTx = await BMX.adminTransfer(acc1Address, acc2Address, 1500);
    await adminTransferTx.wait();
    expect(await BMX.balanceOf(acc1Address)).to.equal(498);
    expect(await BMX.balanceOf(acc2Address)).to.equal(1500);
    expect(await BMX.totalSupply()).to.equal(101998);
  });

  it("Staking test step.", async function () {
    const BMXToken = await ethers.getContractFactory("BMX");
    const BMX = await BMXToken.deploy("Bmxtoken", "BMX", 18, 100000, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 2);
    await BMX.deployed();

    // Get signers
    [owner, acc1, acc2, ...accs] = await ethers.getSigners();
    // Get addresses
    const ownerAddress = await owner.getAddress();
    const acc1Address = await acc1.getAddress();
    const acc2Address = await acc2.getAddress();

    // Public sale start
    const publicSaleStartTx = await BMX.publicSaleStart();
    await publicSaleStartTx.wait();

    // Restrict admin transfer process
    const adminTransferTx = await BMX.adminTransfer(ownerAddress, acc1Address, 1500);
    await adminTransferTx.wait();
    expect(await BMX.balanceOf(ownerAddress)).to.equal(98498);
    expect(await BMX.balanceOf(acc1Address)).to.equal(1500);
    expect(await BMX.totalSupply()).to.equal(99998);

    // Staking process
    const stakeTx = await BMX.stake(500, acc1Address);
    await stakeTx.wait();
    // expect(await BMX.hasStake(acc1Address).total_amount).to.equal(500);
    console.log(await BMX.hasStake(acc1Address));

    // Stake withdrawing process
    const withdrawTx = await BMX.withdrawStake(acc1Address, 500);
    await withdrawTx.wait();
    console.log("first", await BMX.hasStake(acc1Address));
    expect(await BMX.balanceOf(acc1Address)).to.equal(1496);
  });
});
