// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";



/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

contract ATestnetConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 * 10**18
    string public base_url = "http://localhost:3000/api/v1/nfts";
    mapping(uint256 => string) private _tokenIdToHash;

    event RequestConfirmMintingFulfilled(
        bytes32 indexed requestId,
        bool indexed success
    );

    /**
     *  Sepolia
     *@dev LINK address in Sepolia network: 0x779877A7B0D9E8603169DdbD7836e478b4624789
     * @dev Check https://docs.chain.link/docs/link-token-contracts/ for LINK address for the right network
     */
    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
    }

    function requestConfirmMinting(
        address _oracle,
        string memory _jobId,
        uint256 _tokenId
    ) public onlyOwner {
        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(_jobId),
            address(this),
            this.fulfillConfirmMinting.selector
        );

        req.add("url", string(abi.encodePacked(base_url, _tokenIdToHash[_tokenId])));
        //req.add("method", "PUT"); already in TOML of the node
        //req.add("headers", "Content-Type: application/json"); omit for now
        req.add(
            "body",
            string(
                abi.encodePacked(
                    "{",
                    '\\"tokenId\\":',
                    _tokenId,
                    "}"
                )
            )
        );
        sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    function fulfillConfirmMinting(
        bytes32 _requestId,
        bool _success
    ) public recordChainlinkFulfillment(_requestId) {
        emit RequestConfirmMintingFulfilled(_requestId, _success);
        if (_success) {
            // Handle successful response from centralized server
        } else {
            // Handle unsuccessful response from centralized server
        }
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    function cancelRequest(
        bytes32 _requestId,
        uint256 _payment,
        bytes4 _callbackFunctionId,
        uint256 _expiration
    ) public onlyOwner {
        cancelChainlinkRequest(
            _requestId,
            _payment,
            _callbackFunctionId,
            _expiration
        );
    }

    function stringToBytes32(
        string memory source
    ) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }
}
