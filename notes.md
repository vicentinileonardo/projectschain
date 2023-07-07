To be used in the report

# about centralization

list of endpoints

Since the plugin has a catalog of NFTs 
<describe how the catalog works (filtering)>

Our plugin solution needs a centralized backend to work, this is because we need to perform some checks before minting the NFTs on the blockchain. This is a common practice in the NFT world, and it is generally a good idea to perform these checks before sending the minting transaction to the blockchain. This can help to ensure that the minting process is likely to succeed, and can help to avoid wasting gas fees on failed transactions.

Mixed approach:
This approach combines the benefits of centralized metadata storage with the decentralization and security provided by a smart contract. The metadata is stored on a centralized server, which can be more easily updated and managed, while the NFT creation process is handled by a smart contract, which ensures that the token ID is assigned in a predictable and secure manner.

## OK About pre checks:
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

## REMOVED About manufactures and buyers lists

These list are **whitelists**, so the platform that has our plugin can check if the manufacturer can use the project


## OK, about projectNFT transferPayment function

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

- enabling the compiler optimizer and setting the runs to 1 so even if a function is called once it will be optimized

# Chainlink

Used in order to confirm the minting of the NFT
Update the access control lists / whitelists


# difficulty of testing chainlink

Chainlink is not supported by ganache 
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



# on ownership
spiegare l'ownership ha senso solo per cose hanno valore "intellettuale". non avrebbe senso fare nft per un progetto con all'interno una semplice sfera o cubo.

# on centralization
why storing nft metadata on our server and not entirely on IPFS?: 
    * easier to manage a dapp with a catalog of nft
    * easier to grant to manufacter the access to the nft metadata via auth


Flow per ora:
1. [FRONTEND]: POST su server con JSON, il json contiene tutti i dati del NFT e le geometrie. 
Assumption: questo JSON ha gia' un array to tokenId che rappresenta i componenti del NFT, se presenti. E' compito del software cad stabilre quali sono i componenti presenti

2. [BACKEND]: Arriva una risorsa NFT "parziale", mancano tokenid, link a ipfs
3. [BACKEND]: Genera hash del JSON geometrico e controlli vari
4. [BACKEND]: Pre-salva su Redis la risorsa, per ora indicizzata (individuabile) tramite hash
4. [BACKEND]: Finiti i controlli interni ritorna un response al frontend (indicando via libera per mintare). I controlli in backend permettono di non usare la blockchain per un minting che non andrebbe a buon fine.

5. [FRONTEND]: Chiama mintToken su master contract, passando hash, price, royalties

6. [BLOCKCHAIN]: Controlli vari, minta token, genera tokenID
DUBBIO 
7. [BLOCKCHAIN]: Chiama Chainlink
8. [CHAINLINK]: Chiama endpoint PUT su server per upload su IPFS e salvataggio definitivo su Redis,
PUT  http://localhost:3000/api/v1/nfts/hash2345
{
    "tokenID": 1,
}

9. [BACKEND]: Upload su IPFS il JSON geometrico
10. [BACKEND]: Salva su Redis, aggiungendo token id e link a ipfs
11. [BACKEND]: Ritorna response a chainlink
12. [CHAINLINK]: Chiama callback su blockchain
13. [BLOCKCHAIN]: Emette evento di minting


# on the backend signature

in the context of Ethereum and the ECDSA (Elliptic Curve Digital Signature Algorithm), r, s, and v are components of a digital signature.

When an Ethereum transaction is signed using a private key, the signature is produced as a set of three components: r, s, and v.

r and s are two 32-byte numbers that, together with the public key, prove the transaction was signed by the owner of the private key.
v is a single byte (0 or 1) that represents the recovery id. It's used to recover the public key from the signature.

Here's a brief explanation of each parameter and how it's used:

r, s: These are two 32-byte numbers produced as part of the ECDSA signature. They are derived from the private key of the signer and the data being signed.
v: This is the recovery id, a single byte derived during the signature creation process. It helps to recover the public key from the signature.
price, royaltyPrice, projectHash, components: These are the data that was signed. It's hashed together into a single 32-byte hash.
backendAccount: This is the Ethereum account expected to have signed the data. It's compared against the account recovered from the signature.
The ecrecover function is used to recover the Ethereum account that signed the given data. If the recovered signer matches the backendAccount, the function proceeds to mint the token. Otherwise, it reverts with the message "Invalid signature"


A digital signature is a mathematical technique used to verify the **authenticity** and **integrity** of a message or document. In this case, the private key of the backend is used to sign a message (the concatenation of price, royaltyPrice, and hash) using the keccak256 hashing algorithm. The resulting signature (v, r, and s) is then added to the nft object and sent to the frontend.

In the frontend, the signature values are passed to the mintToken function of the Solidity contract. The keccak256 hash of the message is then generated again using the values of price, royaltyPrice, and hash to verify the signature. The ecrecover function is then used to recover the public key of the signer from the signature. The recovered public key is then compared to the address of the backend to ensure that the signature is valid.

This process ensures that only the backend with the correct private key can sign messages and generate valid signatures, which helps to prevent unauthorized access to the mintToken function of the Solidity contract.


# OK on frontend bugs

switching account on metamask does not work all the time, it is necessary to refresh the page in order to make it work