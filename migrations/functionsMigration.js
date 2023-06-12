const fs = require('fs');
const os = require('os');

function setEnvValue(key, value) {

    const ADR_VARS = fs.readFileSync("./frontend/stores/contractAddresses.txt", "utf8").split(os.EOL);

    const target = ADR_VARS.indexOf(ADR_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));

    ADR_VARS.splice(target, 1, `${key}=${value}`);

    fs.writeFileSync("./frontend/stores/contractAddresses.txt", ADR_VARS.join(os.EOL));

}

module.exports = {
    setEnvValue
  };