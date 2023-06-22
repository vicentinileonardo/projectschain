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


+ Frontend
    - [x] Creare store per interagire con Metamask: ottenere address utente (andrà passato con tutte le chiamate al server -> auth)
    - [x] Creare store per API del server per interagire col backend (che interagisce coi contratti) -> spostare logica dal frontend al backend
    - Creare pagine:
        - [x] Catalogo (con possibilita' di acquisto)
        - [x] Wallet (vedere i miei progetti / quelli che ho comprato)
        - [x] Upload di progetti
    - [ ] implementare funzioni logica e collegare al backend
    - [x] creare modale per maggiori info progetto

+ Backend
    - Upload su IPFS gia' implementato (va messo alla fine del minting)
    - Sistemare alcune API
    - aggiungere logica di accesso con JWT o altro 
    - POST su server, quando ho ottenuto succes, tokenID da dal master contarct, in questo modo posso assegnare come id sul server il tokenID


+ On-chain
    - togliere eredarita' da baseNFT e lasciare solo designerNFT
    - capire perche' chaiamata a mint token da master non funziona
    - implemtare logica componenti
        * si riceve array, si controlla che esistano tutti i token id
        * impostare royalties
    - logica access smart contract
    - nella mint token di designerNFT, controllare che il tokenURI sia gia' presente sul server
    - aggiungere test

+ Report
    - spiegare l'ownership ha senso solo per cose hanno valore "intellettuale". non avrebbe senso fare nft per un progetto con all'interno una semplice sfera o cubo.

    - why storing nft metadata on our server and not entirely on IPFS?: 
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
DUBBIO 7. [BLOCKCHAIN]: Chiama endpoint su server per upload su IPFS e salvataggio definitivo su Redis,
PUT  http://localhost:3000/api/v1/nfts/hash2345
{
    "tokenID": 1,
}
(o passandolo anche come query param dato che e' un unico campo)

8. [BACKEND]: Upload su IPFS il JSON geometrico
9. [BACKEND]: Salva su Redis, aggiungendo token id e link a ipfs
10. [BACKEND]: Ritorna risorsa completa al frontend, per conferma

