import _ from 'lodash';
import * as types from './actionTypes';

const initialState = {
    //STORES
    storeAddresses: [], //just the addresses
    stores: {},         //mapping address: {address: , name: , owner: }
    isDataFetched: false,
    selectedStore: null,
    //PRODCUTS
    productIds: [],
    products: {},       //mapping id: {id: ,name: ,description: ,price: ,quantity: }
    isProductsFetched: false,
    currentProductId: undefined,
    //FUNDS
    balance: 0
};


export default function reduce(state = initialState, action = {}) {
    switch(action.type) {
        case types.STOREINDEX_FETCHED:
            return {...state, storeAddresses: action.storeindex};
        case types.STORES_FETCHED:
            return {...state, stores: action.stores, isDataFetched: true};
        case types.STORE_ADDED:
            var newStore = {address: action.storeAddress, name: action.storeName, owner: action.storeOwner};
            var key = action.storeAddress;
            var store = {[key]:newStore};
            return {...state, 
                storeAddresses: [...state.storeAddresses, action.storeAddress],
                stores: [...state.stores, store]
            };
        case types.PRODUCTINDEX_FETCHED:
            return {...state, productIds: action.productindex};
        case types.PRODUCTS_FETCHED:
            return {...state, products: action.products, isProductsFetched: true};
        case types.PRODUCT_SELECTED:
            return {...state, currentProductId: action.id};
        case types.PRODUCT_ADDED: 
            var data = action.product; 
            var newProduct = {id: data.id, name: data.name, description: data.description, price: data.price, quantity: data.quantity};
            var prodKey = data.id;
            var product = {[prodKey]:newProduct};
            return {...state,
                productIds: [...state.productIds, data.id],
                products: [...state.products, product] 
            };
        case types.PRODUCT_UPDATED:
            //mapping id: {id: ,name: ,description: ,price: ,quantity: }
            let updatedProducts = state.products;
            updatedProducts[action.id].price = action.price;
            return {...state,
                products: updatedProducts
            };
        case types.PRODUCT_DELETED:
            var productId = action.id
            var newProductIds = state.productIds;
            var newProducts = state.products;
            var indexToBeDeleted = -1;
            for(var i = 0; i < newProductIds.length; i++) {
                if(JSON.stringify(productId) === JSON.stringify(newProductIds[i])) {
                    indexToBeDeleted = i;
                    break;
                }
            }
            if (indexToBeDeleted > -1) {
                newProductIds.splice(indexToBeDeleted, 1);
                delete newProducts[productId];
            }
            return {...state,
                productIds: newProductIds,
                products: newProducts,
                currentProductId: undefined
            };
        case types.BALANCE_FETCHED:
            return {...state,
                balance: action.balance
            }
        case types.FUNDS_WITHDRAWN:
            return {...state,
                balance: action.balance
            }
        case types.ORDER_CONFIRMED:
            //reduce Product quantity by one!
            let products = state.products;
            products[action.id].quantity--;
            return {...state,
                products: products
            }
        default:
            return state;
    }
}


// selectors
export function getStores(state) {
    return state.storeowner.stores; 
}

export function isDataFetched(state) {
    return state.storeowner.isDataFetched;
}

export function getStoreAddresses(state) {
    return state.storeowner.storeAddresses;
}

export function getSelectedStoreByAddress(state) {
    return state.storeowner.selectedStore;
}

export function getProductIds(state) {
    return state.storeowner.productIds;
}

export function getProducts(state) {
    return state.storeowner.products;
}

export function isProductsFetched(state) {
    return state.storeowner.isProductsFetched;
}

export function getCurrentProduct(state) {
    var product = _.get(state.storeowner.products, state.storeowner.currentProductId);
    return product;
}

export function getBalance(state) {
    return state.storeowner.balance;
}
