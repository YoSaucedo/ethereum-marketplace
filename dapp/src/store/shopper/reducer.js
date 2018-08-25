import * as types from './actionTypes';

const initialState = {
    orderId: undefined
};

export default function reduce(state = initialState, action = {}) {
    switch(action.type) {
    case types.PRODUCT_ORDERED:
        return {...state,
            orderId: action.orderId
        };
    default:
        return state;
    }
}

export function getOrderId(state) {
    return state.shopper.orderId;
}