# Command line interface for the Dao  
> This command-line interface is dedicated to the automation purposes and can be used in CI/CD scripts

## Initial setup  

```bash
npm i
```

## Usage  

### Install CLI  

```bash
npm i @dao/cli
npm link
```

Because of script natiure it requires truffle configuration (`truffle-config.js`) to be able to use scripts features.  

### Create Governance Token
> If not existed

```bash
dao-cli --network rinkeby cmd=token owner=[TOKEN_OWNER_ADDRESS] holders=[HOLDER_ADDRESS][,HOLDER_ADDRESS][, ...] values=[TOKEN_VALUE][,TOKEN_VALUE][, ...]
```
> `holders` and `values` keys are optional  

Example:  

```bash
dao-cli --network rinkeby cmd=token owner=0x567Eb9E8D8A43C24c7bac4cb4b51ca806cFE8996
Using network 'rinkeby'.

================================================================================ 
Creation of Governance Token  
Token address:  0x756a98Bcb1427C5b730749CAbbcA06B00793b03e
Token owner:  0x567Eb9E8D8A43C24c7bac4cb4b51ca806cFE8996
```

### Create new Dao

```bash
dao-cli --network rinkeby cmd=createdao owner=[INITIAL_DAO_QWNER_ADDRESS] token=[GOVERNANCE_TOKEN_ADDRESS] proposers=[PROPOSER_ADDRESS][,PROPOSER_ADDRESS][, ...]
```  

Example:  

```bash
dao-cli --network rinkeby cmd=createdao owner=0x567Eb9E8D8A43C24c7bac4cb4b51ca806cFE8996 token=0x4111420097F2b048AaC24954b37EB7EB72324adc proposers=0x567Eb9E8D8A43C24c7bac4cb4b51ca806cFE8996
Using network 'rinkeby'.

================================================================================ 
New Dao creation and deployment  
Dao:  0x9890b5B944b00997DfA71963a78394AbD66CBBfd
Governance Token:  0x4111420097F2b048AaC24954b37EB7EB72324adc
Proxy Admin:  0x02fA448Cb53a143c8d51e68B8DFCCF2465DE5f5c
Proxy Admin Owner:  0x9890b5B944b00997DfA71963a78394AbD66CBBfd
Proxy Implementation:  0x1b5a275fa3F2D46a4E751d9aE28619C9eEF6a6CF
```

### Get Dao proxy admin owner address

```bash
dao-cli --network rinkeby cmd=getproxyadminowner address=[DAO_PROXY_ADMIN_ADDRESS]
```  

Example:  

```bash
dao-cli --network rinkeby cmd=getproxyadminowner address=0x02fA448Cb53a143c8d51e68B8DFCCF2465DE5f5c
Using network 'rinkeby'.

================================================================================ 
Proxy Admin Owner:  0x9890b5B944b00997DfA71963a78394AbD66CBBfd
```

### Get Dao contract implementation address  

```bash
dao-cli --network rinkeby cmd=getproxyimplementation address=[DAO_PROXY_ADMIN_ADDRESS] params=[DAO_ADDRESS]
```

Example:  

```bash
dao-cli --network rinkeby cmd=getproxyimplementation address=0x02fA448Cb53a143c8d51e68B8DFCCF2465DE5f5c params=0x9890b5B944b00997DfA71963a78394AbD66CBBfd
Using network 'rinkeby'.

================================================================================ 
Proxy Implementation:  0x1b5a275fa3F2D46a4E751d9aE28619C9eEF6a6CF
```

### Publish a custom proposal

```bash
dao-cli --network rinkeby cmd=proposal address=[DAO_ADDRESS] proposer=[PROPOSER_ADDRESS] params=[PROPOSAL_DETAILS],[PROPOSAL_TYPE],[PROPOSAL_DURATION],[PROPOSAL_DESTINATION],[PROPOSAL_ETH_VALUE] callname=[DESTINATION_METHOD_NAME] calltypes=[CALL_TYPE_1][,CALL_TYPE2][, ...] callvalues=[CALL_VALUE_1][,CALL_VALUE_2][, ...]
```

Example:  

```bash
dao-cli --network rinkeby cmd=proposal address=0x9890b5B944b00997DfA71963a78394AbD66CBBfd proposer=0x567Eb9E8D8A43C24c7bac4cb4b51ca806cFE8996 params="Add new proposer address to white list",0,10,0x9890b5B944b00997DfA71963a78394AbD66CBBfd,0 callname=addWhitelisted calltypes=address callvalues=0xA0B74BFE28223c9e08d6DBFa74B5bf4Da763f959
Using network 'rinkeby'.

================================================================================ 
Creating of the proposal  
Tx Hash:  0xb0a4446b190c9d838a614b19960c0a7dcd493efeed2da535dea4ac7591f7d2db
Proposal created with Id:  1
================================================================================ 
Proposal parameters  
Details:  Add new proposer address to white list
Proposal type:  0
Duration:  10
Destination:  0x9890b5B944b00997DfA71963a78394AbD66CBBfd
Call name:  addWhitelisted
```