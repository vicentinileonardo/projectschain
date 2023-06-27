
# First step: Running a Chainlink node

https://docs.chain.link/chainlink-nodes/v1/running-a-chainlink-node

used alchemy ethereum client, not a local one like geth
accessed with google credentials




docker run --name cl-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres

---

echo "[Log]
Level = 'warn'

[WebServer]
AllowOrigins = '\*'
SecureCookies = false

[WebServer.TLS]
HTTPSPort = 0

[[EVM]]
ChainID = '11155111'

[[EVM.Nodes]]
Name = 'Sepolia'
WSURL = 'wss://eth-sepolia.g.alchemy.com/v2/KGZskFw4PabGLf3PzNBflZe8JGKhHfhL'
HTTPURL = 'https://eth-sepolia.g.alchemy.com/v2/KGZskFw4PabGLf3PzNBflZe8JGKhHfhL'
" > .chainlink-sepolia/config.toml

---

echo "[Password]
Keystore = 'mysecretkeystorepassword'
[Database]
URL = 'postgresql://postgres:mysecretpassword@host.docker.internal:5432/postgres?sslmode=disable'
" > .chainlink-sepolia/secrets.toml

---


cd .chainlink-sepolia && docker run --platform linux/x86_64/v8 --name chainlink -v /Users/leonardovicentini/Desktop/Magistrale/Blockchain/Chainlink/.chainlink-sepolia:/chainlink -it -p 6688:6688 --add-host=host.docker.internal:host-gateway smartcontract/chainlink:2.0.0 node -config /chainlink/config.toml -secrets /chainlink/secrets.toml start

api email: vicentini.leonardo99@gmail.com
api password: ULTiagnUmpUmPinG

---

docker ps -a -f name=chainlink

test at: http://localhost:6688/





# Second step: Fulfilling requests

https://docs.chain.link/chainlink-nodes/v1/fulfilling-requests

funding the chainlink node:
https://sepoliafaucet.com/ (by alchemy)


# admin address (the one on metamask) [needs to be funded]
0x46D72b1e93D5daaD3b68104F437Dbe0a4b00e18c

# node address [needs to be funded]
0x66f3742D3b5C9d104FCaE69f4Fcc4bc734396377

# operator/oracle contract address [does not need to be funded]
0xe367a0f5E216dE86a90FD9E0d8aea27d6a4956bd

# Job #1 ID
38d2757024be4f4ba47f80bcd173ca6a

# Job #2 ID
de80a02e11e540fea0de2177bb55f717


# ProjectNFT address (chainlink client) [needs to be funded with LINK]
0x408E2CF31923427C1304AB02e8F68b74feb47Fc2

# Users contract addresses [needs to be funded] in order to buy projects



# host machine ip address, since we are running the node on docker
ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}'
ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1
192.168.1.238

start the container with --network=host and then you can use localhost instead of the ip address, 
this should work on linux but not on mac





# notes on job toml file: 

decode_log: This task decodes the input data from the blockchain log using the OracleRequest ABI. The input data contains information about the oracle request, such as the requestId, payment, and data parameters.

decode_cbor: This task decodes the data parameter from the oracle request into a CBOR object. The CBOR object contains information about the tokenId that needs to be sent as part of the PUT request to the external API.

put_request: This task sends a PUT request to the specified URL with the tokenId from the CBOR object as the request body. The allowUnrestrictedNetworkAccess flag is set to true to allow the external adapter to access any URL.

parse: This task parses the response from the external API and extracts the status field. The path parameter specifies the location of the status field in the JSON response.

encode_data: This task encodes the requestId from the oracle request and the value as a boolean indicating whether the response status is success or not.

encode_tx: This task encodes the fulfillOracleRequest2 function call with the requestId, payment, callbackAddress, callbackFunctionId, expiration, and data parameters. The data parameter is set to the output of the encode_data task.

submit_tx: This task submits the encoded transaction to the specified contract address.




# notes on client smart contract:

explain this in details
function fulfillEthereumPrice(
bytes32 _requestId,
bool _success
) public recordChainlinkFulfillment(_requestId) {
emit RequestEthereumPriceFulfilled(_requestId, _success);
if (_success) {
// Handle successful response from external API
} else {
// Handle unsuccessful response from external API
}
}

This is a function called fulfillEthereumPrice that is a part of a smart contract that uses the Chainlink oracle service to obtain the current Ethereum price from an external API.

The function takes two parameters: _requestId, which is a unique identifier for the request made to the Chainlink oracle, and _success, which is a boolean value indicating whether the request to the external API was successful or not.

The public keyword means that this function can be called externally by anyone, including other smart contracts and external accounts.

The recordChainlinkFulfillment modifier is used to ensure that the function is only called by the Chainlink oracle service, and that the _requestId parameter matches the ID of a pending request made by the contract to the Chainlink oracle. This helps prevent unauthorized access and ensures that the function is only called in response to a valid request.

Inside the function, an event called RequestEthereumPriceFulfilled is emitted with the _requestId and _success parameters as inputs. The purpose of this event is to notify other parts of the contract or external applications that the request has been fulfilled and whether it was successful or not.

If the _success parameter is true, the function proceeds to handle the successful response from the external API. This could involve updating the contract state, triggering other functions, or interacting with other smart contracts or external systems.

If the _success parameter is false, the function handles the unsuccessful response from the external API. This could involve retrying the request, logging the error, or taking some other action to handle the failure.

Overall, this function provides a way for the smart contract to receive and process the response from the Chainlink oracle service, and to take appropriate action based on the success or failure of the request.


TOO big smart contract:
Warning: Contract code size is 26765 bytes and exceeds 24576 bytes (a limit introduced in Spurious Dragon). This contract may not be deployable on Mainnet. Consider enabling the optimizer (with a low "runs" value!), turning off revert strings, or using libraries.

Contract creation initialization returns data with length of more than 24576 bytes. The deployment will likely fail if the current network has activated the eip 170. More info: eip-170

struct instead of mapping
reduced error messages
created function for a message error
activated optimizer, with a low runs value

(You can also change the optimizer settings. The default value of 200 means that it's trying to optimize the bytecode as if a function is called 200 times. If you change it to 1, you basically tell the optimizer to optimize for the case of running each function only once. An optimized function for running only one time means it is optimized for the deployment itself. Be aware that this increases the gas costs for running the functions, so you may not want to do it.
)