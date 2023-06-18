import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { NFT } from '@/model/nft';
import { useAccountStore } from './account.store';

const accountStore = useAccountStore();

/**
 * Store to interact with backend
 */
export const useNFTsStore = defineStore('nfts', () => {
  const nfts = ref<NFT[]>([]);

  async function getAllProjects() {
    // Get all NFTs
    const res = await fetch('/api/nfts');
    const projects = await res.json() as NFT[];

    // Add to store projects that are not already in store
    nfts.value = nfts.value.concat(projects.filter(p => !nfts.value.includes(p)));
  }

  async function uploadProject(nft: NFT) {
    // Post new project
    const res = await fetch('/api/nfts', {
        method: "POST",
        body: JSON.stringify(nft)
    });
    const project = await res.json();

    // Add new project to store
    nfts.value.push(project);
  }

  // TODO add computed for getting my NFTs

  return { nfts, getAllProjects, uploadProject, }
});
