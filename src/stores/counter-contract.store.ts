import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import Web3 from 'web3';
import contractABI from '../../build/contracts/Counter.json';

// To change whenever contract is deployed...
const contractAddress = '0x3c2584567356F0e12A18BDA0F5DE794aa9277077';

export const useCounterContract = defineStore('counter-contract', () => {
    const count = ref<number | null>(null);
    const account = ref<string | null>(null);
    const counterContract = ref<any | null>(null);

    async function setUp() {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        account.value = accounts[0];
        counterContract.value = new web3.eth.Contract(contractABI.abi, contractAddress);
        const result = await counterContract.value.methods.getCount().call({ from: account.value });
        count.value = result;
    }

    async function increment() {
        await counterContract.value.methods.incrementCounter().send({ from: account.value });
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
