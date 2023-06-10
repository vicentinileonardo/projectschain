import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import contractABI from '../../build/contracts/Master.json';

export const useMasterContract = defineStore('master-contract', () => {
    // Address of user's wallet
    const account = ref<string | null>(null);

    const tokenCounter = ref<number | null>(null);
    const contractAddress = ref<string | null>(null);
    const masterContract = ref<any | null>(null);

    async function setUp() {
        // Get contract address: read last network deployment
        /* const lastDeploy = Object.keys(contractABI.networks).pop();
        if (lastDeploy) {
            contractAddress.value = (contractABI.networks as any)[lastDeploy].address;
        } */

        contractAddress.value = "0x865E9DF4852370F99Bb6FC0355aBd2998e8aF0Af";

        if (contractAddress.value) {
            try {
                // Get web3 instance from browser: connect to MetaMask
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3 = new Web3(window.ethereum);   
    
                // Get account
                const accounts = await web3.eth.getAccounts();
                account.value = accounts[0];
    
                // Setup contract
                masterContract.value = new web3.eth.Contract(contractABI.abi as AbiItem[], contractAddress.value);
            } catch (err) {
                console.error("Error in setting up connection to blockchain", err);
            }
        } else {
            console.error("Was not able to obtain contract address");
        }
    }

    async function mintToken(uri: string) {
        // Use send for methods that require to pay
        await masterContract.value.methods.mintToken(uri,0).send({ from: account.value });
        
        // Use call for methods that do not require to pay
        const result = await masterContract.value.methods.getTokenCounter().call({from: account.value});
        tokenCounter.value = result;
    }

    return { tokenCounter, setUp, mintToken}
})
