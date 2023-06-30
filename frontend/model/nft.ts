export interface NFT {
    // Id of nft
    tokenId?: number,

    // Name of project
    name: string,

    // Description of project
    description: string,

    // Price of project
    price: number,

    // Royalty price for using project as component
    royaltyPrice: number,

    // Address of owner
    owner: string,

    // Array of components of project (as tokenIds)
    components?: string[],

    // Hash of project JSON
    hash?: string,

    // Serialization of CAD project as JSON (geometries)
    projectJSON: any,

    // IPFS link
    ipfsLink?: string,

    //Link to thumbnail
    imageLink?: string,

    // List of accounts that bought project
    manufacturers?: string[],
}