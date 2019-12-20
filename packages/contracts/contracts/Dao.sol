pragma solidity 0.5.14;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/access/roles/WhitelistedRole.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "node_modules/openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./libraries/Voting.sol";


/**
 * @title Universal DAO for projects based on Openzeppelin SDK
 * @dev This contract holds main DAO logic and storages
 * @author Kostiantyn Smyrnov <kostysh@gmail.com>
 */
contract Dao is Initializable, Pausable, WhitelistedRole {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /**
     * @dev List of acceptable proposal types
     * Usefull for filtering purposes
     */
    enum ProposalType {
        ContractUpgrade,
        MethodCall
    }

    /**
     * @dev Proposal transaction
     * @param destination Transaction target address
     * @param value Ethers value to send with transaction
     * @param data Signed transaction data
     * @param executed Transaction execution flag
     * @param failed Transaction execution result
     */
    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        bool success;
    }

    /**
     * @dev Proposal structure
     * @param proposer Proposer address
     * @param details Proposal description. Can be text|IPFS Hash|Url|Etc
     * @param proposalType Proposal type
     * @param transaction Transaction storage
     * @param duration Proposal duration in days
     * @param end Proposal voting end date
     * @param flags Proposal state flags [passed, processed, cancelled]
     */
    struct Proposal {
        address proposer;
        string details;
        ProposalType proposalType;
        Transaction transaction;
        uint256 duration;
        uint256 end;
        bool[3] flags;
    }

    /**
     * @dev Voting structure
     * @param votes List of voters with their original votes
     * @param balance Voting balance (sum of converted votes of all voters)
     */
    struct Voting {
        mapping (address => uint256) votes;// voterAddress => votes
        uint256 balance;
    }

    /**
     * @dev This event will be emitted when
     * @param proposer Proposer address
     * @param proposalId Proposal Id
     */
    event ProposalAdded(
        address proposer,
        uint256 proposalId
    );

    /**
     * @dev This event will be emitted when
     * @param proposalId Proposal Id
     */
    event ProposalCancelled(uint256 proposalId);

    /**
     * @dev This event will be emitted when
     * @param proposalId Proposal Id
     * @param voter Voter address
     * @param votes Original votes sent
     * @param votesAccepted Accepted votes amount
     */
    event VoteAdded(
        uint256 proposalId,
        address voter,
        uint256 votes,
        uint256 votesAccepted
    );

    /**
     * @dev This event will be emitted when
     * @param voter Voter address
     * @param votes Original votes revoked
     */
    event VoteRevoked(
        address voter,
        uint256 votes
    );

    /**
     * @dev This event will be emitted when
     * @param voter Voter address
     * @param votes Locked tokens amount
     */
    event TokensLocked(
        address voter,
        uint256 value
    );

    /**
     * @dev This event will be emitted when
     * @param voter Voter address
     * @param votes Released tokens amount
     */
    event TokensReleased(
        address voter,
        uint256 value
    );

    /**
     * @dev This event will be emitted when
     * @param proposalId Proposal Id
     */
    event ProposalProcessed(uint256 proposalId);

    /**
     * @dev This event will be emitted when
     * @param proposalId Proposal Id
     * @param proposalId Ether sent with transaction
     */
    event TransactionSent(
        uint256 proposalId,
        uint256 value
    );

    /**
     * @dev This event will be emitted when
     * @param proposalId Proposal Id
     */
    event TransactionSuccessed(uint256 proposalId);

    /**
     * @dev This event will be emitted when
     * @param proposalId Proposal Id
     */
    event TransactionFailed(uint256 proposalId);


    /// @dev Token that using in voting process
    IERC20 public serviceToken;

    /// @dev Number of proposals
    uint256 public proposalCount;
    
    /// @dev Proposals storage
    mapping (uint256 => Proposal) internal proposals;// proposalId => Proposal

    /// @dev Proposals votings 
    mapping (uint256 => Voting) internal votes;// proposalId => Voting

    
    /**
     * @dev This modifier allows function execution for the proposer only
     * @param proposalId Proposal Id
     */
    modifier onlyProposer(uint256 proposalId) {
        require(msg.sender == proposals[proposalId].proposer, "NOT_A_PROPOSER");
        _;
    }

    /**
     * @dev This modifier allows function execution if proposal has not passed flag
     * @param proposalId Proposal Id
     */
    modifier notPassed(uint256 proposalId) {
        require(!proposals[proposalId].flags[0], "ALREADY_PASSED");
        _;
    }

    /**
     * @dev This modifier allows function execution if proposal has not processed flag
     * @param proposalId Proposal Id
     */
    modifier notProcessed(uint256 proposalId) {
        require(!proposals[proposalId].flags[1], "ALREADY_PROCESSED");
        _;
    }

    /**
     * @dev This modifier allows function execution if proposal has not cancelled flag
     * @param proposalId Proposal Id
     */
    modifier notCancelled(uint256 proposalId) {
        require(!proposals[proposalId].flags[2], "ALREADY_CANCELLED");
        _;
    }

    /**
     * @dev Contract initializer
     * @param token Address of the service token
     * @param manager Initial DAO manager address
     */
    function initialize(
        address token, 
        address manager
    ) external initializer {
        serviceToken = IERC20(token);
        proposalCount = 0;
        
        // Configure Pausable behavior
        _addPauser(manager);
        _removePauser(msg.sender);// Because of msg.sender here is Proxy owner

        // Configure WhitelistedRole behavior
        _addWhitelistAdmin(manager);
        _removeWhitelistAdmin(msg.sender);// Because of msg.sender here is Proxy owner
    }

    /**
     * @dev Replace whitelist admin with new one
     * 
     * Requirements:
     *  - sender address should be a whitelisted admin address
     * 
     * @param account Initial DAO manager address
     */
    function replaceWhitelistAdmin(address account) public onlyWhitelistAdmin {
        _addWhitelistAdmin(account);
        _removeWhitelistAdmin(msg.sender);
    }
    
    /**
     * @dev Add new proposal
     *
     * Requirements:
     *  - sender address should be whitelisted
     *  - contract should not be in paused state
     *  - proposal type should allowed proposalType
     *  - destination address should not be a valid target address
     *  - sender balance should be sufficient 
     *  - transaction data should valid
     * 
     * @param details Proposal details
     * @param proposalType Proposal type
     * @param duration Proposal voting duration in days
     * @param destination Transaction target address
     * @param value Transaction value in ethers
     * @param data Signed transaction data
     */
    function addProposal(
        string details,
        ProposalType proposalType,
        uint256 duration,
        address destination,
        uint256 value,
        bytes calldata data
    ) external payable onlyWhitelisted whenNotPaused {}

    /**
     * @dev Cancelling of the proposal
     *
     * Requirements:
     *  - sender address should be a proposer address
     *  - proposal should not be in a passed state
     *  - proposal should not be cancelled
     *
     * @param proposalId Proposal Id
     */
    function cancelProposal(uint256 proposalId) 
        external 
        onlyProposer(proposalId)
        notPassed(proposalId) 
        notCancelled(proposalId)
    {}

    /**
     * @dev Vote for the proposal
     *
     * Requirements:
     *  - proposal should not be in a passed state
     *  - proposal should not be cancelled
     *  - sender tokens balance should be sufficient
     *  - tokens allowance for the DAO address should be sufficient
     *
     * @param proposalId Proposal Id
     * @param votes Amount of service token to use in the vote
     */
    function vote(
        uint256 proposalId, 
        uint256 votes
    ) 
        external 
        notPassed(proposalId) 
        notCancelled(proposalId)
    {
        require(serviceToken.balanceOf(msg.sender) > votes, "INSUFFICIENT_TOKENS_BALANCE");
    }

    /**
     * @dev Revoke of the placed vote
     *
     * Requirements:
     *  - proposal should not be in a passed state
     *  - proposal should not be cancelled
     *
     * @param proposalId Proposal Id
     */
    function revokeVote(uint256 proposalId) 
        external 
        notPassed(proposalId) 
        notCancelled(proposalId)
    {}

    /**
     * @dev Process proposal
     *
     * Requirements:
     *  - sender address should be a proposer address
     *  - proposal should not be processed
     *  - proposal should not be cancelled
     *
     * @param proposalId Proposal Id
     */
    function processProposal(uint256 proposalId) 
        external 
        onlyProposer(proposalId) 
        notProcessed(proposalId) 
        notCancelled(proposalId) 
    {}

    /**
     * @dev Get proposal by Id (index)
     *
     * Requirements:
     *  - proposal should exists 
     * 
     * @param proposalId Proposal Id
     * @return string Proposal details
     * @return ProposalType Proposal type
     * @return uint256 Proposal duration in days
     * @return uint256 Proposal end date
     * @return bool[3] Proposal status flags
     * @return address Transaction target address
     * @return uint256 Ether value to send with transaction
     * @return bytes Transaction data
     * @return bool Transaction execution status
     * @return bool Transaction execution result status
     */
    function getProposal(uint256 proposalId) 
        public 
        view 
        returns (
            string details,
            ProposalType proposalType,
            uint256 duration,
            uint256 end,
            bool[3] memory flags,
            address txDestination,
            uint256 txValue,
            bytes txData,
            bool txExecuted,
            bool txSuccess
        ) 
    {}

    /**
     * @dev Get all active proposals Ids
     * @return uint256[] List of proposals Ids
     */
    function getActiveProposalsIds() public view returns (uint256[]) {}

    /**
     * @dev Get all active proposals Ids filtered by proposal type
     * @return uint256[] List of proposals Ids
     */
    function getActiveProposalsIds(ProposalType proposalType) public view returns (uint256[]) {}

    /**
     * @dev Transfer service tokens from the voter to the DAO
     * @param voter Proposal voter
     * @param value Amount of service tokens to transfer
     */
    function lockTokens(
        address voter, 
        uint256 value
    ) internal {}

    /**
     * @dev Release locked tokens for the voter
     * @param proposalId Proposal Id
     * @param voter Proposal voter
     */
    function releaseTokens(
        uint256 proposalId, 
        address voter
    ) internal {}

    /**
     * @dev Send a transaction for the proposal
     * @param proposalId Proposal Id
     */
    function sendTransaction(uint256 proposalId) internal {}

    /**
     * @dev Convert votes using defined formula
     * @param votes Amount of service token to use in the vote
     * @return uint256 Converted votes value
     */
    function convertVotes(uint256 votes) internal pure returns (uint256) {
        return Voting.sqrt(votes);
    }

    /**
     * @dev Get current time
     *  
     * This function can be overriden for testing purposes
     * 
     * @return uint256 Current block time
     */
    function time() internal view returns (uint256) {
        return now;// solhint-disable-line not-rely-on-time
    }
}