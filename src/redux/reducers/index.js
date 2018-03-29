import {
    authReducer,
    navReducer,
    uiReducer,
} from "./mono-reducer"
import AuthenticationReducer from "./authentication-reducer"
import AccountInfoReducer from "./account-info-reducer"
import LoadingModalReducer from "./loading-modal-reducer"
import UiStateReducer from "./ui-state-reducer"
import ModalReducer from "./modal-reducer"

import { reducer as PaymentsReducer } from "../Payments"
import { reducer as AccountReducer } from "../Account"
import { reducer as AssetManagerReducer } from "../AssetManager"




// ...
export default {
    auth: AuthenticationReducer,
    accountInfo: AccountInfoReducer,
    loadingModal: LoadingModalReducer,
    ui: UiStateReducer,
    modal: ModalReducer,

    appAuth: authReducer,
    appNav: navReducer,
    appUi: uiReducer,

    Payments: PaymentsReducer,
    Account: AccountReducer,
    Assets: AssetManagerReducer,
}
