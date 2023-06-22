import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import Web3 from 'web3';

/**
 * Store for information about user account with Metamask
 */
export const useAccountStore = defineStore('account', () => {
  const account = ref<string | null>(null);

  async function setUp() {
    // Get web3 instance from browser: connect to MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(window.ethereum);   

    // Get account
    const accounts = await web3.eth.getAccounts();
    account.value = accounts[0];
  }

  const getAccount = computed<string | null>(() => {
    return account.value;
  })

  return { setUp, getAccount }
});
