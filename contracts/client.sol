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
   
    string public base_url_part_1 = "http://";
    string public base_url_part_2 = ":3000/api/v1/nfts/";

    mapping(uint256 => bool) public _tokenIdToOutcome;

    mapping(uint256 => string) private _tokenIdToHash;

    event RequestConfirmMintingFulfilled(
        bytes32 indexed requestId,
        uint256 tokenId,
        string success
    );

    /**
     *  Sepolia
     *@dev LINK address in Sepolia network: 0x779877A7B0D9E8603169DdbD7836e478b4624789
     * @dev Check https://docs.chain.link/docs/link-token-contracts/ for LINK address for the right network
     */
    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        _tokenIdToHash[15] = "QmevypABzm3DB3srcjbb2KCZtfQU4nSdSe6r6wiqqAvRi3";
    }

    //called inside the mint function of the NFT contract
    //we need a modifier to check if the caller is the NFT contract (now it's only the owner of the contract)
    function requestConfirmMinting(
        address _oracle,
        string memory _jobId,
        uint256 _tokenId,
        string memory _host_machine_ip
    ) public onlyOwner {
        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(_jobId),
            address(this),
            this.fulfillConfirmMinting.selector
        );

        req.add("url", string(abi.encodePacked(base_url_part_1, _host_machine_ip, base_url_part_2, _tokenIdToHash[_tokenId])));
        //req.add("method", "PUT"); already in TOML of the node
        //req.add("headers", "Content-Type: application/json"); omit for now
        req.add(
            "body",
            string(abi.encodePacked('{"tokenId":',Strings.toString(_tokenId),'}'))
        );
        req.add("tokenId", Strings.toString(_tokenId));

        sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    function fulfillConfirmMinting(
        bytes32 _requestId,
        uint256 _tokenId,
        string memory _success
    ) public recordChainlinkFulfillment(_requestId) {

        //debug log

        emit RequestConfirmMintingFulfilled(_requestId, _tokenId ,_success);

        if(keccak256(abi.encodePacked(_success)) == keccak256(abi.encodePacked("success"))){
            _tokenIdToOutcome[_tokenId] = true;
        }
        else{
            _tokenIdToOutcome[_tokenId] = false;
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

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
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
