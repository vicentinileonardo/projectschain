On the server:
1st step: Create a new NFT
2nd step: Assign the NFT to an owner

Resources and Endpoints:

**Key on Redis**: "nft:{tokenId}"
**Value on Redis**: NFT resource in JSON format
{
    "tokenId": "1", //incremental identifier
    "name": "NFT name",
    "description": "NFT description",
    "hash": "hash of the NFT",
    "project": another link to IPFS,
    "image": link to IPFS,
    "components": [1,34,5] //list of tokenIds of the components,
    "owner": "wallet address"
}

GET /nfts
GET /nfts/{id}
POST /nfts
PUT /nfts/{id} (optional)
DELETE /nfts/{id}


**Key on Redis**: "owner:{wallet}"
**Value on Redis**: SET of NFTs owned by the owner
{
    "wallet": "wallet address",
    "nfts": [
        {
            "tokenId": "1", //incremental identifier
            "name": "NFT name",
            "description": "NFT description",
            "image": link to IPFS,
            "project": another link to IPFS,
            "owner": "wallet address"
        },
        {
            "tokenId": "2", //incremental identifier
            "name": "NFT name",
            "description": "NFT description",
            "image": link to IPFS,
            "project": another link to IPFS,
            "owner": "wallet address"
        }
    ]
}

GET /owners 
GET /owners/{wallet}
POST /owners
PUT /owners/{wallet} (optional)
DELETE /owners/{wallet}



