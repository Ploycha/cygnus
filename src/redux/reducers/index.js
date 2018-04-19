import {
    uiReducer,
} from "./mono-reducer"
import AccountInfoReducer from "./account-info-reducer"
import LoadingModalReducer from "./loading-modal-reducer"
import UiStateReducer from "./ui-state-reducer"

import { reducer as AccountReducer } from "../Account"
import { reducer as AssetManagerReducer } from "../AssetManager"
import { reducer as BalancesReducer } from "../Balances"
import { reducer as BankReducer } from "../Bank"
import { reducer as LedgerHQReducer } from "../LedgerHQ"
import { reducer as LoginMangerReducer } from "../LoginManager"
import { reducer as PaymentsReducer } from "../Payments"
import { reducer as StellarAccountReducer } from "../StellarAccount"
import { reducer as RouterReducer } from "../StellarRouter"




// ...
export default {
    accountInfo: AccountInfoReducer,
    loadingModal: LoadingModalReducer,
    ui: UiStateReducer,
    appUi: uiReducer,

    Account: AccountReducer,
    Assets: AssetManagerReducer,
    Balances: BalancesReducer,
    Bank: BankReducer,
    LedgerHQ: LedgerHQReducer,
    LoginManager: LoginMangerReducer,
    Payments: PaymentsReducer,
    Router: RouterReducer,
    StellarAccount: StellarAccountReducer,
}
