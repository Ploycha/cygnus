import {
    createReducer,
    string,
} from "@xcmats/js-toolbox"




// <Alert> component state
const initState = {

    visible: false,
    title: string.empty(),
    text: string.empty(),

}




// ...
export const ALERT_SHOW = "@Alert/SHOW"
export const ALERT_HIDE = "@Alert/HIDE"




// ...
export const action = {

    // show alert (see Modal component)
    showAlert: (text, title="Alert") => ({
        type: ALERT_SHOW,
        title,
        text,
    }),


    // hide alert (see Modal component)
    hideAlert: () => ({
        type: ALERT_HIDE,
    }),

}




// ...
export const reducer = createReducer(initState)({

    // ...
    [ALERT_SHOW]: (state, action) => ({
        ...state,
        visible: true,
        title: action.title,
        text: action.text,
    }),


    // ...
    [ALERT_HIDE]: (state) => ({
        ...state,
        visible: false,
        title: string.empty(),
        text: string.empty(),
    }),

})
