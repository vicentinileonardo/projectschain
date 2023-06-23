https://docs.chain.link/chainlink-nodes/v1/running-a-chainlink-node

used alchemy ethereum client




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



https://docs.chain.link/chainlink-nodes/v1/fulfilling-requests

https://sepoliafaucet.com/



