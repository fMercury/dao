# How does it work  

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

Beginning from this moment all following changes in the Dao itself and in all "governed" contracts will only be possible by using of workflow that integrated into the Dao contract.

## [Dao workflow consists of following steps and principles](#workflow)

- **Addition of the proposal**. This function is accessible by whitelisted addresses only. For the addition of new addresses, it is required to use "Proposal" aswell.
- **"Proposal" contains the following parameters**:  
  - `details`: Proposal description. Can be a string, URL, IPFS hash, etc.  
  - `proposalType`: A type of proposal (contract upgrade or method call for now). Following types are conditional and dedicated to proposal filtering features  
  - `duration`: Duration of the voting in days  
  - `destination`: Destination contract address that should be a target of the transaction in the case of voting success  
  - `value`: Amount of Ether. It is necessary in the case where a transaction required to be sent with ether  
  - `data`: transaction data (n.a. `callData`)  
- **Voting for proposals**. This function is available for the governance token holders (token  had been registered at the moment of Dao creation)  
- Votes amount is limited by the voter’s token balance only  
- A vote cast by the voter is based on the **Yes/No principal** and **amount of tokens is the vote weight**  
- **Amount of votes** that are will be **accepted** as a result is **calculated from the quadratic root function**  
- For the time of voting, all tokens that have been sent will be locked in the Dao contract. It will be possible to get them back after the voting will finish  
- **Voting results** can be determined after voting term is finish. In depending on results a transaction attached to the proposal will be executed (or not).

## [An example of Dao usage](#example)  

In order to add a new address to the whitelist a **new proposal** is creating with following parameters:  
  - "Addition of a hypothetical Vitalik to the Dao white-list"  
  - "1" - corresponds to type MethodCall  
  - "30" - 30 day to vote  
  - "0xadd53f9a7e588d003326d1cbf9e4a43c061aadd9bc938c843a79e7b4fd2ad743" - Dao contract address  
  - "0" -  means for free  
  - "0x61646457686974656c6973746564286164647265737329307834663365646639383361633633366136356138343263653763373864396161373036643362313133626365396334366633306437643231373135623233623164" - encoded method call `addWhitelisted(address)` with parameter `0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d` (this is an address of a hypothetical Vitalik). `callData` encoding will be handled automatically by the CLI or by the UI in the Dapp (will be developed soon)    

**Voting flow**:  
  - **Voter #1** has sent `50` tokens as `Yes` vote  
  - **Voter #2** has sent `10` tokens as `No` vote  
  - **Voter #3** has sent `70` tokens as `Yes` vote  
  - **Voter #4** has sent `100` tokens as `No` vote  
  - **Voter #5** has sent `20` tokens as `Yes` vote  
  - **Voter #6** has sent `30` tokens as `Yes` vote  
  - **Voter #7** has sent `10` tokens as `No` vote

**Voting balance**:  
  - `Yes`: *sum(sqrt(50)+sqrt(70)+sqrt(20)+sqrt(30))=**25***  
  - `No`: *sum(sqrt(10)+sqrt(100)+sqrt(10))=**16***  

**Voting result**: 
- **Success!** A transaction that will add a hypothetical Vitalik’s address to the white-list will be executed.  

  
  
*More detailed Dao documentation will be added in future.*


