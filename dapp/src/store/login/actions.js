import * as types from './actionTypes';
import * as loginTypes from '../login/actionTypes';
import ethereumService from '../../services/ethereum';
import * as loginSelectors from './reducer';
import MarketPlaceContract from '../../../build/contracts/MarketPlace.json'

const contract = require('truffle-contract')

export function fetchWeb3() {
    return async(dispatch, getState) => {
        const web3Instance = await ethereumService.getWeb3();
        dispatch({ type: types.WEB3_FETCHED, web3: web3Instance});
    }
}

export function fetchRole() {
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
                    marketPlaceInstance.getRole({from: coinbase}).then(function(result) {
                        dispatch({ type: types.ROLE_FETCHED, role: result, address: coinbase});
                    });
                });
            });
        } else {
            console.error('Fetch Role: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    }
}