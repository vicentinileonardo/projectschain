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

export interface Outcome {
  message: string,
  ok: boolean;
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

  async function mintNewProject(nft: NFT): Promise<Outcome> {
    const accountStore = useAccountStore();

    // Requires contract and user addresses
    if (!contractAddress.value || !accountStore.getAccount) {
      console.error('Need to have account and master contract addresses');
      return {
        message: "Cannot perform transaction, need account and contract addresses",
        ok: false
      };
    }

    // Pre-mint: post new project to backend for preliminary checks and hash
    const preMintedProject = await request('/api/v1/nfts', 'POST', nft);

    console.log(`price = ${preMintedProject.nft.price}`);
    console.log(`royalty price = ${preMintedProject.nft.royaltyPrice}`);
    console.log(`hash = ${preMintedProject.nft.hash}`);
    console.log(`components = ${preMintedProject.nft.components}`);

    // Mint new project NFT on blockchain
    try {
      const tokenId = await masterContract.value.methods
        .mintToken(
          preMintedProject.nft.price,
          preMintedProject.nft.royaltyPrice,
          preMintedProject.nft.hash,
          preMintedProject.nft.components ? preMintedProject.nft.components : [],
        )
        .send({ from: accountStore.getAccount });

      console.log(tokenId);

      /*
      .on('confirmation', (confirmationNumber: number, receipt: any) => {
        console.log(receipt);
        // Add new project to store
        nfts.value.push(project);
      })
      .on('error', (error: Error, receipt: any) => {
        throw error;
      });  
      */

      // Add to store minted project from server
      const res = await fetch(`/api/v1/nfts/${tokenId}`);
      const mintedProject = await res.json() as NFT;
      myNfts.value.push(mintedProject);

      return {
        message: `Transaction successfull, saved project as token ${tokenId}`,
        ok: true,
      }

    } catch (err) {
      console.error("Error during mint transaction", err);
      return {
        message: "Error during mint transaction",
        ok: false
      };
    }
  }

  async function buyProject(nft: NFT) {
    const accountStore = useAccountStore();

    // Requires contract and user addresses
    if (!contractAddress.value || !accountStore.getAccount) {
      console.error('Need to have account and master contract addresses');
      return;
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
