To be used in the report

# about centralization

list of endpoints

Since the plugin has a catalog of NFTs 
<describe how the catalog works (filtering)>

Our plugin solution needs a centralized backend to work, this is because we need to perform some checks before minting the NFTs on the blockchain. This is a common practice in the NFT world, and it is generally a good idea to perform these checks before sending the minting transaction to the blockchain. This can help to ensure that the minting process is likely to succeed, and can help to avoid wasting gas fees on failed transactions.

## About pre checks:
It is generally a good practice to perform internal checks on a centralized backend before sending a minting request on the blockchain. This approach can help to ensure that the minting process is likely to succeed, and can help to avoid wasting gas fees on failed transactions.

By performing pre-checks on the centralized backend, you can verify that all necessary data is available and formatted correctly, and that the minting request meets any additional requirements or constraints that may exist. For example, you may want to check that the user has sufficient balance, that the requested NFT metadata exists and is valid, or that the requested NFT name is not already in use.

Performing these checks before sending the minting transaction can help to reduce the risk of transaction failures due to missing or incorrect data, and can help to ensure that the transaction is likely to be successful. This can be especially important in cases where gas fees are high or where the blockchain network is congested.

However, it is important to note that performing internal checks on a centralized backend does not guarantee that the minting transaction will be successful. The blockchain network can still experience network congestion or other issues that may cause transactions to fail, even if all pre-checks have been performed correctly. Therefore, it is important to handle transaction failures gracefully and to provide appropriate feedback to users in case of failure.

AND

It is generally a good practice to perform internal checks before sending a minting request on the blockchain. These internal checks can help ensure that the minting process is likely to succeed and reduce the risk of failed transactions or wasted gas fees. By performing these checks on a centralized backend, you can validate various conditions such as the availability of resources, the correctness of inputs, and the compliance with business rules before initiating the minting process on the blockchain.

Here are some steps you can follow to implement this practice:

Validate the inputs: Check if the required parameters for minting are provided and if they meet the necessary criteria. For example, you can verify if the owner's address is valid and if the metadata URI is correctly formatted.
Perform pre-minting checks: Perform additional checks specific to your use case to ensure that the minting process is likely to succeed. This could include checking the availability of resources, verifying permissions or roles, and enforcing any business rules or constraints.
Handle errors gracefully: If any validation or pre-minting check fails, handle the error gracefully and provide appropriate feedback to the user. This can help avoid unnecessary transactions on the blockchain and improve the user experience.
By implementing these internal checks, you can ensure that the minting process is more reliable and efficient. However, it is important to note that these checks should complement the inherent validation mechanisms provided by the smart contract itself, as the blockchain is ultimately the authoritative source of truth for the minting process.

## About manufactures and buyers lists

These list are **whitelists**, so the platform that has our plugin can check if the manufacturer can use the project


## about projectNFT transferPayment function

we should be aware of the following points:

Gas costs: In the transferPayment function, you're transferring Ether multiple times, which can be quite gas expensive. You might want to consider other designs that could reduce the number of Ether transfers.
Security: When dealing with Ether transfers in Solidity, it's generally recommended to use the "withdrawal" pattern instead of the "push" pattern. This means instead of pushing the payments to the recipients (like you're doing with transfer), you would let the recipients withdraw their payments. This can help prevent re-entrancy attacks. However, this would require a significant redesign of your contracts.
Error handling: In the transferPayment function, you're subtracting amounts from amount after each transfer. It would be a good idea to add checks to ensure that amount does not go below zero, which could potentially result in unexpected behavior

# contract optimization
goal: reduce gas costs and code size since size is a factor for gas costs and a limit of 24kb is imposed by the EVM
- tokenCounter diventa quello di openzeppelin perche’ ho visto che e’ piu’ safe a livello di security
- i mapping diventanano un unico mapping da tokenId a struct che rappresenta il token
- rimane invece il mapping: mapping(string => bool) private _hashes;
- un require usato tante volte l’ho messo come funzione

- enabling the compiler optimizer and setting the runs: 1,

# Chainlink

Used in order to confirm the minting of the NFT
Update the access control lists / whitelists


# difficulty of testing chainlink

Chainlink is not support by ganache 
All the setup must be done on a testnet, Sepolia was used
Problem: getting LINK token is quite easy but getting SepETH from faucet it takes times
Testing resulted in a very slow process

temporary solution: 
setup of chainlink was done by one team member
setup is quite long
all the setup is complete which comprehend node setup using docker, node funding, job creation. 

for testing 2 contract were created: client and client2
from these the CustomChianlinkClient contract was created

This contract is inherited by the ProjectNFT contract


# on gas costs

deployment costs

minting costs

buy costs


# on business model

2 part of the strategy, based on the platform size we propose to:

1. big platform: sell the plugin to big platform with a big down payment.
since they have a big user base, they can afford to pay for the plugin and they could even be scared of the revenue sharing model on the long term.

2. small platform: probably they do not have the money to pay for the plugin, so we can offer them a revenue sharing model, no down payment. A commission on each NFT sold on the platform that uses our plugin goes to us, the plugin provider.

possibility to be discuss on a case by case basis: the platform will take care of the minting costs and the gas costs on behalf of the users

thinking as a startup: first we need to get quite a lot of money to survive, so the first part of the strategy is the one that can provide us with the money to survive in a short term and fast way.
The second part of the strategy could be the one that can provide us with the money to grow (hoping that the small platform will grow with us) (network effects, etc.)