require('chai').should();

const { TestHelper } = require('@openzeppelin/cli');
const { Contracts, ZWeb3 } = require('@openzeppelin/upgrades');

Contracts.setLocalBuildDir('./artifacts');

// workaround for https://github.com/zeppelinos/zos/issues/704
Contracts.setArtifactsDefaults({
    gas: 8000000,
});

ZWeb3.initialize(web3.currentProvider);

const ContractForDaoTestsV1 = Contracts.getFromLocal('ContractForDaoTestsV1');
const ContractForDaoTestsV2 = Contracts.getFromLocal('ContractForDaoTestsV2');

contract('Upgradeability case without DAO', (accounts) => {
    const proxyOwner = accounts[1];
    const owner = accounts[2];
    let project;
    let instance;

    beforeEach(async () => {
        project = await TestHelper();
        instance = await project.createProxy(ContractForDaoTestsV1, {
            from: proxyOwner,
            initArgs: [5, owner]
        });        
    });
    
    it('should create initial contract version', async () => {
        (await instance.methods['getValue()']().call()).should.equal('5');
    });

    it('should upgrade contract', async () => {
        instance = await project.upgradeProxy(instance.address, ContractForDaoTestsV2, {
            from: proxyOwner
        });
        await instance.methods['setVal(uint256)'](100).send({
            from: owner
        });
        (await instance.methods['getValue()']().call()).should.equal('100');
    });
});
