var Counter = artifacts.require("Counter");
const { setEnvValue } = require('./functionsMigration.js');

module.exports = function(deployer) {
  deployer.deploy(Counter).then(function() {
    setEnvValue("COUNTER_CONTRACT_ADDRESS", Counter.address);
  });
};
