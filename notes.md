To be used in the report, if needed

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