import * as types from './actionTypes';
import * as loginTypes from '../login/actionTypes';
import * as loginSelectors from '../login/reducer';
import MarketPlaceContract from '../../../build/contracts/MarketPlace.json'

const contract = require('truffle-contract');

export function fetchStoreOwners() {
    return (dispatch, getState) => {
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
                    marketPlaceInstance.getStoreOwners({from: coinbase}).then(function(result) {
                        dispatch({ type: types.STOREOWNERS_FETCHED, storeowners: result });
                    });
                });
            });
        } else {
            console.error('Fetch StoreOwners: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    }
}

export function addStoreOwner(address) {
    return (dispatch, getState) => {
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
                    marketPlaceInstance.addStoreOwner(address, {from: coinbase}).then(function(result) {
                        let logs = result.logs;
                        let event = logs[0].event;
                        let userData = logs[0].args;
                        if (event === "RoleAdded" && userData.roleName === "storeOwner") {
                            dispatch({ type: types.STOREOWNER_ADDED, newstoreowner: address});
                        } else {
                            console.log("An error occured while trying to add a new storeowner.");
                        }   
                    });
                });
            });
        } else {
            console.error('Add StoreOwner: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    } 
}