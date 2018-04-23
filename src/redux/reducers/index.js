import { reducer as AccountReducer } from "../Account"
import { reducer as AlertReducer } from "../Alert"
import { reducer as AssetManagerReducer } from "../AssetManager"
import { reducer as BalancesReducer } from "../Balances"
import { reducer as BankReducer } from "../Bank"
import { reducer as LedgerHQReducer } from "../LedgerHQ"
import { reducer as LoadingModalReducer } from "../LoadingModal"
import { reducer as LoginMangerReducer } from "../LoginManager"
import { reducer as ModalReducer } from "../Modal"
import { reducer as PaymentsReducer } from "../Payments"
import { reducer as StellarAccountReducer } from "../StellarAccount"
import { reducer as RouterReducer } from "../StellarRouter"
import { reducer as SnackbarReducer } from "../Snackbar"




// ...
export default {
    Account: AccountReducer,
    Alert: AlertReducer,
    Assets: AssetManagerReducer,
    Balances: BalancesReducer,
    Bank: BankReducer,
    LedgerHQ: LedgerHQReducer,
    LoadingModal: LoadingModalReducer,
    LoginManager: LoginMangerReducer,
    Modal: ModalReducer,
    Payments: PaymentsReducer,
    Router: RouterReducer,
    StellarAccount: StellarAccountReducer,
    Snackbar: SnackbarReducer,   
}
