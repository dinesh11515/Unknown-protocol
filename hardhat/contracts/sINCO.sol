// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "fhevm/abstracts/EIP712WithModifier.sol";
import "fhevm/lib/TFHE.sol";

contract sINCO is EIP712WithModifier {
    euint32 private totalSupply;
    string public constant name = "StreamableINCO";
    string public constant symbol = "sINCO";
    uint8 public constant decimals = 9;
    // used for output authorization
    bytes32 private DOMAIN_SEPARATOR;

    // A mapping from address to an encrypted balance.
    mapping(address => euint32) internal balances;
    struct transaction {
        euint32 flowRate;
        uint timestamp;
        bool isOnGoing;
        address participant;
    }
    mapping(address => transaction[]) internal incomingStreams;
    mapping(address => transaction[]) internal outgoingStreams;

    mapping(address => mapping(address => uint)) public tokensSentTillDate;

    // A mapping of the form mapping(owner => mapping(spender => allowance)).
    mapping(address => mapping(address => euint32)) internal allowances;

    // The owner of the contract.
    address internal contractOwner;

    constructor() EIP712WithModifier("StreamableINCO", "1") {
        contractOwner = msg.sender;
    }

    function wrap() external payable {
        require(msg.value > 0, "Need to send tokens");
        balances[msg.sender] = TFHE.add(
            balances[msg.sender],
            uint32(msg.value / 10e9)
        );
        totalSupply = TFHE.add(totalSupply, uint32(msg.value / 10e9));
    }

    function unwrap(uint32 _amount) public {
        euint32 amount = TFHE.asEuint32(_amount);
        TFHE.optReq(TFHE.gt(balances[msg.sender], amount));

        balances[msg.sender] = TFHE.sub(balances[msg.sender], amount);
        (bool sent, ) = payable(msg.sender).call{value: _amount}("");
        require(sent, "Transfer Failed");
    }

    // Transfers an encrypted amount from the message sender address to the `to` address.
    function transfer(address to, bytes calldata encryptedAmount) public {
        transfer(to, TFHE.asEuint32(encryptedAmount));
    }

    // Transfers an amount from the message sender address to the `to` address.
    function transfer(address to, euint32 amount) internal {
        _transfer(msg.sender, to, amount);
    }

    function getTotalSupply(
        bytes32 publicKey,
        bytes calldata signature
    )
        public
        view
        onlyContractOwner
        onlySignedPublicKey(publicKey, signature)
        returns (bytes memory)
    {
        return TFHE.reencrypt(totalSupply, publicKey);
    }

    function createStream(
        address _receiver,
        bytes calldata encryptedFlowrate
    ) external {
        transaction[] memory currentlyOutgoingStreams = outgoingStreams[
            msg.sender
        ];

        for (uint i = 0; i < currentlyOutgoingStreams.length; i++) {
            if (
                currentlyOutgoingStreams[i].participant == _receiver &&
                currentlyOutgoingStreams[i].isOnGoing
            ) {
                revert("TRANSACTION ALREADY ONGOING");
            } else if (
                // stream exist but is not on going then upadte that stream only instead of creating a new one
                currentlyOutgoingStreams[i].participant == _receiver &&
                !currentlyOutgoingStreams[i].isOnGoing
            ) {
                outgoingStreams[msg.sender][i].isOnGoing = true;
                outgoingStreams[msg.sender][i].flowRate = TFHE.asEuint32(
                    encryptedFlowrate
                );
                outgoingStreams[msg.sender][i].timestamp = block.timestamp;
                incomingStreams[_receiver][i].isOnGoing = true;
                incomingStreams[_receiver][i].flowRate = TFHE.asEuint32(
                    encryptedFlowrate
                );
                incomingStreams[_receiver][i].timestamp = block.timestamp;

                return;
            }
        }
        /**
         * update the outgoing streams
         */
        outgoingStreams[msg.sender].push(
            transaction(
                TFHE.asEuint32(encryptedFlowrate),
                block.timestamp,
                true,
                _receiver
            )
        );

        /**
         * update the incoming streams
         */
        incomingStreams[_receiver].push(
            transaction(
                TFHE.asEuint32(encryptedFlowrate),
                block.timestamp,
                true,
                msg.sender
            )
        );
    }

    function stopStream(address _receiver) external {
        for (uint i = 0; i < outgoingStreams[msg.sender].length; i++) {
            if (
                outgoingStreams[msg.sender][i].participant == _receiver &&
                outgoingStreams[msg.sender][i].isOnGoing == true
            ) {
                outgoingStreams[msg.sender][i].isOnGoing = false;
                incomingStreams[_receiver][i].isOnGoing = false;

                balances[msg.sender] = TFHE.sub(
                    TFHE.mul(
                        uint32(
                            block.timestamp -
                                outgoingStreams[msg.sender][i].timestamp
                        ),
                        outgoingStreams[msg.sender][i].flowRate
                    ),
                    balances[msg.sender]
                );

                balances[_receiver] = TFHE.add(
                    TFHE.mul(
                        uint32(
                            block.timestamp -
                                outgoingStreams[msg.sender][i].timestamp
                        ),
                        outgoingStreams[msg.sender][i].flowRate
                    ),
                    balances[_receiver]
                );
            }
        }
    }

    // Returns the balance of the caller under their public FHE key.
    // The FHE public key is automatically determined based on the origin of the call.
    function balanceOf(
        bytes32 publicKey,
        bytes calldata signature
    )
        public
        view
        onlySignedPublicKey(publicKey, signature)
        returns (bytes memory)
    {
        euint32 incomingBalance;
        euint32 outgoingBalance;

        /**
         * calculate the total balance that has been streamed to you by now
         */
        for (uint i = 0; i < incomingStreams[msg.sender].length; i++) {
            if (incomingStreams[msg.sender][i].isOnGoing == true) {
                incomingBalance = TFHE.add(
                    TFHE.mul(
                        uint32(
                            block.timestamp -
                                incomingStreams[msg.sender][i].timestamp
                        ),
                        incomingStreams[msg.sender][i].flowRate
                    ),
                    incomingBalance
                );
            }
        }

        /**
         * calculate the total balance that has been stream from you by now
         */
        for (uint i = 0; i < outgoingStreams[msg.sender].length; i++) {
            if (outgoingStreams[msg.sender][i].isOnGoing == true) {
                outgoingBalance = TFHE.add(
                    TFHE.mul(
                        uint32(
                            block.timestamp -
                                outgoingStreams[msg.sender][i].timestamp
                        ),
                        outgoingStreams[msg.sender][i].flowRate
                    ),
                    outgoingBalance
                );
            }
        }

        TFHE.optReq(
            TFHE.lt(
                TFHE.sub(
                    TFHE.add(balances[msg.sender], incomingBalance),
                    outgoingBalance
                ),
                TFHE.asEuint8(0)
            )
        );

        euint32 userBalance = TFHE.sub(
            TFHE.add(balances[msg.sender], incomingBalance),
            outgoingBalance
        );

        return TFHE.reencrypt(userBalance, publicKey);
    }

    function balanceRaw(bytes32 publicKey) public view returns (bytes memory) {
        return TFHE.reencrypt(balances[msg.sender], publicKey);
    }

    // Sets the `encryptedAmount` as the allowance of `spender` over the caller's tokens.
    function approve(address spender, bytes calldata encryptedAmount) public {
        address owner = msg.sender;
        _approve(owner, spender, TFHE.asEuint32(encryptedAmount));
    }

    // Returns the remaining number of tokens that `spender` is allowed to spend
    // on behalf of the caller. The returned ciphertext is under the caller public FHE key.
    function allowance(
        address spender,
        bytes32 publicKey,
        bytes calldata signature
    )
        public
        view
        onlySignedPublicKey(publicKey, signature)
        returns (bytes memory)
    {
        address owner = msg.sender;
        return TFHE.reencrypt(_allowance(owner, spender), publicKey);
    }

    // Transfers `encryptedAmount` tokens using the caller's allowance.
    function transferFrom(
        address from,
        address to,
        bytes calldata encryptedAmount
    ) public {
        transferFrom(from, to, TFHE.asEuint32(encryptedAmount));
    }

    // Transfers `amount` tokens using the caller's allowance.
    function transferFrom(address from, address to, euint32 amount) public {
        address spender = msg.sender;
        _updateAllowance(from, spender, amount);
        _transfer(from, to, amount);
    }

    function _approve(address owner, address spender, euint32 amount) internal {
        allowances[owner][spender] = amount;
    }

    function _allowance(
        address owner,
        address spender
    ) internal view returns (euint32) {
        return allowances[owner][spender];
    }

    function _updateAllowance(
        address owner,
        address spender,
        euint32 amount
    ) internal {
        euint32 currentAllowance = _allowance(owner, spender);
        TFHE.optReq(TFHE.le(amount, currentAllowance));
        _approve(owner, spender, TFHE.sub(currentAllowance, amount));
    }

    // Transfers an encrypted amount.
    function _transfer(address from, address to, euint32 amount) internal {
        // Make sure the sender has enough tokens.
        TFHE.optReq(TFHE.le(amount, balances[from]));

        // Add to the balance of `to` and subract from the balance of `from`.
        balances[to] = TFHE.add(balances[to], amount);
        balances[from] = TFHE.sub(balances[from], amount);
    }

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner);
        _;
    }
}
