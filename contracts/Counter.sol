// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Counter {

    uint256 private count;

    function incrementCounter() public {
        count = count + 1;
    }

    function decrementCounter() public {
        count = count - 1;
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }

    function reset() public {
        count = 0;
    }
}