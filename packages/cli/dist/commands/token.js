"use strict";

const {
  title,
  log
} = require('../utils/stdout');

const path = require('path');

const {
  Contracts,
  ZWeb3
} = require('@openzeppelin/upgrades'); // Use pre-built artifacts from the Dao repository


const artifactsPath = path.join(__dirname, '../../node_modules/@dao/contracts/artifacts');

module.exports = async (tokenOwner, tokensHolders = [], tokenValues = []) => {
  Contracts.setArtifactsDefaults({
    gas: 0xfffffffffff
  });
  Contracts.setLocalBuildDir(artifactsPath);
  ZWeb3.initialize(web3.currentProvider);
  const Erc20TokenContract = Contracts.getFromLocal('Erc20Token');
  title('Creation of Governance Token'); // Create service token instance

  const token = await Erc20TokenContract.new('Governance Coin', 'GOVC', 18, web3.utils.toWei('100000000', 'ether'), {
    from: tokenOwner
  }); // Mint and transfer initial amount of tokens to holders

  await Promise.all(tokensHolders.map((v, i) => token.methods['mint(address,uint256)'](v, tokenValues[i]).send({
    from: tokenOwner
  })));
  log('Token address', token.address);
  log('Token owner', tokenOwner);

  if (tokensHolders.length > 0) {
    tokensHolders.forEach((h, i) => log('Holder', `${h}: ${tokenValues[i]}`));
  }

  return token.address;
};