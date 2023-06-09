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
    - controllare mapping gia' esistenti da openZeppelin (e.g. _tokenURIs)


