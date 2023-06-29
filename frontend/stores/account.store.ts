import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import Web3 from 'web3';
import Web3Token from 'web3-token';

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

    let token = localStorage.getItem('token');
    if (token) {
      const { address, body } = await Web3Token.verify(token?.split(' ')[1]);
      if (address !== account.value) {
        console.log('Address does not match web3 token');

        // generating a token with 30 day of expiration time
        let token = await Web3Token.sign(msg => web3.eth.personal.sign(msg, account.value), '30d');
        localStorage.setItem('token', 'Bearer ' + token);
        console.log("Bearer " + token);
      }
    } else {
      console.log('No web3 token');

      // generating a token with 1 day of expiration time
      let token = await Web3Token.sign(msg => web3.eth.personal.sign(msg, account.value), '1d');
      localStorage.setItem('token', 'Bearer ' + token);
      console.log("Bearer " + token);
    }
  }

  const getAccount = computed<string | null>(() => {
    return account.value;
  })

  return { setUp, getAccount }
});
