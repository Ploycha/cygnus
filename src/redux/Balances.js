import { createReducer } from "../lib/utils"




// <Balances> component state
const initState = ((now) => ({

    today: now,
    payDate: now,
    amount: "",
    amountNative: "",
    amountText: "",
    amountIsValid: false,
    payee: null,
    payeeAddress: "",
    newAccount: false,
    memoRequired: false,
    memoText: "",
    minimumReserveMessage: "",
    sendEnabled: false,
    indicatorMessage: "XXXXXXXXXXXX",
    indicatorStyle: "fade-extreme",
    transactionType: null,
    paymentId: null,
    ledgerId: null,
    error: "",

}))(new Date())




// ...
export const SET_STATE = "@Balances/SET_STATE"




// ...
export const action = {

    // ...
    setState: (state) => ({
        type: SET_STATE,
        payload: state,
    }),

}




// ...
export const reducer = createReducer(initState)({

    // ...
    [SET_STATE]: (state, action) => ({
        ...state,
        ...action.payload,
    }),

})
