// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Strings.sol";

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract CustomChainlinkClient is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;
         
    string public _base_url_1 = "http://";
    string public _base_url_2 = ":3000/api/v1/nfts/";

    uint256 private constant ORACLE_PAYMENT = (1 * LINK_DIVISIBILITY) / 10; // 0.1 * 10**18

    string _host_machine_ip;
    address _oracle;
    string _jobId_1;
    string _jobId_2;
    
    event RequestConfirmMintingFulfilled(
        uint256 indexed tokenId,
        string success
    );

    event RequestUpdateFulfilled(
        uint256 indexed tokenId,
        string success
    );

    constructor(string memory hostMachineIp, address oracle, string memory jobId_1, string memory jobId_2) ConfirmedOwner(msg.sender) {

        // Set LINK token address for Sepolia network 
        setChainlinkToken(0x779877A7B0D9E8603169DdbD7836e478b4624789);
        _host_machine_ip = hostMachineIp;
        _oracle = oracle;
        _jobId_1 = jobId_1;
        _jobId_2 = jobId_2;
    }
    
    //called inside the mint function
    //internal modifier is used to allow the function to be called only from the contract itself
    function requestConfirmMinting(uint256 _tokenId, string memory _hash) internal onlyOwner {

        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(_jobId_1),
            address(this),
            this.fulfillConfirmMinting.selector
        );

        req.add("url", string(abi.encodePacked(_base_url_1, _host_machine_ip, _base_url_2, _hash)));
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

        emit RequestConfirmMintingFulfilled(_tokenId ,_success);
    }

    function requestUpdate(
        uint256 _tokenId,
        string memory _key,
        address _assignee
    ) public onlyOwner {

        //_key must be "buyer" or "manufacturer"
        require(
            keccak256(abi.encodePacked(_key)) == keccak256(abi.encodePacked("buyer")) ||
            keccak256(abi.encodePacked(_key)) == keccak256(abi.encodePacked("manufacturer")),
            "Wrong key"
        );

        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(_jobId_2),
            address(this),
            this.fulfillRequestUpdate.selector
        );

        req.add("url", string(abi.encodePacked(_base_url_1, _host_machine_ip, _base_url_2, Strings.toString(_tokenId))));
        //req.add("method", "PUT"); already in TOML of the node
        //req.add("headers", "Content-Type: application/json"); omit for now
        req.add(
            "body",
            string(abi.encodePacked('{"', _key, '":"', Strings.toHexString(uint256(uint160(_assignee)), 20),'"}'))
            //tring(abi.encodePacked('{"', _key, '":"', _assignee,'"}')) //to be tested
        );
        req.add("tokenId", Strings.toString(_tokenId));

        sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
    }

    function fulfillRequestUpdate(
        bytes32 _requestId,
        uint256 _tokenId,
        string memory _success
    ) public recordChainlinkFulfillment(_requestId) {

        emit RequestUpdateFulfilled(_tokenId ,_success);
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
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
