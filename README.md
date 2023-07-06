# ProjectChain

Google doc:
https://docs.google.com/document/d/1N4C0VYREDxl1NqOsBbevRbWa5_r74DFTg6tUAF2v8X4/edit


## Architecture diagram

<img src="readme_assets/architecture_diagram.png">

## UML diagram of smart contracts 

## How to run

### Prerequisites

#### Chainlink mode (recommended)

1. Setup a local Chainlink node by following the instructions in the [Chainlink documentation](https://docs.chain.link/chainlink-nodes/v1/running-a-chainlink-node).

2. Setup the Chainlink jobs on the node by following the instructions in the [Chainlink documentation](https://docs.chain.link/chainlink-nodes/v1/fulfilling-requests).

3. Configure a new job on the Chainlink using tht TOML file named `mint_job.toml` in the `config/chainlink` folder.

4. Update the environment variables in the `.env` file with:
+ the `HOST_MACHINE_IP` of the machine running the Chainlink node
+ the `ORACLE` address of the smart contract `Oracle.sol` deployed on the blockchain
+ the value of `JOBID_1` with the Job ID of the job created in the previous step (without the dashes)

#### 

## Security

### Access control on smart contracts

+ Modifiers for access control in smart contracts

### Pre-minting


### Digital signature

<img src="readme_assets/digital_signature.png">

### Chainlink request





## Technology

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Vue](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Web3JS](https://img.shields.io/badge/web3.js-F16822?style=for-the-badge&logo=web3.js&logoColor=white)

![Solidity](https://img.shields.io/badge/Solidity-e6e6e6?style=for-the-badge&logo=solidity&logoColor=black)
![Chainlink](https://img.shields.io/badge/chainlink-375BD2?style=for-the-badge&logo=chainlink&logoColor=white)

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) 
![ExpressJS](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Redis](https://img.shields.io/badge/redis-CC0000.svg?&style=for-the-badge&logo=redis&logoColor=white)

## Future improvements

## Acknowledgements

+ [Chainlink documentation](https://docs.chain.link/)
