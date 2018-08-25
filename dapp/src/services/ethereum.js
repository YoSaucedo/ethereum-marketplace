import Web3 from 'web3'

class EthereumService {

    async getWeb3() {
        var web3 = window.web3;
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            // Use Mist/MetaMask's provider.
            web3 = new Web3(web3.currentProvider);
        } else {
            // Fallback to localhost if no web3 injection. We've configured this to
            // use the development console's port by default.
            var provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
            web3 = new Web3(provider);
        }
        return web3;
    }

}

export default new EthereumService();
