const path = require('path');
const { Contracts, ProxyAdminProject, ZWeb3 } = require('@openzeppelin/upgrades');

// Use pre-built artifacts from the Dao repository
const artifactsPath = path.join(__dirname, '../../node_modules/@dao/contracts/artifacts');

module.exports = async (
    initialDaoOwner,
    proposalCreators = [],
    voters = []
) => {
    Contracts.setArtifactsDefaults({
        gas: 0xfffffffffff,
    });
    Contracts.setLocalBuildDir(artifactsPath);
    ZWeb3.initialize(web3.currentProvider);
    const Erc20TokenContract = Contracts.getFromLocal('Erc20Token');
    const DaoContract = Contracts.getFromLocal('Dao');

    // Create service token instance
    const token = await Erc20TokenContract.new('Governance Coin', 'GOVC', 18, web3.utils.toWei('100000000', 'ether'), {
        from: initialDaoOwner
    });

    // Mint and transfer initial amount of tokens to voters
    await Promise.all(voters.map(
        v => token.methods['mint(address,uint256)'](
            v, 
            web3.utils.toWei('1000', 'ether')
        ).send({
            from: initialDaoOwner
        })
    ));

    const project = new ProxyAdminProject('TestProject', null, null, {
        from: initialDaoOwner
    });
    
    const dao = await project.createProxy(DaoContract, {
        initArgs: [
            token.address
        ]
    });

    const adminAddress = await project.getAdminAddress();
    const adminOwnerAddress = await project.proxyAdmin.getOwner();
    const proxyAddress = dao.address;
    const proxyImplementation = await project.proxyAdmin.getProxyImplementation(dao.address);

    // Add proposals creator address to white-list
    await Promise.all(proposalCreators.map(p => dao.methods['addWhitelisted(address)'](p).send({
        from: initialDaoOwner
    })));

    // Grant ability to manage white-list to DAO itself only
    await dao.methods['replaceWhitelistAdmin(address)'](dao.address).send(
        {
            from: initialDaoOwner
        }
    );
    
    // Grant ability to manage Pausable state to DAO itself only
    await dao.methods['replacePauser(address)'](dao.address).send(
        {
            from: initialDaoOwner
        }
    );

    return {
        token,
        dao,
        project,
        adminAddress,
        adminOwnerAddress,
        proxyAddress,
        proxyImplementation
    };
};

