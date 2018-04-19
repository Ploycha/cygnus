import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import {
    bindActionCreators,
    compose,
} from "redux"
import { connect } from "react-redux"
import {
    Redirect,
    Route,
} from "react-router-dom"
import axios from "axios"
import "number-to-text/converters/en-us"
import { action as AccountAction } from "../../redux/Account"
import { action as StellarAccountAction } from "../../redux/StellarAccount"
import { action as BalancesAction } from "../../redux/Balances"
import { signTransaction, getSoftwareVersion } from "../../lib/ledger"
import {
    insertPathIndex,
} from "../../lib/utils"
import {
    loadAccount,
    buildCreateAccountTx,
    buildPaymentTx,
    submitTransaction,
} from "../../lib/stellar-tx"
import { config } from "../../config"
import { withLoginManager } from "../LoginManager"
import { withAssetManager } from "../AssetManager"
import {
    ConnectedSwitch as Switch,
    resolvePath,
} from "../StellarRouter"
import {
    accountExistsOnLedger,
    accountMissingOnLedger,
    setAccountRegistered,
    setModalLoading,
    setModalLoaded,
    updateLoadingMessage,
    changeLoginState,
    changeModalState,
    changeSnackbarState,
    togglePaymentCard,
} from "../../redux/actions"
import Button from "../../lib/common/Button"
import Modal from "../../lib/common/Modal"
import Signup from "../Account/Signup"
import RegisterCard from "./RegisterCard"
import BalancesCard from "./BalancesCard"
import NoAccountCard from "./NoAccountCard"
import PaymentCard from "./PaymentCard"
import TxConfirmMsg from "./TxConfirmMsg"
import TxBroadcastMsg from "./TxBroadcastMsg"
import TxCompleteMsg from "./TxCompleteMsg"
import {
    operationsStreamer,
    paymentsStreamer
} from "../Streamers"

import "./index.css"




// <Balances> component
class Balances extends Component {

    // ...
    static propTypes = {
        match: PropTypes.object.isRequired,
        setState: PropTypes.func.isRequired,
    }


    // ...
    constructor (props) {
        super(props)

        // relative resolve
        this.rr = resolvePath(this.props.match.path)
    }


    // ...
    state = {
        paymentsStreamer: null,
        operationsStreamer: null,
        modalButtonText: "CANCEL",
    }


    // ...
    componentDidMount = () => {
        this.setState({
            paymentsStreamer: paymentsStreamer(
                this.props.publicKey,
                this.props.changeSnackbarState,
                this.props.accountExistsOnLedger
            ),
            operationsStreamer: operationsStreamer(
                this.props.publicKey,
                this.props.changeSnackbarState,
                this.props.accountExistsOnLedger
            ),
        })
        if (!this.props.accountInfo.account) {
            this.props.setModalLoading()
            this.props.updateLoadingMessage({
                message: "Searching for account ...",
            })
            this._tmpQueryHorizon()
            this._tmpAccountExists()
        }
    }


    // ...
    componentWillUnmount = () => {
        this.state.paymentsStreamer.call(this)
        this.state.operationsStreamer.call(this)
        this.props.resetBalancesState()
    }


    // ...
    _tmpAccountExists = () => {
        axios.post(
            `${config.api}/user/ledgerauth/${
                this.props.publicKey
            }/${
                this.props.bip32Path
            }`
        ).then((response) => {
            this.props.setAccountRegistered(true)
            axios.get(`${config.api}/account/${response.data.user_id}`)
                .then((r) => {
                    this.props.setState({currency: r.data.data.currency,})
                    this.props.assetManager.updateExchangeRate(
                        r.data.data.currency
                    )
                })
                .catch((_ex) => {
                    // nothing
                })
        }).catch((_error) => {
            // do nothing as this is only a check
        })
    }


    // ...
    _tmpQueryHorizon = async () => {
        try {
            const account = await loadAccount(this.props.publicKey)
            this.props.updateAccountTree(account)

            this.props.accountExistsOnLedger({ account, })
            this.props.setState({ exists: true, })
        } catch (error) {
            this.props.accountMissingOnLedger()
            this.props.setState({ exists: false, })
        } finally {
            this.props.setModalLoaded()
        }
    }


    // ...
    hideSignupModal = () =>
        this.props.changeModalState({
            signup: {
                showing: false,
            },
        })


    // ...
    hideTxCompleteModal = () =>
        this.props.changeModalState({
            txCompleteMsg: {
                showing: false,
            },
        })


    // ...
    buildSendTransaction = async () => {
        try {
            let tx = null
            const paymentData = {
                source: this.props.publicKey,
                destination: this.props.Balances.payee,
                amount: this.props.assetManager.convertToNative(
                    this.props.Balances.amount),
                memo: this.props.Balances.memoText,
            }
            if (this.props.Balances.newAccount) {
                tx = await buildCreateAccountTx(paymentData)
                this.props.setStateForBalances({
                    transactionType: "Create Acc",
                })
            } else {
                tx = await buildPaymentTx(paymentData)
                this.props.setStateForBalances({
                    transactionType: "Payment",
                })
            }

            this.props.changeModalState({
                txConfirmMsg: { showing: true, },
            })

            const signedTx = await signTransaction(
                insertPathIndex(this.props.bip32Path),
                this.props.publicKey,
                tx
            )

            this.props.changeModalState({
                txBroadcastMsg: { showing: true, },
            })

            const broadcast = await submitTransaction(signedTx)

            this.props.setStateForBalances({
                paymentId: broadcast.hash,
                ledgerId: broadcast.ledger,
            })

            this.props.setStateForBalances({
                transactionType: null,
            })

            this.props.changeModalState({
                txCompleteMsg: { showing: true, },
            })

            this.props.togglePaymentCard({
                payment: {
                    opened: false,
                },
            })
        } catch (error) {
            if (error.name === "BadResponseError") {
                this.showError(`${error.data.title}.`)
            } else {
                this.showError(error.message)
            }
        }
    }


    // ...
    showError = (message) => {
        this.props.changeModalState({
            alertWithDismiss: {
                showing: true,
                title: "Error",
                content: message,
            },
        })
        this.props.setStateForBalances({
            sendIsDisabled: false,
        })
    }


    // ...
    sendPayment = async () => {
        this.props.setStateForBalances({
            sendIsDisabled: true,
        })

        try {
            await getSoftwareVersion()
            this.buildSendTransaction()
        } catch (ex) {
            this.showError(ex.message)
        }
    }


    // ...
    changeButtonText = () =>
        this.setState({
            modalButtonText: "DONE",
        })


    // ...
    completeRegistration = (loginObj) => {
        this.changeButtonText()
        this.props.setAccountRegistered(true)
        this.props.changeLoginState({
            userId: loginObj.userId,
            token: loginObj.token,
        })
    }


    // ...
    render = () => (
        ({appUi, publicKey, bip32Path, assetManager, accountInfo, loginManager, }) =>
            <Switch>
                <Route exact path={this.rr(".")}>
                    <Fragment>
                        <Modal
                            open={
                                appUi.modals.signup ?
                                    appUi.modals.signup.showing : false
                            }
                            title="Opening Your Bank - Register Account"
                            actions={[
                                <Button
                                    label={this.state.modalButtonText}
                                    onClick={this.hideSignupModal}
                                    primary={true}
                                />,
                            ]}
                        >
                            <Signup onComplete={this.completeRegistration}
                                config={{
                                    useAsRegistrationForm: true,
                                    publicKey,
                                    bip32Path,
                                }}
                            />
                        </Modal>

                        <Modal
                            open={
                                appUi.modals.txConfirmMsg ?
                                    appUi.modals.txConfirmMsg.showing : false
                            }
                            title="Confirm on Hardware Device"
                        >
                            <TxConfirmMsg />
                        </Modal>

                        <Modal
                            open={
                                appUi.modals.txBroadcastMsg ?
                                    appUi.modals.txBroadcastMsg.showing :
                                    false
                            }
                            title="Transmiting ..."
                        >
                            <TxBroadcastMsg />
                        </Modal>

                        <Modal
                            open={
                                appUi.modals.txCompleteMsg ?
                                    appUi.modals.txCompleteMsg.showing :
                                    false
                            }
                            title="Transaction Complete"
                            actions={[
                                <Button
                                    label="OK"
                                    onClick={this.hideTxCompleteModal}
                                    primary={true}
                                />,
                            ]}
                        >
                            <TxCompleteMsg
                                assetManager={assetManager}
                            />
                        </Modal>

                        {
                            !accountInfo.registered  &&
                            !loginManager.isLoggedIn() ?
                                <RegisterCard /> : null
                        }

                        {
                            accountInfo.exists ?
                                <BalancesCard
                                    notImplemented={this.handleOpen}
                                /> :
                                <NoAccountCard />
                        }

                        {
                            appUi.cards.payment  &&
                            appUi.cards.payment.opened ?
                                <PaymentCard
                                    onSignTransaction={this.sendPayment}
                                /> : null
                        }
                    </Fragment>
                </Route>
                <Redirect to={this.rr(".")} />
            </Switch>
    )(this.props)

}


// ...
export default compose(
    withAssetManager,
    withLoginManager,
    connect(
        // map state to props.
        (state) => ({
            publicKey: state.LedgerHQ.publicKey,
            bip32Path: state.LedgerHQ.bip32Path,
            Account: state.Account,
            Balances: state.Balances,
            accountInfo: state.accountInfo,
            appUi: state.appUi,
        }),
        // match dispatch to props.
        (dispatch) => bindActionCreators({
            setState: AccountAction.setState,
            updateAccountTree: StellarAccountAction.loadStellarAccount,
            setStateForBalances: BalancesAction.setState,
            resetBalancesState: BalancesAction.resetState,
            accountExistsOnLedger,
            accountMissingOnLedger,
            setAccountRegistered,
            setModalLoading,
            setModalLoaded,
            updateLoadingMessage,
            changeLoginState,
            changeModalState,
            changeSnackbarState,
            togglePaymentCard,
        }, dispatch)
    )
)(Balances)
