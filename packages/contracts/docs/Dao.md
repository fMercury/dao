* [Dao](#dao)
  * [Paused](#event-paused)
  * [PauserAdded](#event-pauseradded)
  * [PauserRemoved](#event-pauserremoved)
  * [ProposalAdded](#event-proposaladded)
  * [ProposalCancelled](#event-proposalcancelled)
  * [ProposalProcessed](#event-proposalprocessed)
  * [TokensLocked](#event-tokenslocked)
  * [TokensReleased](#event-tokensreleased)
  * [TransactionFailed](#event-transactionfailed)
  * [TransactionSuccessed](#event-transactionsuccessed)
  * [Unpaused](#event-unpaused)
  * [VoteAdded](#event-voteadded)
  * [VoteRevoked](#event-voterevoked)
  * [WhitelistAdminAdded](#event-whitelistadminadded)
  * [WhitelistAdminRemoved](#event-whitelistadminremoved)
  * [WhitelistedAdded](#event-whitelistedadded)
  * [WhitelistedRemoved](#event-whitelistedremoved)
  * [addPauser](#function-addpauser)
  * [addProposal](#function-addproposal)
  * [addWhitelistAdmin](#function-addwhitelistadmin)
  * [addWhitelisted](#function-addwhitelisted)
  * [cancelProposal](#function-cancelproposal)
  * [getActiveProposalsIds](#function-getactiveproposalsids)
  * [getActiveProposalsIds](#function-getactiveproposalsids)
  * [getProposal](#function-getproposal)
  * [getVote](#function-getvote)
  * [initialize](#function-initialize)
  * [isPauser](#function-ispauser)
  * [isVotingPassed](#function-isvotingpassed)
  * [isWhitelistAdmin](#function-iswhitelistadmin)
  * [isWhitelisted](#function-iswhitelisted)
  * [pause](#function-pause)
  * [paused](#function-paused)
  * [processProposal](#function-processproposal)
  * [proposalCount](#function-proposalcount)
  * [removeWhitelisted](#function-removewhitelisted)
  * [renouncePauser](#function-renouncepauser)
  * [renounceWhitelistAdmin](#function-renouncewhitelistadmin)
  * [renounceWhitelisted](#function-renouncewhitelisted)
  * [replacePauser](#function-replacepauser)
  * [replaceWhitelistAdmin](#function-replacewhitelistadmin)
  * [revokeVote](#function-revokevote)
  * [serviceToken](#function-servicetoken)
  * [tokensBalance](#function-tokensbalance)
  * [unpause](#function-unpause)
  * [vote](#function-vote)
  * [votingResult](#function-votingresult)
  * [withdrawTokens](#function-withdrawtokens)

# Dao

Kostiantyn Smyrnov <kostysh@gmail.com>
## *event* Paused

Dao.Paused(account) `62e78cea`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | not indexed |

## *event* PauserAdded

Dao.PauserAdded(account) `6719d08c`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | indexed |

## *event* PauserRemoved

Dao.PauserRemoved(account) `cd265eba`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | indexed |

## *event* ProposalAdded

Dao.ProposalAdded(proposer, proposalId) `294a8b64`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | proposer | not indexed |
| *uint256* | proposalId | not indexed |

## *event* ProposalCancelled

Dao.ProposalCancelled(proposalId) `416e669c`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | not indexed |

## *event* ProposalProcessed

Dao.ProposalProcessed(proposalId, passed) `cc8b74c1`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | not indexed |
| *bool* | passed | not indexed |

## *event* TokensLocked

Dao.TokensLocked(voter, value) `ac87f20a`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | voter | not indexed |
| *uint256* | value | not indexed |

## *event* TokensReleased

Dao.TokensReleased(voter, value) `c7798891`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | voter | not indexed |
| *uint256* | value | not indexed |

## *event* TransactionFailed

Dao.TransactionFailed(proposalId) `e23a6a95`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | not indexed |

## *event* TransactionSuccessed

Dao.TransactionSuccessed(proposalId) `f25d1eb8`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | not indexed |

## *event* Unpaused

Dao.Unpaused(account) `5db9ee0a`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | not indexed |

## *event* VoteAdded

Dao.VoteAdded(proposalId, voteType, voter, votes, votesAccepted) `615fd00d`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | not indexed |
| *uint8* | voteType | not indexed |
| *address* | voter | not indexed |
| *uint256* | votes | not indexed |
| *uint256* | votesAccepted | not indexed |

## *event* VoteRevoked

Dao.VoteRevoked(proposalId, voteType, voter, votes) `940ff812`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | not indexed |
| *uint8* | voteType | not indexed |
| *address* | voter | not indexed |
| *uint256* | votes | not indexed |

## *event* WhitelistAdminAdded

Dao.WhitelistAdminAdded(account) `22380c05`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | indexed |

## *event* WhitelistAdminRemoved

Dao.WhitelistAdminRemoved(account) `0a8eb35e`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | indexed |

## *event* WhitelistedAdded

Dao.WhitelistedAdded(account) `ee1504a8`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | indexed |

## *event* WhitelistedRemoved

Dao.WhitelistedRemoved(account) `270d9b30`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | indexed |


## *function* addPauser

Dao.addPauser(account) `nonpayable` `82dc1ec4`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | undefined |


## *function* addProposal

Dao.addProposal(details, proposalType, duration, destination, value, data) `payable` `7c2466ff`

> Add new proposal     * Requirements: - sender address should be whitelisted - contract should not be in paused state - proposal type should allowed proposalType - destination address should not be a valid target address - sent ether value should be consistent with value parameter 

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *string* | details | Proposal details |
| *uint8* | proposalType | Proposal type |
| *uint256* | duration | Proposal voting duration in days |
| *address* | destination | Transaction target address |
| *uint256* | value | Transaction value in ethers |
| *bytes* | data | Signed transaction data |


## *function* addWhitelistAdmin

Dao.addWhitelistAdmin(account) `nonpayable` `7362d9c8`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | undefined |


## *function* addWhitelisted

Dao.addWhitelisted(account) `nonpayable` `10154bad`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | undefined |


## *function* cancelProposal

Dao.cancelProposal(proposalId) `nonpayable` `e0a8f6f5`

> Cancelling of the proposal     * Requirements: - proposal should exists - sender address should be a proposer address - proposal should not be in a passed state - proposal should not be in a processed state - proposal should not be cancelled - proposal has no votes

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |


## *function* getActiveProposalsIds

Dao.getActiveProposalsIds(proposalType) `view` `61301afa`

> Get all active proposals Ids filtered by proposal type     * Requirements: - proposal type should be valid  

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint8* | proposalType | undefined |

Outputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256[]* |  | undefined |

## *function* getActiveProposalsIds

Dao.getActiveProposalsIds() `view` `7e9b8f80`

> Get all active proposals Ids



Outputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256[]* |  | undefined |

## *function* getProposal

Dao.getProposal(proposalId) `view` `c7f758a8`

> Get proposal by Id (index)     * Requirements: - proposal should exists  

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |

Outputs

| **type** | **name** | **description** |
|-|-|-|
| *string* | details | undefined |
| *uint8* | proposalType | undefined |
| *uint256* | duration | undefined |
| *uint256* | end | undefined |
| *bool[3]* | flags | undefined |
| *address* | txDestination | undefined |
| *uint256* | txValue | undefined |
| *bytes* | txData | undefined |
| *bool* | txExecuted | undefined |
| *bool* | txSuccess | undefined |

## *function* getVote

Dao.getVote(proposalId) `view` `5a55c1f0`

> Get own vote from proposal voting      * Requirements: - proposal should exists - vote should be exist 

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |

Outputs

| **type** | **name** | **description** |
|-|-|-|
| *uint8* | voteType | undefined |
| *uint256* | valueOriginal | undefined |
| *uint256* | valueAccepted | undefined |
| *bool* | revoked | undefined |

## *function* initialize

Dao.initialize(token) `nonpayable` `c4d66de8`

> Contract initializer

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | token | Address of the service token |


## *function* isPauser

Dao.isPauser(account) `view` `46fbf68e`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | undefined |


## *function* isVotingPassed

Dao.isVotingPassed(proposalId) `view` `6a96bab4`

> Check is voting is passed      * Requirements: - proposal should exists

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |

Outputs

| **type** | **name** | **description** |
|-|-|-|
| *bool* |  | undefined |

## *function* isWhitelistAdmin

Dao.isWhitelistAdmin(account) `view` `bb5f747b`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | undefined |


## *function* isWhitelisted

Dao.isWhitelisted(account) `view` `3af32abf`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | undefined |


## *function* pause

Dao.pause() `nonpayable` `8456cb59`

> Called by a pauser to pause, triggers stopped state.




## *function* paused

Dao.paused() `view` `5c975abb`

> Returns true if the contract is paused, and false otherwise.




## *function* processProposal

Dao.processProposal(proposalId) `nonpayable` `e63bc62d`

> Process proposal     * Requirements: - proposal should exists - contract not paused - sender address should be a proposer address - proposal should not be processed - proposal should not be cancelled - proposal is finished

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |


## *function* proposalCount

Dao.proposalCount() `view` `da35c664`





## *function* removeWhitelisted

Dao.removeWhitelisted(account) `nonpayable` `291d9549`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | undefined |


## *function* renouncePauser

Dao.renouncePauser() `nonpayable` `6ef8d66d`





## *function* renounceWhitelistAdmin

Dao.renounceWhitelistAdmin() `nonpayable` `4c5a628c`





## *function* renounceWhitelisted

Dao.renounceWhitelisted() `nonpayable` `d6cd9473`





## *function* replacePauser

Dao.replacePauser(account) `nonpayable` `86583746`

> Replace pauser to the new one      * Requirements: - sender address should be a pauser address 

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | New DAO pauser address |


## *function* replaceWhitelistAdmin

Dao.replaceWhitelistAdmin(account) `nonpayable` `19819ff5`

> Replace whitelist admin with new one      * Requirements: - sender address should be a whitelisted admin address 

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | account | New DAO whitelist admin address |


## *function* revokeVote

Dao.revokeVote(proposalId) `nonpayable` `f73a8b4a`

> Revoke of the placed vote     * Requirements: - proposal should exists - proposal should not be in a passed state - proposal should not be cancelled - vote should not been already revoked

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |


## *function* serviceToken

Dao.serviceToken() `view` `b7692968`





## *function* tokensBalance

Dao.tokensBalance(proposalId) `view` `827e8b47`

> Balance of locked tokens

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |

Outputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* |  | undefined |

## *function* unpause

Dao.unpause() `nonpayable` `3f4ba83a`

> Called by a pauser to unpause, returns to normal state.




## *function* vote

Dao.vote(proposalId, voteType, votes) `nonpayable` `e520251a`

> Vote for the proposal     * Requirements: - proposal should exists - contract not paused - proposal should not be in a passed state - proposal should not be cancelled - sender tokens balance should be sufficient - tokens allowance for the DAO address should be sufficient - voting not expired (does not exceed voting time frame)

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |
| *uint8* | voteType | Type of the vote (Yes/No) |
| *uint256* | votes | Amount of service token to use in the vote |


## *function* votingResult

Dao.votingResult(proposalId) `view` `61d14051`

> Get a result of the proposal voting     * Requirements: - proposal should exists

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |

Outputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | yes | undefined |
| *uint256* | no | undefined |

## *function* withdrawTokens

Dao.withdrawTokens(proposalId) `nonpayable` `315a095d`

> Withdraw released tokens     * Requirements: - proposal should exists - proposal should be finished - sender has positive locked tokens balance

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | proposalId | Proposal Id |


---