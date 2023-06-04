import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import contractABI from '../../build/contracts/Counter.json';

export const useCounterContract = defineStore('counter-contract', () => {
    // Address of user's wallet
    const account = ref<string | null>(null);

    const count = ref<number | null>(null);
    const contractAddress = ref<string | null>(null);
    const counterContract = ref<any | null>(null);

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
    
                // Get account
                const accounts = await web3.eth.getAccounts();
                account.value = accounts[0];
    
                // Setup contract
                counterContract.value = new web3.eth.Contract(contractABI.abi as AbiItem[], contractAddress.value);
                const result = await counterContract.value.methods.getCount().call({ from: account.value });
                count.value = result;
            } catch (err) {
                console.error("Error in setting up connection to blockchain", err);
            }
        } else {
            console.error("Was not able to obtain contract address");
        }
    }

    async function increment() {
        // Use send for methods that require to pay
        await counterContract.value.methods.incrementCounter().send({ from: account.value });
        
        // Use call for methods that do not require to pay
        const result = await counterContract.value.methods.getCount().call({ from: account.value });
        count.value = result;
    }

    async function decrement() {
        await counterContract.value.methods.decrementCounter().send({ from: account.value });
        const result = await counterContract.value.methods.getCount().call({ from: account.value });
        count.value = result;
    }

    async function reset() {
        await counterContract.value.methods.reset().send({ from: account.value });
        const result = await counterContract.value.methods.getCount().call({ from: account.value });
        count.value = result;
    }

    return { count, setUp, increment, decrement, reset }
})
