import { createReducer } from "../lib/utils"




// <Account> component state
const initState = {
    firstName: "",
    lastName: "",
    email: "",
    paymentAddress: "",
    discoverable: true,
    currency: "eur",
    exists: false,
}




// ...
export const SET_ACCOUNT_STATE = "SET_ACCOUNT_STATE"




// ...
export const action = {

    // ...
    setState: (state) => ({
        type: SET_ACCOUNT_STATE,
        payload: state,
    }),

}




// ...
export const reducer = createReducer(initState)({

    [SET_ACCOUNT_STATE]: (state, action) => ({
        ...state,
        ...action.payload,
    }),

})
