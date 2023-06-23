On the server:
1st step: Create a new NFT
2nd step: Assign the NFT to an owner

Resources and Endpoints:

First resource coming from frontend, so it is the payload of the POST

{
    "name": "NFT name",
    "description": "NFT description",
    "price": 0.1,
    "royalties": 0.1,
    "components": [1,34,5], //list of tokenIds of the components,
    "owner": "wallet address",
    "projectJSON": {
        "C1": "asd",
        "C2": "abc",
        "C3": "123"
    }
}


**Value on Redis**: NFT resource in JSON format
{
    "status": premint | minted
    "tokenId": "1", //incremental identifier, returned by the master contract after minting
    "name": "NFT name",
    "description": "NFT description",
    "price": 0.1,
    "royaltyPrice": 0.1,
    "owner": "wallet address", 
    "hash": "hash of the NFT",
    "imageLink": filename, //ex. project1.jpeg
    "ipsfLink": link to IPFS,
    "projectJSON": {
        "components": [1,34,5], //list of tokenIds of the components,
        "C1": "asd",
        "C2": "abc",
        "C3": "123"
    }
    "manufacturers": [
        "wallet address1",
        "wallet address2"
    ],
    "buyers": [
        "wallet address1",
        "wallet address2"
    ]

}


GET /nfts
GET /nfts/{tokenId}
POST /nfts
PUT /nfts/{hash} (MINT)
PATCH /nfts/{tokenId} (UPDATE) 
DELETE /nfts
DELETE /nfts/{tokenId}


GET /nfts/catalog // esclude quelli mintati da se stesso
GET /owners/0x11199/nfts
GET /buyers/0x11199/nfts










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



