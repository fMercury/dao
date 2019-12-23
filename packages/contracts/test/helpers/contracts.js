/**
 * Create service (governance) token instance
 * @param {Object} contract Contract object (obtained from getFromLocal)
 * @param {string} totalSupply Initial amount of tokens
 * @param {string} tokenOwner Token owner address
 * @param {Object[]} [distributionList=[]] Array of objects ({owner:{string}, value:{string}}) to distribute tokens
 * @returns Promise<Object> Token contract instance
 */
const createTokenAndDistribute = async (
    contract, 
    totalSupply, 
    tokenOwner, 
    distributionList = []
) => {
    // Create service token instance
    const token = await contract.new('Governance Coin', 'GOVC', 18, web3.utils.toWei(totalSupply, 'ether'), {
        from: tokenOwner
    });

    // Transfer initial amount of tokens to voters
    await Promise.all(distributionList.map(
        v => token.methods['transfer(address,uint256)'](
            v.owner, 
            web3.utils.toWei(v.value, 'ether')
        ).send({
            from: tokenOwner
        })
    ));

    return token;
};
module.exports.createTokenAndDistribute = createTokenAndDistribute;

/**
 * Create upgradeable DAO contract
 * @param {Object} project Upgradeable project (usually TestHelper or SimpleProject instance)
 * @param {Object} contract Contract object (obtained from getFromLocal)
 * @param {string} tokenAddress Address of the service (governance) ERC20 token
 * @param {string} initialProxyOwner Initial proxy owner address
 * @param {string[]} [proposalCreators=[]] Array of initial proposals creators addresses to add
 * @param {boolean} [makeSelfGoverned=true] Is DAO should be made self-governed
 * @returns Propmise<Object> DAO contract instance
 */
const createDaoContract = async (
    project, 
    contract, 
    tokenAddress, 
    initialProxyOwner, 
    proposalCreators = [], 
    makeSelfGoverned = true,
    initInPausedState = false
) => {
    // DAO instance
    const dao = await project.createProxy(contract, {
        initArgs: [tokenAddress]
    });

    // Add proposals creator address to white-list
    await Promise.all(proposalCreators.map(p => dao.methods['addWhitelisted(address)'](p).send({
        from: initialProxyOwner
    })));

    if (initInPausedState) {

        // Move DAO to Paused state
        await dao.methods['pause()']().send({
            from: initialProxyOwner
        });
    }

    if (makeSelfGoverned) {

        // Grant ability to manage white-list to DAO itself only
        await dao.methods['replaceWhitelistAdmin(address)'](dao.address).send({
            from: initialProxyOwner
        });
        
        // Grant ability to manage Pausable state to DAO itself only
        await dao.methods['replacePauser(address)'](dao.address).send({
            from: initialProxyOwner
        });

        // Grant ability to upgrade DAO contract to DAO itself only
        await project.changeProxyAdmin(dao.address, dao.address);
    }

    return dao;
};
module.exports.createDaoContract = createDaoContract;

/**
 * Create upgradeable and DAO-manageable contract instance
 * @param {Object} project Upgradeable project (usually TestHelper or SimpleProject instance)
 * @param {*} tartgetContract Contract object (obtained from getFromLocal)
 * @param {*} daoContract DAO contract instance
 * @param {*} initialTargetOwner Initial target contract owner address
 * @returns Promise<Object> Target contract instance
 */
const createTargetContract = async (
    project,
    tartgetContract,
    daoContract,
    initialTargetOwner
) => {
    // Target contract for testing governance features of DAO
    const target = await project.createProxy(tartgetContract, {
        initArgs: [5, initialTargetOwner]
    });
    
    // Move contract ownership to the DAO
    await target.methods['transferOwnership(address)'](daoContract.address).send({
        from: initialTargetOwner
    });

    // Grant ability to upgrade target contract to the DAO
    await project.changeProxyAdmin(target.address, daoContract.address);

    return target;
};
module.exports.createTargetContract = createTargetContract;