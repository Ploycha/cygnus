import { Component, } from "react"
import { ActionConstants } from "../../actions"
import { authenticate } from "./api"
import PropTypes from "prop-types"




// ...
export default class LoginManager extends Component {

    // ...
    static childContextTypes = {
        loginManager : PropTypes.object,
    }


    // ...
    getChildContext = () => ({ loginManager : this, })


    // ...
    attemptLogin = (email, password) => {
        const that = this
        return async function _attemptLogin () {
            that.props.changeLoginState({
                loginState: ActionConstants.LOGGING_IN,
                bip32Path: null,
                publicKey: null,
                userId: null,
                token: null,
            })
            const auth = await authenticate(email, password)

            // NOT AUTHENTICATED
            if (!auth.authenticated) {
                that.props.changeLoginState({
                    loginState: ActionConstants.LOGGING_IN,
                    bip32Path: null,
                    publicKey: null,
                    userId: null,
                    token: null,
                })
            } else {
                that.props.changeLoginState({
                    loginState: ActionConstants.LOGGED_IN,
                    bip32Path: auth.bip32Path,
                    publicKey: auth.pubkey,
                    userId: auth.user_id,
                    token: auth.token,
                })
            }
            return auth
        }()
    }

    // ...
    isAuthenticated = () => (
        this.props.appAuth.loginState === ActionConstants.LOGGED_IN &&
        this.props.appAuth.token
    ) ? true : false


    // ...
    isExploreOnly = () => (
        this.props.appAuth.loginState === ActionConstants.LOGGED_IN &&
        this.props.appAuth.publicKey && !this.props.appAuth.bip32Path
    ) ? true : false


    // ...
    render = () => this.props.children

}
