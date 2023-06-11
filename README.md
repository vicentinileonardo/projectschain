# blockchain-project

Google doc:
https://docs.google.com/document/d/1N4C0VYREDxl1NqOsBbevRbWa5_r74DFTg6tUAF2v8X4/edit

### TODO

+ Master contract
    - server deve gia' avere i metadati del nft
    - recupera i metadati del nft dal server
    - Per mintare DesignerNFT, richiamando mintToken passandogli tokenURI

+ Smart contract per gli accessi
    - deve avere una funzione payable per ricevere i pagamenti
    - la funzione payable va a vedere il mapping <tokenID, price> e se il pagamento e' corretto, generera token di accesso (e.g. JWT) e li restituira' al chiamante
    - dato che viene chiamata la funzione paybale qui, valutare se la distribuzione delle royalties sia meglio gestirla qui o nel master contract

+ DesignerNFT
    - controllare mapping gia' esistenti da openZeppelin (e.g. _tokenURIs) -> controllato, non è utile allo stato attuale
    
    Problema attuale dell'usare tokenId incrementale: deadlock
    1. bisogna avere già l'nft su server (rappresentato da tokenURI), quindi serve già avere il tokenId al momento della POST.
    2. ma il token id viene generato dal master contract al momento del minting, quindi non si può avere prima di aver mintato. il minting necessita del tokenURI che è l'nft sul server
    3. quindi non si può mintare prima di aver creato l'nft sul server
    4. ma non si può creare l'nft sul server prima di aver mintato, perchè serve il tokenId
    5. quindi deadlock

    Possible solution
    use hash as id on server

    
    



    Mixed approach:
    This approach combines the benefits of centralized metadata storage with the decentralization and security provided by a smart contract. The metadata is stored on a centralized server, which can be more easily updated and managed, while the NFT creation process is handled by a smart contract, which ensures that the token ID is assigned in a predictable and secure manner.


