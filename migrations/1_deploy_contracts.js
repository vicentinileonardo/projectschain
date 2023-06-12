var Counter = artifacts.require("Counter");
const { storeAddress } = require('./functionsMigration.js');

module.exports = function(deployer) {
  deployer.deploy(Counter).then(function() {
    storeAddress("COUNTER_CONTRACT_ADDRESS", Counter.address);
  });
};
