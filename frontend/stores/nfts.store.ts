import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { NFT } from '@/model/nft';
import { useAccountStore } from './account.store';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import contractABI from '../../build/contracts/Master.json';

/**
 * Store to interact with backend
 */
export const useNFTsStore = defineStore('nfts', () => {
  const nfts = ref<NFT[]>([]);
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

  async function getAllProjects() {
    // Get all NFTs
    const res = await fetch('/api/nfts');
    const projects = await res.json() as NFT[];

    // Add to store projects that are not already in store
    nfts.value = nfts.value.concat(projects.filter(p => !nfts.value.includes(p)));
  }

  async function mintNewProject(nft: NFT) {
    const accountStore = useAccountStore();

    // Requires contract and user addresses
    if (!contractAddress.value || !accountStore.getAccount) {
      console.error('Need to have account and master contract addresses');
      return;
    }

    /*
    // TODO make this call to backend for hash
    // Post new project
    const res = await fetch('/api/nfts', {
      method: "POST",
      body: JSON.stringify(nft)
    });
    if (!res.ok) {
      console.error("Project is not verified from backend, could not obtain hash");
      return;
    }

    const project = await res.json();
    */

    const project = nft;
    project.hash = "test";
    project.components = [];

    // Mint new project NFT on blockchain
    await masterContract.value.methods
      .mintToken(nft.price, nft.royaltyPrice, nft.hash, nft.components)
      .send({ from: accountStore.getAccount });

    // TODO need to understand if blockchain call was successfull

    // Add new project to store
    nfts.value.push(project);
  }

  // TODO add computed for getting my NFTs

  return { nfts, setUp, getAllProjects, mintNewProject, }
});
