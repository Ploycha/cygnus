// <Payments> component state
const initState = {

    paymentDetails: {
        txid: null,
        created_at: null,
        memo: "",
        effects: [],
        selectedPaymentId: null,
    },

    cursorLeft: null,
    cursorRight: null,
    prevDisabled: false,
    nextDisabled: false,

    txCursorLeft: null,
    txCursorRight: null,
    txNextDisabled: false,
    txPrevDisabled: false,

    sbPayment: false,
    sbPaymentAmount: null,
    sbPaymentAssetCode: null,
    sbNoMorePayments: false,
    sbNoMoreTransactions: false,

    tabSelected: "1",

}




// ...
export const SET_PAYMENTS_STATE = "SET_PAYMENTS_STATE"




// ...
export const action = {

    // ...
    setState: (state) => ({
        type: SET_PAYMENTS_STATE,
        payload: state,
    }),

}




// ...
export const reducer = (state = initState, action) => {
    switch (action.type) {

        case SET_PAYMENTS_STATE:
            state = {
                ...state,
                ...action.payload,
            }
            break

        default:
            break

    }

    return state
}
