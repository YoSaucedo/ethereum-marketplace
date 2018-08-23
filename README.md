# Online Marketplace

This is my final project for the Consensys Developer Program 2018. 
I chose the first suggested project and implemented an Online Marketplace.

### Description: 
Create an online marketplace that operates on the blockchain.
There are a list of stores on a central marketplace where shoppers can purchase goods posted by the store owners.
The central marketplace is managed by a group of administrators. Admins allow store owners to add stores to the marketplace. Store owners can manage their store’s inventory and funds. Shoppers can visit stores and purchase goods that are in stock using cryptocurrency. 
 
#### User Stories:
An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only functions, such as managing store owners. An admin adds an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.
 
An approved store owner logs into the app. The web app recognizes their address and identifies them as a store owner. They are shown the store owner functions. They can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. They can add/remove products to the storefront or change any of the products’ prices. They can also withdraw any funds that the store has collected from sales.
 
A shopper logs into the app. The web app does not recognize their address so they are shown the generic shopper application. From the main page they can browse all of the storefronts that have been created in the marketplace. Clicking on a storefront will take them to a product page. They can see a list of products offered by the store, including their price and quantity. Shoppers can purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.

### Installation
This project requires:
- [npm](https://www.npmjs.com/get-npm) as package manager
- [truffle](https://www.npmjs.com/package/truffle) as Ethereum environment
- [ganache-cli](https://www.npmjs.com/package/ganache-cli) as test blockchain
- [MetaMask](https://metamask.io/) to interact with the test blockchain

**Start a local test blockchain and import the first three accounts into your MetaMask:**
```sh
$ ganache-cli
```
- Open the MetaMask-Extension in your Browser.
- Import the first account via the twelve word seed phrase and choose a password.
- Choose Localhost 8545 as network.
- Import the second and third account via their private keys.

**Compile and migrate the contracts to the test blockchain**
Open a console and go to the project directory, then use the following commands:
```sh
$ truffle compile
$ truffle migrate
```
**Install the app dependencies and start the server**
```sh
$ npm install
$ npm start
```

### Usage
**Login with Account 1 (Admin)**
- The first account in MetaMask is the owner of the Marketplace-contract and is registered as admin on deployment.
- Choose this account in MetaMask and click the Login-button.
- Add the address of the second account as storeowner, click the button and confirm the transaction with MetaMask.

*(If you want to test the application with multiple storeowners, add more addresses here and import them via their private keys in MetaMask.)*

**Login with Account 2 (Storeowner)**
- Choose the second account in MetaMask and log in.
- The storeowner sees an overview over his shops and can add new stores.
- Create a shop and click on the link for this shop.
- A store specific site opens. On the left side an overview over all products in the shop is shown. On the right side are a detail view for a selected product, a form to add new products and the store balance with withdraw-option.
- Add a few products.
- Select a product and change its price or delete the product.
- To sell products the store needs a balance, because the purchase contract is based on [Safe Remote Purchase](https://solidity.readthedocs.io/en/v0.4.24/solidity-by-example.html#safe-remote-purchase), where both participants have a stake in the sale to ensure their correct behaviour. So send some Ether to the shop, you can find the shop's Ethereum-address in the URL.

**Login with Account 3 (Shopper)**
- Any account that is not registered as admin or storeowner will provide the default view for shoppers.
- Choose the third account in MetaMask and log in.
- The shopper sees all registered shops from all storeowners.
- Click on a store-link.
- A store specific site opens. On the left side an overview over all products is shown. On the right side the details of a selected product are shown and the shopper can buy this item.

### Test the smart contracts
```sh
$ truffle test
```
**Test Coverage**
I tested all functions of all contracts for their functionality, because I changed the contracts multiple times during the development and had to check again and again if everything still was working.

### Used Libraries
The contracts use multiple libraries from [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity):
| Contract Name | Description  |
| ------ | ------ |
| [RBAC](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/access/rbac/RBAC.sol) and [Roles](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/access/rbac/Roles.sol) | RBAC is used to manage the roles: admin, storeowner and shopper.
| [Ownable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ownership/Ownable.sol) | Ownable is used to make a contract ownable and mark some functions as callable only by the owner. |
| [Pausable](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/lifecycle/Pausable.sol) and [Destructible](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/lifecycle/Destructible.sol) | Pausable and Destructable are used to implement emergency stops and contract self destruction for the marketplace and store-contracts. The purchase-contract can be aborted by the storeowner until the contract is locked. |