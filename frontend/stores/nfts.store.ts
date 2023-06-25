import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { NFT } from '@/model/nft';
import { useAccountStore } from './account.store';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import contractABI from '../../build/contracts/Master.json';

interface ApiError {
  status: number,
  message: string,
}

interface NewTokenEvent {
  tokenId: number,
  owner: string,
}

/**
 * Store to interact with backend
 */
export const useNFTsStore = defineStore('nfts', () => {
  const catalogNfts = ref<NFT[]>([]);
  const myNfts = ref<NFT[]>([]);
  const boughtNfts = ref<NFT[]>([]);
  const contractAddress = ref<string | null>(null);
  const masterContract = ref<any | null>(null);

  async function setUp() {
    // Get contract address: read last network deployment
    const lastDeploy = Object.keys(contractABI.networks).pop();
    if (lastDeploy) {
      contractAddress.value = (contractABI.networks as any)[lastDeploy].address;
    }

    if (contractAddress.value) {
      try {
        // Get web3 instance from browser: connect to MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);

        // Setup contract
        masterContract.value = new web3.eth.Contract(contractABI.abi as AbiItem[], contractAddress.value);
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
      const projects = await request('/api/v1/nfts/catalog', 'GET') as NFT[];
      catalogNfts.value = projects;
    }
  }

  async function getMyNfts() {
    if (myNfts.value.length == 0) {
      // Get my nfts
      const accountStore = useAccountStore();
      const projects = await request(`/api/v1/owners/${accountStore.getAccount}/nfts`, 'GET') as NFT[];
      myNfts.value = projects;
    }
  }

  async function getBoughtNfts() {
    if (myNfts.value.length == 0) {
      // Get my nfts
      const accountStore = useAccountStore();
      const projects = await request(`/api/v1/buyers/${accountStore.getAccount}/nfts`, 'GET') as NFT[];
      boughtNfts.value = projects;
    }
  }

  async function mintNewProject(nft: NFT) {
    const accountStore = useAccountStore();

    // Requires contract and user addresses
    if (!contractAddress.value || !accountStore.getAccount) {
      throw new Error('Need to have account and master contract addresses');
    }

    // Pre-mint: post new project to backend for preliminary checks and hash
    const preMintedProject = await request('/api/v1/nfts', 'POST', nft);

    console.log('Pre-mint successfull');

    // Mint new project NFT on blockchain

    // Listen for new tokenId event
    masterContract.value.events.NewToken()
      .on('data', async (event: any) => {
        const address = event.returnValues[0];
        const tokenId = event.returnValues[1];

        console.log(`Mint successfull with token id ${tokenId}`);

        // Add to store minted project from server
        const res = await fetch(`/api/v1/nfts/${tokenId}`);
        const mintedProject = await res.json() as NFT;
        myNfts.value.push(mintedProject);
      });

    // Then send real transaction
    await masterContract.value.methods
      .mintToken(
        preMintedProject.nft.price,
        preMintedProject.nft.royaltyPrice,
        preMintedProject.nft.hash,
        preMintedProject.nft.components ? preMintedProject.nft.components : [],
      )
      .send({ from: accountStore.getAccount });
  }

  async function buyProject(nft: NFT) {
    const accountStore = useAccountStore();

    // Requires contract and user addresses
    if (!contractAddress.value || !accountStore.getAccount) {
      throw new Error('Need to have account and master contract addresses');
    }

    // TODO complete
  }

  async function request(url: string, method: "GET" | "POST", data?: any) {
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

  return { myNfts, boughtNfts, catalogNfts, setUp, getMyNfts, getBoughtNfts, getCatalogNfts, mintNewProject, }
});
