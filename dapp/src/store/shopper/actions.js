import * as types from './actionTypes';
import * as storeownerTypes from '../storeowner/actionTypes';
import * as loginTypes from '../login/actionTypes';
import * as loginSelectors from '../login/reducer';
import StoreContract from '../../../build/contracts/Store.json';
import PurchaseContract from '../../../build/contracts/Purchase.json';

const contract = require('truffle-contract');

export function buyProduct(address, id, price) {
    return (dispatch, getState) => {
        var web3 = loginSelectors.getWeb3(getState());
        // Double-check web3's status.
        if (typeof web3 !== 'undefined') {
            const store = contract(StoreContract);
            const order = contract(PurchaseContract);
            store.setProvider(web3.currentProvider);
            order.setProvider(web3.currentProvider);
            var instance = store.at(address);
            web3.eth.getCoinbase((error, coinbase) => {
                if (error) {
                    console.error(error);
                }
                instance.orderProduct(id, {from: coinbase}).then(function(result) {
                    let logs = result.logs;
                    let event = logs[0].event;
                    if (event === "ProductOrdered") {
                        let orderData = logs[0].args;
                        let orderId = orderData.purchaseContract;
                        dispatch({ type: types.PRODUCT_ORDERED, orderId});
                        var orderInstance = order.at(orderId);
                        orderInstance.confirmPurchase({from: coinbase, value: (price * 2)}).then(function(txReceipt) {
                            dispatch({ type: storeownerTypes.ORDER_CONFIRMED, id});
                        });
                    } else {
                        console.log("An error occured while trying to buy a product.");
                    }
                });
            });
        } else {
            console.error('Buy Product: Web3 is not initialized.');
            dispatch({ type: loginTypes.LOGGED_IN, loggedIn: false });
        }
    } 
}