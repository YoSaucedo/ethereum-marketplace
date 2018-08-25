import * as types from './actionTypes';
import * as loginTypes from '../login/actionTypes';
import * as loginSelectors from '../login/reducer';
import MarketPlaceContract from '../../../build/contracts/MarketPlace.json';
import StoreContract from '../../../build/contracts/Store.json';

const contract = require('truffle-contract');

export function fetchStores(storeIndex) {
    return async(dispatch, getState) => {
        const web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const marketPlace = contract(MarketPlaceContract)
            marketPlace.setProvider(web3.currentProvider)
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                marketPlace.deployed().then(async function(instance) {
                    let results = {};
                    var marketPlaceInstance = instance;

                    for(var i=0; i<storeIndex.length; i++) {
                        var storeData = await marketPlaceInstance.getStore(storeIndex[i], {from: coinbase});

                        //convert store-name to utf8
                        var version = web3.version.api;
                        var mainVersion = version.split(".")[0];
                        var storeName;
                        if (mainVersion < 1) {
                            storeName = web3.toUtf8(storeData[1]);
                        } else {
                            storeName =  web3.utils.hexToUtf8(storeData[1]);
                        }

                        //save new store in results
                        var newStore = {"address": storeData[0], "name": storeName, "owner": storeData[2]};
                        var key = storeData[0];
                        results[key] = newStore;
                                
                        // Check if we got the last store, then dispatch the action!
                        if (i === (storeIndex.length-1) ) {
                            dispatch({ type: types.STORES_FETCHED, stores: results});
                        }
                    }
                });
            });
        } else {
            console.error('Fetch Stores: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    }
}

export function fetchMyStoreIndex() {
    return async(dispatch, getState) => {
        const web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const marketPlace = contract(MarketPlaceContract)
            marketPlace.setProvider(web3.currentProvider)
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                marketPlace.deployed().then(function(instance) {
                    var marketPlaceInstance = instance;
                    marketPlaceInstance.getRole({from: coinbase}).then(function(result) {
                        // if the logged in user is a shopper => fetch all stores
                        if (parseInt(result, 10) === loginSelectors.RoleEnum.shopper) {
                            marketPlaceInstance.getStoreIndex({from: coinbase}).then(function(result) {
                                dispatch({ type: types.STOREINDEX_FETCHED, storeindex: result});
                            });
                        // if the logged in user is a storeowner => fetch only his own stores
                        } else if (parseInt(result, 10) === loginSelectors.RoleEnum.storeowner) {
                            marketPlaceInstance.getStoresOf(coinbase, {from: coinbase}).then(function(result) {
                                dispatch({ type: types.STOREINDEX_FETCHED, storeindex: result});
                            });
                        }   
                    });      
                });
            });
        } else {
            console.error('Fetch StoreIndex: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    } 
}

export function createStore(name) {
    return (dispatch, getState) => {
        var web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const marketPlace = contract(MarketPlaceContract)
            marketPlace.setProvider(web3.currentProvider)
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                marketPlace.deployed().then(function(instance) {
                    var marketPlaceInstance = instance;

                    var version = web3.version.api;
                    var bytes32name;
                    var mainVersion = version.split(".")[0];
                    if (mainVersion < 1) {
                        bytes32name = web3.fromAscii(name);
                    } else {
                        bytes32name = web3.utils.fromAscii(name);
                    }

                    marketPlaceInstance.createStore(bytes32name, {from: coinbase}).then(function(result) { 
                        let logs = result.logs;
                        let storeData = logs[1].args;

                        var storeName;
                        if (mainVersion < 1) {
                            storeName = web3.toUtf8(storeData.name);
                        } else {
                            storeName =  web3.utils.hexToUtf8(storeData.name);
                        }

                        dispatch({ type: types.STORE_ADDED, storeAddress: storeData.store, storeName: storeName, storiner: storeData.from});
                    });
                });
            });
        } else {
            console.error('Create Store: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    } 
}

export function addProduct(address, product) {
    return (dispatch, getState) => {
        var web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const store = contract(StoreContract);
            store.setProvider(web3.currentProvider);
            var instance = store.at(address);
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                instance.addProduct(product.name, product.description, product.price, product.quantity, {from: coinbase}).then(function(result) {
                    let logs = result.logs;
                    let event = logs[0].event;
                    if (event === "ProductAdded") {
                        let productData = logs[0].args;
                        product.id = productData.productId;
                        dispatch({ type: types.PRODUCT_ADDED, product});
                    } else {
                        console.log("An error occured while trying to add the new product.");
                    }
                });
            });
        } else {
            console.error('Add Product: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    } 
}

export function fetchProductIndex(address) {
    return async(dispatch, getState) => {
        const web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const store = contract(StoreContract);
            store.setProvider(web3.currentProvider);
            var instance = store.at(address);
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                instance.getProductIds({from: coinbase}).then(function(result) {
                    dispatch({ type: types.PRODUCTINDEX_FETCHED, productindex: result});
                });
            });
        } else {
            console.error('Fetch ProductIndex: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    } 
}

export function fetchProducts(address, productIndex) {
    return async(dispatch, getState) => {
        const web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const store = contract(StoreContract);
            store.setProvider(web3.currentProvider);
            var instance = store.at(address);
            let results = {};
            for(var i=0; i<productIndex.length; i++) {
                var productData = await instance.getProduct(productIndex[i]);

                //convert product-name to utf8
                var version = web3.version.api;
                var mainVersion = version.split(".")[0];
                var productName;
                var productDesc;
                if (mainVersion < 1) {
                    productName = web3.toUtf8(productData[1]);
                    productDesc = web3.toUtf8(productData[2]);
                } else {
                    productName = web3.utils.hexToUtf8(productData[1]);
                    productDesc = web3.utils.hexToUtf8(productData[2]);
                }

                //save new product in results
                var newProduct = {"id": productData[0], "name": productName, "description": productDesc, "price": productData[3], "quantity": productData[4]};
                var key = productData[0];
                results[key] = newProduct;
      
                // Check if we got the last product, then dispatch the action!
                if (i === (productIndex.length-1) ) {
                    dispatch({ type: types.PRODUCTS_FETCHED, products: results});
                }
            }
        } else {
            console.error('Fetch Products: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    }
}

export function selectProduct(id) {
    return({ type: types.PRODUCT_SELECTED, id });
}

export function updateProduct(address, id, _price) {
    return async(dispatch, getState) => {
        const web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const store = contract(StoreContract);
            store.setProvider(web3.currentProvider);
            var instance = store.at(address);
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                instance.updateProduct(id, _price, {from: coinbase}).then(function(result) {
                    let logs = result.logs;
                    let event = logs[0].event;
                    if (event === "ProductUpdated") {
                        let productData = logs[0].args;
                        let price = productData.price;
                        dispatch({ type: types.PRODUCT_UPDATED, id, price });
                    } else {
                        console.log("An error occured while trying to update a product.");
                    }
                });
            });
        } else {
            console.error('Update Product: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    }
}

export function deleteProduct(address, id) {
    return async(dispatch, getState) => {
        const web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const store = contract(StoreContract);
            store.setProvider(web3.currentProvider);
            var instance = store.at(address);
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                instance.deleteProduct(id, {from: coinbase}).then(function(result) {
                    let logs = result.logs;
                    let event = logs[0].event;
                    if (event === "ProductDeleted") {
                        dispatch({ type: types.PRODUCT_DELETED, id });
                    } else {
                        console.log("An error occured while trying to delete a product.");
                    }
                });
            });
        } else {
            console.error('Delete Product: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    }
    
}

export function fetchBalance(address) {
    return async(dispatch, getState) => {
        const web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const store = contract(StoreContract);
            store.setProvider(web3.currentProvider);
            web3.eth.getBalance(address, function(error, balance) {
                dispatch({ type: types.BALANCE_FETCHED, balance});
            });
        } else {
            console.error('Fetch Balance: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    }
}

export function withdrawFunds(address, amount) {
    return (dispatch, getState) => {
        var web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const store = contract(StoreContract);
            store.setProvider(web3.currentProvider);
            var instance = store.at(address);
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                instance.withdraw(amount, {from: coinbase}).then(function(result) {
                    let logs = result.logs;
                    let event = logs[0].event;
                    if (event === "FundsWithdrew") {
                        let withdrawalData = logs[0].args;
                        let balance = withdrawalData.newBalance;
                        dispatch({ type: types.FUNDS_WITHDRAWN, balance});
                    } else {
                        console.log("An error occured while trying to withdraw funds.");
                    }
                });
            });
        } else {
            console.error('Withdraw Funds: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    } 
}