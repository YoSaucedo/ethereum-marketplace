import * as types from './actionTypes';

const initialState = {
    loggedIn: false,
    web3: undefined,
    address: undefined,
    role: -1
};

export var RoleEnum = Object.freeze({ "admin":0, "storeowner":1, "shopper":2 });

export default function reduce(state = initialState, action = {}) {
    switch(action.type) {
        case types.WEB3_FETCHED:
            return {...state, loggedIn: true, web3: action.web3};
        case types.ROLE_FETCHED:
            return {...state, role: action.role, address: action.address};
        case types.LOGGED_IN:
            return {...state, loggedIn: action.loggedIn};
        default:
            return state;
    }
}

// selectors
export function getWeb3(state) {
    return state.login.web3;
}

export function getRole(state) {
    return state.login.role;
}

export function isLoggedIn(state) {
    return state.login.loggedIn;
}

export function getAddress(state) {
    return state.login.address;
}