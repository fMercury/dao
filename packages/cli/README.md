# Command line interface for the Dao  
> CLI is created as an external truffle script

## Initial setup  

```bash
npm i
```

## Usage  

### Install CLI  

```bash
npm i @dao/cli
```

Because of script natiure it requires truffle configuration (`truffle-config.js`) to be able to use scripts features.  

### Create new Dao

```bash
npx truffle exec ./dao.js --network rinkeby owner=[INITIAL_DAO_QWNER_ADDRESS] token=[GOVERNANCE_TOKEN_ADDRESS] proposers=[PROPOSER_ADDRESS_1][, PROPOSER_ADDRESS_2][, ...]
```

### Get Dao proxy admin owner address

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_PROXY_ADMIN_ADDRESS] cmd=getproxyadminowner
```

### Get Dao contract implementation address  

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_PROXY_ADMIN_ADDRESS] cmd=getproxyimplementation params=[DAO_ADDRESS]
```

### Publish a proposal for proxy administrator change

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_ADDRESS] cmd=proxyadminchange params=[NEW_PROXY_ADMIN_ADDRESS]
```

### Publish an upgrade proposal

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_ADDRESS] cmd=upgrade params=[NEW_IMPLEMENTATION_ADDRESS]
```

### Publish an upgrade proposal with initializing call

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_ADDRESS] cmd=upgradeandcall params=[NEW_IMPLEMENTATION_ADDRESS] callmethod=initialize calltypes=address,uint256 callparams=[ADDRESS_PARAM_VALUE],[UINT256_PARAM_VALUE]
```

### Publish a proposal for moving a Dao to the `paused` state

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_ADDRESS] cmd=pause
```

### Publish a proposal for adding an address to white-list

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_ADDRESS] cmd=whitelist params=[ADDRESS_TO_WHITE_LIST]
```

### Publish a custom proposal

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_ADDRESS] cmd=proposal params=[PROPOSAL_DESCRIPTION],[PROPOSAL_TYPE],[PROPOSAL_DURATION],[PROPOSAL_DESTINATION],[PROPOSAL_ETH_VALUE],[PROPOSAL_CALLDATA]
```

### Process a proposal

```bash
npx truffle exec ./dao.js --network rinkeby address=[DAO_ADDRESS] cmd=processproposal params=[PROPOSAL_ID]
```
