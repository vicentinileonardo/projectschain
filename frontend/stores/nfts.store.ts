import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { NFT } from '@/model/nft';
import { useAccountStore } from './account.store';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import contractABI from '../../build/contracts/Master.json';
import projectABI from '../../build/contracts/ProjectNFT.json';


//with Chainlink we must import also ProjectNFT since the Chainlink events are emitted by the ProjectNFT contract and not by the Master contract

const CHAINLINK_ENABLED = false;
const SEPOLIA_ENABLED = false;
const SEPOLIA_NETWORK_ID = '11155111';


interface ApiError {
  status: number,
  message: string,
}

export interface BuyPrice {
  base: number, 
  royaltyPrice: number,
  total: number,
}

/**
 * Store to interact with backend
 */
export const useNFTsStore = defineStore('nfts', () => {
  const catalogNfts = ref<NFT[]>([]);
  const myNfts = ref<NFT[]>([]);
  const boughtNfts = ref<NFT[]>([]);
  const contractAddress = ref<string | null>(null);
  const projectAddress = ref<string | null>(null);
  const masterContract = ref<any | null>(null);
  const projectContract = ref<any | null>(null);

  async function setUp() {
    if(!SEPOLIA_ENABLED) {
      // Get contract address: read last network deployment
      const lastDeploy = Object.keys(contractABI.networks).pop();
      if (lastDeploy) {
        contractAddress.value = (contractABI.networks as any)[lastDeploy].address;
      }

      const projectLastDeploy = Object.keys(projectABI.networks).pop();
      if (projectLastDeploy) {
        projectAddress.value = (projectABI.networks as any)[projectLastDeploy].address;
      }
    } else {
      contractAddress.value = (contractABI.networks as any)[SEPOLIA_NETWORK_ID].address;
      projectAddress.value = (projectABI.networks as any)[SEPOLIA_NETWORK_ID].address;
    }
    

    if (contractAddress.value && projectAddress.value) {
      try {
        // Get web3 instance from browser: connect to MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);

        // Setup contract
        masterContract.value = new web3.eth.Contract(contractABI.abi as AbiItem[], contractAddress.value);
        projectContract.value = new web3.eth.Contract(projectABI.abi as AbiItem[], projectAddress.value);
      } catch (err) {
        console.error("Error in setting up connection to blockchain", err);
      }
    } else {
      console.error("Was not able to obtain contract address");
    }
  }

  async function getCatalogNfts() {
    if (catalogNfts.value.length == 0) {
      // Get catalog nfts
      const projects = await request('/api/v1/nfts/catalog', 'GET');
      catalogNfts.value = projects.nfts;
    }
  }

  async function getMyNfts() {
    if (myNfts.value.length == 0) {
      // Get my nfts
      const accountStore = useAccountStore();
      const projects = await request(`/api/v1/owners/${accountStore.getAccount}/nfts`, 'GET');
      myNfts.value = projects.nfts;
    }
  }

  async function getBoughtNfts() {
    if (boughtNfts.value.length == 0) {
      // Get my nfts
      const accountStore = useAccountStore();
      const projects = await request(`/api/v1/buyers/${accountStore.getAccount}/nfts`, 'GET');
      boughtNfts.value = projects.nfts;
    }
  }

  async function mintNewProject(nft: NFT) {
    const accountStore = useAccountStore();

    // Requires contract and user addresses
    if (!contractAddress.value || !accountStore.getAccount) {
      throw new Error('Need to have account and master contract addresses');
    }

    console.log("NFT to mint", {
      ...nft,
      price: Number(convertFromEth(nft.price)),
      royaltyPrice: Number(convertFromEth(nft.royaltyPrice))
    });

    // Pre-mint: post new project to backend for preliminary checks and hash
    const preMintedProject = await request('/api/v1/nfts', 'POST', {
      ...nft,
      price: Number(convertFromEth(nft.price)),
      royaltyPrice: Number(convertFromEth(nft.royaltyPrice))
    } as NFT);

    console.log('Pre-mint successfull', preMintedProject);
  
    // Mint new project NFT on blockchain
    // Get web3 instance from browser: connect to MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(window.ethereum);

    // Add event listener for NewToken
    masterContract.value.events.NewToken()
      .on('data', async (event: any) => {

        console.log("New token event", event);

        const address = event.returnValues[0];
        const tokenId = event.returnValues[1];

        // Set tokenId
        preMintedProject.nft.tokenId = parseInt(tokenId);

        if(!CHAINLINK_ENABLED) {

          // Need to simulate oracle: make put to complete minting with token id
          const mintedProject = await request(`/api/v1/nfts/${preMintedProject.nft.hash}`, 'PUT', preMintedProject.nft);
          console.log("Mint successful for project", mintedProject);

          // Add to store minted project from server
          if (!myNfts.value.map(nft => nft.tokenId).includes(tokenId)) {
            myNfts.value.push(mintedProject.nft);
          } else {
            console.log("Nft already in store!");
          }
          
        } else {
          // wait for Chainlink event
          console.log("Need to wait for Chainlink event to load minted nft!");
        }

      });

    // Add event listener for RequestConfirmMintingFulfilled
    projectContract.value.events.RequestConfirmMintingFulfilled()
      .on('data', async (event: any) => {
        console.log("New token event from Chainlink", event);
        
        const tokenId = event.returnValues[0];
        const success = event.returnValues[1];

        console.log("Mint successful for token ", tokenId);

        const nft = await request(`/api/v1/nfts/${tokenId}`, 'GET');

        // Add to store minted project from server
        if (!myNfts.value.map(nft => nft.tokenId).includes(tokenId)) {
          myNfts.value.push(nft.nft);
        }
      });

    // Send transaction
    await masterContract.value.methods
      .mintToken(
        String(preMintedProject.nft.price),
        String(preMintedProject.nft.royaltyPrice),
        preMintedProject.nft.hash,
        preMintedProject.nft.projectJSON.components,
        parseInt(preMintedProject.nft.signature[0].toString()),
        preMintedProject.nft.signature[1].toString(),
        preMintedProject.nft.signature[2].toString()
        )
      .send({ from: accountStore.getAccount, value: web3.utils.toWei('0.00059', 'ether') });
  }

  async function getBuyPrice(tokenId: number): Promise<BuyPrice> {
    const accountStore = useAccountStore();
    const res = await request(`/api/v1/nfts/${tokenId}/buyPrice/${accountStore.getAccount}`, 'GET');
    return res;
  }

  async function buyProject(nft: NFT, buyPrice: number) {
    const accountStore = useAccountStore();

    // Requires contract and user addresses
    if (!contractAddress.value || !accountStore.getAccount) {
      throw new Error('Need to have account and master contract addresses');
    }

    masterContract.value.events.NewBuyer()
      .on('data', async (event: any) => {
        // TODO maybe check if event is for my address?
        const address = event.returnValues[0];
        const tokenId = event.returnValues[1];

        console.log('Project bought');

        const nft = await request(`/api/v1/nfts/${tokenId}`, 'GET');

        boughtNfts.value.push(nft.nft);
        
      });

    console.log(`${accountStore.getAccount} is buying token ${nft.tokenId} for ${buyPrice}ETH`);

    // Get web3 instance from browser: connect to MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(window.ethereum);

    await masterContract.value.methods
      .buyToken(nft.tokenId!)
      .send({ 
        from: accountStore.getAccount, 
        to: contractAddress.value, 
        value: buyPrice
      });
  }

  function convertFromEth(ethPrice: number) {
    const web3 = new Web3(window.ethereum);
    return web3.utils.toWei(String(ethPrice), 'ether');
  }

  function convertToEth(weiPrice: number) {
    const web3 = new Web3(window.ethereum);
    return web3.utils.fromWei(String(weiPrice), 'ether');
  }

  async function request(url: string, method: "GET" | "POST" | "PUT" | "PATCH", data?: any) {
    const headers = new Headers();
    headers.append("authorization", localStorage.getItem("token")!);
    headers.append("Content-Type", "application/json");

    const res = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    } else {
      const error = await res.json() as ApiError
      throw new Error(error.message);
    }
  }

  return { 
    myNfts, 
    boughtNfts, 
    catalogNfts, 
    setUp,
    convertFromEth,
    convertToEth,
    getMyNfts, 
    getBoughtNfts, 
    getCatalogNfts, 
    mintNewProject, 
    getBuyPrice, 
    buyProject 
  }
});
