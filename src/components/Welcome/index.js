import React, { Component } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import axios from "axios"

import { config } from "../../config"
import {
    pubKeyValid,
    federationAddressValid,
    federationLookup,
    StellarSdk,
} from "../../lib/utils"
import {
    appName,
    bip32Prefix,
} from "../../env"

import { withLoginManager } from "../LoginManager"
import { ActionConstants } from "../../actions"
import {
    accountExistsOnLedger,
    accountMissingOnLedger,
    setModalLoading,
    setModalLoaded,
    updateLoadingMessage,
    logIn,
    setHorizonEndPoint,
    setAccountRegistered,
    setAccountPath,
    setLedgerSoftwareVersion,
    setPublicKey,
    changeLoginState,
} from "../../actions/index"
import {
    setToken,
    clearToken,
} from "../../actions/auth"

import InputField from "../../frontend/InputField"
import PanelLedger from "./Panel-Ledger"
import RaisedButton from "material-ui/RaisedButton"
import Login from "../../containers/Login"
import HeadingContainer from "./HeadingContainer"
import Footer from "../Layout/Footer"
import Panel from "../Panel"

import "./index.css"




// ...
const styles = {
    errorStyle: {
        color: "#912d35",
    },
    underlineStyle: {
        borderColor: "#FFC107",
    },
    floatingLabelStyle: {
        color: "rgba(212,228,188,0.4)",
    },
    floatingLabelFocusStyle: {
        color: "rgba(212,228,188,0.2)",
    },
    inputStyle: {
        color: "rgb(244,176,4)",
    },
}




// <Welcome> component
class Welcome extends Component {

    // ...
    state = {
        modalShown: false,
        modalButtonText: "CANCEL",
    }


    // ...
    componentDidMount = () => {
        // Horizon end point is set to testnet by default.
        this.props.setHorizonEndPoint(config.horizon)
    }


    // ...
    logInViaPublicKey = (pubKey) => {
        if (this.context.loginManager.isAuthenticated()) {
            this.props.setAccountPath(`${bip32Prefix}${this.props.appAuth.bip32Path}'`)
            axios
                .get(`${config.api}/account/${this.props.appAuth.userId}`)
                .then((response) => {
                    this.props.setAccountPath(`${bip32Prefix}${response.data.data.bip32Path}'`)
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.log(error.message)
                })
        }

        try {
            this.props.setPublicKey(pubKey)
            // 1. show loading modal
            this.props.setModalLoading()

            // 2. load account info
            let server = new StellarSdk.Server(
                this.props.accountInfo.horizon
            )
            this.props.updateLoadingMessage({
                message: "Searching for Account ...",
            })
            server
                .loadAccount(pubKey)
                .catch(StellarSdk.NotFoundError, () => {
                    throw new Error("The destination account does not exist!")
                })
                .then((account) => {
                    this.props.accountExistsOnLedger({ account, })
                    this.props.setModalLoaded()
                    this.props.updateLoadingMessage({
                        message: null,
                    })
                })
                .catch(() => {
                    this.props.accountMissingOnLedger()
                    this.props.setModalLoaded()
                    this.props.updateLoadingMessage({
                        message: null,
                    })
                })
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error)
        }
    }


    // ...
    handleSignup = () =>
        this.setState({
            modalButtonText: "CANCEL",
            modalShown: true,
        })


    // ...
    setModalButtonText = (text) =>
        this.setState({
            modalButtonText: text,
        })


    // ...
    enterExplorer = () => {
        const textInputValue = this.textInputFieldFederationAddress.state.value

        this.props.setModalLoading()

        /**
         * textInputValue is either VALID federation or VALID pubkey
         * check for '*' character - if present then it is federation address
         * otherwise a public key
         */
        if (textInputValue.match(/\*/)) {
            this.props.updateLoadingMessage({
                message: "Looking up federation endpoint ...",
            })
            federationLookup(textInputValue)
                .then((federationEndpointObj) => {
                    if (federationEndpointObj.ok) {
                        axios
                            .get(`${
                                federationEndpointObj.endpoint
                            }?q=${
                                textInputValue
                            }&type=name`)
                            .then((response) => {
                                this.props.changeLoginState({
                                    loginState: ActionConstants.LOGGED_IN,
                                    bip32Path: null,
                                    publicKey: response.data.account_id,
                                    userId: null,
                                    token: null,
                                })
                                this.logInViaPublicKey(response.data.account_id)
                            })
                            .catch((error) => {
                                this.props.setModalLoaded()
                                if (error.response.status === 404) {
                                    this.textInputFieldFederationAddress.setState({
                                        error: "Account not found.",
                                    })
                                    return false
                                }
                                if (error.response.data.detail) {
                                    this.textInputFieldFederationAddress.setState({
                                        error: error.response.data.detail,
                                    })
                                } else {
                                    this.textInputFieldFederationAddress.setState({
                                        error: error.response.data.message,
                                    })
                                }
                            })
                    }
                })
                .catch((error) => {
                    this.props.setModalLoaded()
                    this.textInputFieldFederationAddress.setState({
                        error: error.message,
                    })
                })
        } else {
            this.props.changeLoginState({
                loginState: ActionConstants.LOGGED_IN,
                bip32Path: null,
                publicKey: textInputValue,
                userId: null,
                token: null,
            })
            this.logInViaPublicKey(textInputValue)
        }

    }


    // ...
    federationValidator = () => {
        const address = this.textInputFieldFederationAddress.state.value

        // Looks like something totally invalid for this field.
        if (!address.match(/\*/) && !address.match(/^G/)) {
            return "invalid input"
        }
        // Looks like user is entering Federation Address format.
        if (address.match(/\*/) && !federationAddressValid(address)) {
            return "invalid federation address"
        }
        // This must be an attempt at a Stellar public key format.
        if (address.match(/^G/) && !address.match(/\*/)) {
            let publicKeyValidityObj = pubKeyValid(address)
            if (!publicKeyValidityObj.valid) {
                return publicKeyValidityObj.message
            }
        }
        return null
    }


    // ...
    compoundFederationValidator = () => {
        const addressValidity = this.federationValidator(
            this.textInputFieldFederationAddress.state.value
        )

        if (addressValidity === null) {
            return this.enterExplorer.call(this)
        } else {
            this.textInputFieldFederationAddress.setState({
                error: addressValidity,
            })
        }
    }


    // ...
    render = () =>
        <div className="welcome-content">
            <HeadingContainer />
            <div>
                <div className="flex-row-space-between">
                    <PanelLedger />

                    <Panel
                        className="welcome-panel-center"
                        title="Customize"
                        content={
                            <div>
                                <img
                                    style={{
                                        marginBottom: "4px",
                                    }}
                                    src="/img/sf.svg"
                                    width="140px"
                                    alt={appName}
                                />
                                <div className="title">
                                    Manage your account with ease.
                                </div>
                                <div className="title-small p-t">
                                    Once you have opened your
                                    account you can log in here
                                    to your banking terminal.
                                </div>
                                <div className="f-b">
                                    <Login/>
                                </div>
                            </div>
                        }
                    />

                    <Panel
                        className="welcome-panel-right"
                        title="Explore"
                        content={
                            <div>
                                <img
                                    src="/img/stellar.svg"
                                    width="120px"
                                    alt="Stellar"
                                />
                                <div className="title">
                                    To access global ledger
                                    explorer enter your{" "}
                                    <em>Payment Address</em> or{" "}
                                    <em>Account Number</em>.
                                </div>
                                <div className="title-small p-t p-b">
                                    Your account operations are
                                    publicly accessible on the
                                    global ledger. Anyone who
                                    knows your account number or
                                    payment address can view
                                    your public transactions.
                                </div>
                                <div className="title-small p-t p-b">
                                    <strong>
                                        Please note that this
                                        application will{" "}
                                        <u>never</u> ask you to
                                        enter your Secret key.
                                    </strong>
                                </div>
                                <div className="mui-text-input">
                                    <div>
                                        <InputField
                                            name="payment-address-input"
                                            type="text"
                                            placeholder="Payment Address"
                                            styles={styles}
                                            validator={this.federationValidator}
                                            action={this.compoundFederationValidator}
                                            ref={(self) => {
                                                this.textInputFieldFederationAddress = self
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <RaisedButton
                                            onClick={this.compoundFederationValidator}
                                            backgroundColor="rgb(244,176,4)"
                                            label="Check"
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
            <Footer />
        </div>

}


// ...
export default withLoginManager(connect(
    // map state to props.
    (state) => ({
        accountInfo: state.accountInfo,
        loadingModal: state.loadingModal,
        auth: state.auth,
        ui: state.ui,
        appAuth: state.appAuth,
    }),

    // map dispatch to props.
    (dispatch) => bindActionCreators({
        accountExistsOnLedger,
        accountMissingOnLedger,
        setModalLoading,
        setModalLoaded,
        updateLoadingMessage,
        logIn,
        setHorizonEndPoint,
        setAccountRegistered,
        setAccountPath,
        setLedgerSoftwareVersion,
        setPublicKey,
        setToken,
        clearToken,
        changeLoginState,
    }, dispatch)
)(Welcome))
