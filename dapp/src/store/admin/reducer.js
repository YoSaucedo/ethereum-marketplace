import * as types from './actionTypes';

const initialState = {
    storeowners: [],
    isDataFetched: false
};

export default function reduce(state = initialState, action = {}) {
    switch(action.type) {
        case types.STOREOWNERS_FETCHED:
            return {...state, storeowners: action.storeowners, isDataFetched: true};
        case types.STOREOWNER_ADDED:
            return {...state, storeowners: [...state.storeowners, action.newstoreowner]};
        default:
            return state;
    }
}

// selectors
export function getStoreOwners(state) {
        if (state.admin.storeowners === undefined) {
            return [""];
        } else {
            return state.admin.storeowners; 
        } 
}

export function isDataFetched(state) {
    return state.admin.isDataFetched;
}
