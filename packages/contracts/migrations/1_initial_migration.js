var Migrations = artifacts.require('./Migrations.sol');

module.exports = async (deployer) => {
    await deployer.deploy(Migrations);
    await Migrations.deployed();
};
