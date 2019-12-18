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
    const owner = accounts[1];
    const proxyOwner = accounts[2];
    let project;
    let proxy;

    beforeEach(async () => {
        project = await TestHelper({
            from: proxyOwner
        });
        proxy = await project.createProxy(ContractForDaoTestsV1);        
    });
    
    it('should create initial contract version', async () => {
        (await proxy.methods.value().call()).should.equal('5');
    });

    it('should upgrade contract', async () => {
        const v2 = await ContractForDaoTestsV2.new({
            from: owner
        });
        const newInstance = await project.proxyAdmin.upgradeProxy(proxy.address, v2.address, ContractForDaoTestsV2);
        (await newInstance.methods.newFunction().call()).should.equal('100');
    });
});
