# DAO Smart contracts repository  

[![Build Status](https://travis-ci.org/windingtree/dao.svg?branch=master)](https://travis-ci.org/windingtree/dao) [![Coverage Status](https://coveralls.io/repos/github/windingtree/dao/badge.svg?branch=master)](https://coveralls.io/github/windingtree/dao?branch=master)

> Development envirnoment is optimized for using with VS Code IDE   
> Related workspace configuration is placed in the file: [./contracts.code-workspace](./contracts.code-workspace).  
> Please use this configuration by `Open Workspace` menu 
  
## How does it work  

In most cases, issues of the decentralised governance are solved by using multi-sig wallets (like [Gnosis/MultiSigWallet](https://github.com/gnosis/MultiSigWallet)). 
This way of the governance requiring from the wallet participants continuously sign a transaction until the required amount of signatures will be obtained and then a transaction can be executed.

But when it needed to provide smart contract governance tools for the wide community we will require more flexible and scalable tools than multi-sig.

Dao is a tool for the governance of smart contracts on the votings base with using of a special ERC20 token (governance token). Mechanics and monetary politics of this token are out of current project frame and defined by them who creates a Dao.

Votings in the Dao are based on a quadratic voting principle that ensures a higher level of democracy in governance. 

The procedure of the Dao creating consist of the following steps:  
- **Deployment to the network of the upgradeable Dao smart contract** simultaneously with a registration of the governance token. Governance token itself should exist at the moment of Dao creation  
- **Addition of one or several accounts (addresses) to the white-list**. For these addresses will be possible to add "Proposals" to the Dao. These addresses are named "proposers". Origin of these addresses are not regulated and should be defined by the community before Dao creation date. Mostly, these are can be leaders of the development teams or (and) community leader. For example, persons who initiate most relevant requests related to ecosystem development and new features.  
- **Moving of the ownership rights for the Dao smart contract upgrade and access to its service functions** (for example, whitelisting and pausable behaviour) to the Dao contract itself (Dao should be self-governed)  
- **Moving of the ownership rights for the smart contracts upgrade and access to their service functions** that should be governed by a Dao to the Dao

Beginning from this moment all following changes in the Dao itself and in all "governed" contracts will only be possible by using of workflow that integrated into the Dao contract. *[continue reading...](./docs/how.md#workflow)*



## Initial setup  

```bash
npm i
```

## Build contracts artifacts

```bash
npm run build
```
Artifacts for using in the external projects will be placed in `./artifacts` folder.

## Tests

```bash
npm run test
npm run test ./<path_to_test_file>.js
``` 

## Tests with gas estimation

```bash
npm run test:gas
npm run test:gas ./<path_to_test_file>.js
```

## Tests coverage  

```bash
npm run coverage
``` 

## Linting

```bash
npm run lint
```

## Docs

- [Use-cases diagrams](./docs/usecase/README.md)
- [Activity diagrams](./docs/activity/README.md)
- [Dao.sol: generated docs](./docs/Dao.md)

## Development notes

- [Plans and ToDo-s](./docs/notes/todo.md)
- [Questions to discuss](./docs/notes/questions.md)

## Issues

Feel free to send your issues reports and feature requests to the [issues tracker](https://github.com/windingtree/dao/issues)

