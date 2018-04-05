import React, { Component, Fragment } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import axios from "axios"
import "number-to-text/converters/en-us"

import { action as AccountAction } from "../../redux/Account"

import { signTransaction, awaitConnection } from "../../lib/ledger"
import {
    StellarSdk,
    pubKeyAbbr,
    handleException,
    insertPathIndex,
} from "../../lib/utils"
import { config } from "../../config"
import { appName } from "../StellarFox/env"
import { withLoginManager } from "../LoginManager"
import { withAssetManager } from "../AssetManager"

import {
    showAlert,
    hideAlert,
    setCurrency,
    accountExistsOnLedger,
    accountMissingOnLedger,
    setAccountRegistered,
    logIn,
    setModalLoading,
    setModalLoaded,
    updateLoadingMessage,
    changeLoginState,
    changeModalState,
    changeSnackbarState,
    ActionConstants,
    togglePaymentCard,
} from "../../redux/actions"

import { List, ListItem } from "material-ui/List"
import Dialog from "material-ui/Dialog"
import LinearProgress from "material-ui/LinearProgress"
import Button from "../../lib/common/Button"
import Snackbar from "../../lib/common/Snackbar"
import Modal from "../../lib/common/Modal"
import Signup from "../Account/Signup"
import RegisterCard from "./RegisterCard"
import BalancesCard from "./BalanceCard"
import NoAccountCard from "./NoAccountCard"
import PaymentCard from "./PaymentCard"
import "./index.css"




StellarSdk.Network.useTestNetwork()
const server = new StellarSdk.Server(config.horizon)




// <Balances> component
class Balances extends Component {

    // ...
    static propTypes = {
        setState: PropTypes.func.isRequired,
    }

    // ...
    state = ((now) => ({
        paymentsStreamer: null,


        sbPayment: false,
        sbPaymentAmount: null,
        sbPaymentAssetCode: null,
        modalShown: false,
        deviceConfirmModalShown: false,
        broadcastTxModalShown: false,
        errorModalShown: false,
        errorModalMessage: "",
        modalButtonText: "CANCEL",
        currencySymbol: null,
        currencyText: null,
        minDate: now,
        payDate: now,
        // the following are resetable
        amountEntered: false,
        payee: null,
        memoRequired: false,
        memo: "",
        amountValid: false,
        amount: 0,
        transactionType: null,
        memoValid: false,
        buttonSendDisabled: true,
        paymentCardVisible: false,
        newAccount: false,
        minimumReserveMessage: "",
        sendingCompleteModalShown: false,
        loginButtonDisabled: true,
    }))(new Date())


    // ...
    componentDidMount = () => {

        // FIXME: merge streamers
        this.setState({
            paymentsStreamer: this.paymentsStreamer.call(this),
            optionsStreamer: this.optionsStreamer.call(this),
        })

        this.props.changeSnackbarState({
            open: false,
            message: "",
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
        this.state.optionsStreamer.call(this)
    }


    // ...
    _tmpAccountExists = () => {
        axios.post(
            `${config.api}/user/ledgerauth/${
                this.props.appAuth.publicKey
            }/${
                this.props.appAuth.bip32Path
            }`
        ).then((_response) => {
            this.props.setAccountRegistered(true)
        }).catch((_error) => {
            // do nothing as this is only a check
        })
    }


    // ...
    _tmpQueryHorizon = () => {
        let server = new StellarSdk.Server(
            this.props.accountInfo.horizon
        )

        server
            .loadAccount(this.props.appAuth.publicKey)
            .then((account) => {
                this.props.accountExistsOnLedger({ account, })
                this.props.setState({ exists: true, })
            })
            .catch(StellarSdk.NotFoundError, () => {
                this.props.accountMissingOnLedger()
                this.props.setState({ exists: false, })
            })
            .finally(() => {
                setTimeout(() => {
                    this.props.setModalLoaded()
                }, 500)

            })
    }


    // ...
    optionsStreamer = () => {
        let server = new StellarSdk.Server(this.props.accountInfo.horizon)

        return server.operations().cursor("now").stream({
            onmessage: (message) => {

                /*
                * Set options. (home_domain - experiment)
                */
                if (
                    message.type === "set_options"  &&
                    message.source_account ===
                        this.props.appAuth.publicKey  &&
                    this.props
                        .accountInfo.account
                        .account.home_domain !== message.home_domain

                ) {
                    this.updateAccount.call(this)
                    this.setState({
                        sbPayment: true,
                        sbPaymentText: "Home domain changed: ",
                        sbPaymentAmount:
                            message.home_domain ?
                                message.home_domain : "DOMAIN REMOVED",
                        sbPaymentAssetCode: "",
                    })
                }

            },
        })
    }


    // ...
    paymentsStreamer = () => {
        let server = new StellarSdk.Server(this.props.accountInfo.horizon)
        return server.payments().cursor("now").stream({
            onmessage: (message) => {

                /*
                * Payment to fund a new account.
                */
                if (
                    message.type === "create_account" &&
                    message.source_account === this.props.appAuth.publicKey
                ) {
                    this.updateAccount.call(this)
                    this.setState({
                        sbPayment: true,
                        sbPaymentText:
                            `Payment sent to new account [${
                                pubKeyAbbr(message.account)
                            }]: `,
                        sbPaymentAmount:
                            this.props.assetManager.convertToAsset(
                                message.starting_balance),
                        sbPaymentAssetCode:
                            this.props.Account.currency.toUpperCase(),
                    })
                }

                /*
                * Initial funding of own account.
                */
                if (
                    message.type === "create_account" &&
                    message.account === this.props.appAuth.publicKey
                ) {
                    this.updateAccount.call(this)
                    this.setState({
                        sbPayment: true,
                        sbPaymentText: "Account Funded: ",
                        sbPaymentAmount:
                            this.props.assetManager.convertToAsset(
                                message.starting_balance),
                        sbPaymentAssetCode:
                            this.props.Account.currency.toUpperCase(),
                    })
                }

                /*
                * Receiving payment.
                */
                if (
                    message.type === "payment" &&
                    message.to === this.props.appAuth.publicKey
                ) {
                    this.updateAccount.call(this)
                    this.setState({
                        sbPayment: true,
                        sbPaymentText: "Balance Updated. Payment Received: ",
                        sbPaymentAmount: this.props.assetManager.convertToAsset(
                            message.amount),
                        sbPaymentAssetCode:
                            this.props.Account.currency.toUpperCase(),
                    })
                }

                /*
                * Sending payment.
                */
                if (
                    message.type === "payment" &&
                    message.from === this.props.appAuth.publicKey
                ) {
                    this.updateAccount.call(this)
                    this.setState({
                        sbPayment: true,
                        sbPaymentText: "Balance Updated. Payment Sent: ",
                        sbPaymentAmount: this.props.assetManager.convertToAsset(
                            message.amount),
                        sbPaymentAssetCode:
                            this.props.Account.currency.toUpperCase(),
                    })
                }
            },
        })
    }


    // ...
    updateDate = (_, date) =>
        this.setState({
            payDate: date,
        })


    // ...
    updateAccount = () => {
        let server = new StellarSdk.Server(this.props.accountInfo.horizon)
        server.loadAccount(this.props.appAuth.publicKey)
            .catch(StellarSdk.NotFoundError, (_) => {
                throw new Error("The destination account does not exist!")
            })
            .then((account) => {
                this.props.accountExistsOnLedger({account,})
            }, (_) => {
                this.props.accountMissingOnLedger()
            })
    }


    // ...
    getNativeBalance = (account) => {
        let nativeBalance = 0

        account.balances.forEach((balance) => {
            if (balance.asset_type === "native") {
                nativeBalance = balance.balance
            }
        })

        return nativeBalance
    }


    // ...
    handleOpen = () => this.props.showAlert()


    // ...
    handleClose = () => this.props.hideAlert()


    // ...
    closeSendingCompleteModal = () =>
        this.setState({
            sendingCompleteModalShown: false,
        })


    // ...
    handlePaymentSnackbarClose = () =>
        this.setState({
            sbPayment: false,
        })


    // ...
    handleModalClose = () =>
        axios
            .post(
                `${config.api}/user/ledgerauth/${
                    this.props.appAuth.publicKey
                }/${
                    this.props.appAuth.bip32Path
                }`
            )
            .then((response) => {
                this.props.setAccountRegistered(true)
                this.props.logIn({
                    userId: response.data.user_id,
                    token: response.data.token,
                })
                this.setState({
                    modalShown: false,
                })
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    // theoretically this should not happen
                    // eslint-disable-next-line no-console
                    console.log("Ledger user not found.")
                } else {
                    // eslint-disable-next-line no-console
                    console.log(error.response.statusText)
                }
            })


    // ...
    handleRegistrationModalClose = () =>
        this.setState({
            modalShown: false,
        })


    // ...
    handleSignup = () =>
        this.setState({
            modalButtonText: "CANCEL",
            modalShown: true,
        })


    // ...
    showSignupModal = () =>
        this.props.changeModalState({
            signup: {
                showing: true,
            },
        })


    // ...
    hideSignupModal = () =>
        this.props.changeModalState({
            signup: {
                showing: false,
            },
        })


    // ...
    setModalButtonText = (text) =>
        this.setState({
            modalButtonText: text,
        })


    // ...
    showPaymentCard = () =>
        this.setState({
            paymentCardVisible: true,
        })


    // ...
    hidePaymentCard = () =>
        this.setState({
            paymentCardVisible: false,
        })


    // ...
    queryStellarAccount = (pubKey) =>
        server.loadAccount(pubKey)
            .catch(StellarSdk.NotFoundError, (_) => {
                throw new Error("The destination account does not exist!")
            })
            .then((account) => {
                return this.getNativeBalance(account)
            })


    // ...
    buildSendTransaction = () => {
        let
            destinationId = this.props.Balances.payee,
            // Transaction will hold a built transaction we can resubmit
            // if the result is unknown.
            transaction = null

        if (this.props.Balances.newAccount) {

            // This function is "async"
            // as it waits for signature from the device
            server.loadAccount(this.props.appAuth.publicKey)
                .then(async (sourceAccount) => {
                    // Start building the transaction.
                    transaction = new StellarSdk.TransactionBuilder(sourceAccount)
                        .addOperation(StellarSdk.Operation.createAccount({
                            destination: this.props.Balances.payee,
                            startingBalance:
                                this.props.assetManager.convertToNative(
                                    this.props.Balances.amount),
                        }))
                        .addMemo(
                            StellarSdk.Memo.text(
                                this.props.Balances.memoText
                            )
                        )
                        .build()

                    this.setState({
                        transactionType: "Create Account",
                        deviceConfirmModalShown: true,
                    })

                    // Sign the transaction to prove you are actually the person sending it.
                    // transaction.sign(sourceKeys)
                    const signedTransaction = await signTransaction(
                        insertPathIndex(this.props.appAuth.bip32Path),
                        this.props.appAuth.publicKey,
                        transaction
                    )

                    this.setState({
                        deviceConfirmModalShown: false,
                        broadcastTxModalShown: true,
                    })

                    // And finally, send it off to Stellar!
                    return server.submitTransaction(signedTransaction)
                })
                .then((_result) => {
                    // TODO: display xdr hash on receipt.
                    this.setState({
                        transactionType: null,
                        broadcastTxModalShown: false,
                        sendingCompleteModalShown: true,
                    })
                    this.setState({
                        amountEntered: false,
                        payee: null,
                        memoRequired: false,
                        amountValid: false,
                        amount: 0,
                        memoValid: false,
                        buttonSendDisabled: true,
                        paymentCardVisible: false,
                        newAccount: false,
                    })
                    this.props.togglePaymentCard({
                        payment: {
                            opened: false,
                        },
                    })
                })
                .catch((error) => {
                    this.setState({
                        transactionType: null,
                        deviceConfirmModalShown: false,
                        broadcastTxModalShown: false,
                        sendingCompleteModalShown: false,
                        amountEntered: false,
                        payee: null,
                        memoRequired: false,
                        amountValid: false,
                        amount: 0,
                        memoValid: false,
                        buttonSendDisabled: true,
                        paymentCardVisible: false,
                        newAccount: false,
                    })
                    this.showErrorModal.call(this, error.message)
                })

        } else {

            // First, check to make sure that the destination account exists.
            // You could skip this, but if the account does not exist, you will be charged
            // the transaction fee when the transaction fails.
            server.loadAccount(destinationId)
                // If the account is not found, surface a nicer error message for logging.
                .catch(StellarSdk.NotFoundError, (_) => {
                    throw new Error("The destination account does not exist!")
                })
                // If there was no error, load up-to-date information on your account.
                .then(() => server.loadAccount(this.props.appAuth.publicKey))
                // This function is "async" as it waits for signature from the device
                .then(async (sourceAccount) => {
                    // Start building the transaction.
                    transaction = new StellarSdk.TransactionBuilder(sourceAccount)
                        .addOperation(StellarSdk.Operation.payment({
                            destination: destinationId,
                            // Because Stellar allows transaction in many currencies, you must
                            // specify the asset type. The special "native" asset represents Lumens.
                            asset: StellarSdk.Asset.native(),
                            amount: this.props.assetManager.convertToNative(this.props.Balances.amount),
                        }))
                        // A memo allows you to add your own metadata to a transaction. It's
                        // optional and does not affect how Stellar treats the transaction.
                        .addMemo(StellarSdk.Memo.text(this.props.Balances.memoText))
                        .build()
                    // Sign the transaction to prove you are actually the person sending it.
                    // transaction.sign(sourceKeys)
                    this.setState({
                        transactionType: "Payment",
                        deviceConfirmModalShown: true,
                    })
                    const signedTransaction = await signTransaction(
                        insertPathIndex(this.props.appAuth.bip32Path),
                        this.props.appAuth.publicKey,
                        transaction
                    )
                    this.setState({
                        deviceConfirmModalShown: false,
                        broadcastTxModalShown: true,
                    })
                    // And finally, send it off to Stellar!
                    return server.submitTransaction(signedTransaction)
                })
                .then((_result) => {
                    //TODO: display xdr hash on receipt
                    this.setState({
                        transactionType: null,
                        broadcastTxModalShown: false,
                        sendingCompleteModalShown: true,
                    })
                    this.setState({
                        amountEntered: false,
                        payee: null,
                        memoRequired: false,
                        amountValid: false,
                        amount: 0,
                        memoValid: false,
                        buttonSendDisabled: true,
                        paymentCardVisible: false,
                        newAccount: false,
                    })
                    this.props.togglePaymentCard({
                        payment: {
                            opened: false,
                        },
                    })
                })
                .catch((error) => {
                    this.setState({
                        transactionType: null,
                        deviceConfirmModalShown: false,
                        broadcastTxModalShown: false,
                        sendingCompleteModalShown: false,
                        amountEntered: false,
                        payee: null,
                        memoRequired: false,
                        amountValid: false,
                        amount: 0,
                        memoValid: false,
                        buttonSendDisabled: true,
                        paymentCardVisible: false,
                        newAccount: false,
                    })
                    this.showErrorModal.call(this, error.message)
                })
        }
    }


    // ...
    showErrorModal = (message) =>
        this.setState({
            errorModalShown: true,
            errorModalMessage: message,
        })


    // ...
    closeErrorModal = () =>
        this.setState({
            errorModalShown: false,
            errorModalMessage: "",
        })


    // ...
    sendPayment = async () => {
        // check if device is connected first (if not deviceCheck is an error object)
        const deviceCheck = await awaitConnection()

        if (typeof deviceCheck === "string") {
            this.buildSendTransaction.call(this)
            return true
        } else {
            this.showErrorModal.call(this, deviceCheck.message)
            return false
        }
    }


    // ...
    transactionFeedbackMessage = () =>
        <Fragment>
            <div>
                Please confirm the following info on your device&apos;s screen.
            </div>
            <List>
                <ListItem
                    disabled={true}
                    primaryText="Type"
                    secondaryText={this.state.transactionType}
                    leftIcon={
                        <i className="green material-icons md-icon-small">
                            assignment_late
                        </i>
                    }
                />
                <ListItem
                    disabled={true}
                    primaryText="Amount"
                    secondaryText={
                        `${this.props.assetManager.convertToNative(this.props.Balances.amount)} XLM`
                    }
                    leftIcon={
                        <i className="green material-icons md-icon-small">
                            account_balance_wallet
                        </i>
                    }
                />
                <ListItem
                    disabled={true}
                    primaryText="Destination"
                    secondaryText={
                        handleException(
                            () => pubKeyAbbr(this.props.Balances.payee),
                            () => "Not Available"
                        )
                    }
                    leftIcon={
                        <i className="green material-icons md-icon-small">
                            local_post_office
                        </i>
                    }
                />
                <ListItem
                    disabled={true}
                    primaryText="Memo"
                    secondaryText={this.props.Balances.memoText}
                    leftIcon={
                        <i className="green material-icons md-icon-small">
                            speaker_notes
                        </i>
                    }
                />
                <ListItem
                    disabled={true}
                    primaryText="Fee"
                    secondaryText="0.000001 XLM"
                    leftIcon={
                        <i className="green material-icons md-icon-small">
                            credit_card
                        </i>
                    }
                />
                <ListItem
                    disabled={true}
                    primaryText="Network"
                    secondaryText="Test"
                    leftIcon={
                        <i className="green material-icons md-icon-small">
                            network_check
                        </i>
                    }
                />
            </List>
            <div>
                When you are sure it is correct press "&#10003;"
                on the device to sign your transaction and send it off.
            </div>
        </Fragment>


    // ...
    broadcastTransactionMessage = () =>
        <Fragment>
            <div className="bigger green">
                Your money transfer is on its way.
            </div>
            <div className="faded p-b">
                Estimated arrival time: 5 seconds
            </div>
            <LinearProgress
                style={{ background: "rgb(244,176,4)", }}
                color="rgba(15,46,83,0.6)"
                mode="indeterminate"
            />
        </Fragment>


    // ...
    sendingCompleteMessage = () =>
        <Fragment>
            <div className="bigger green">
                The money has arrived to its destination.
            </div>
            <div className="faded p-b">
                Thank you for using {appName}.
            </div>
        </Fragment>


    // ...
    doWhateverYourFunctionCurrentlyIs = () =>
        this.setState({
            modalShown: false,
        })


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
            loginState: ActionConstants.LOGGED_IN,
            publicKey: this.props.appAuth.publicKey,
            bip32Path: this.props.appAuth.bip32Path,
            userId: loginObj.userId,
            token: loginObj.token,
        })
    }

    // ...
    render = () => {

        const
            actions = [
                <Button
                    primary={true}
                    label="OK"
                    keyboardFocused={true}
                    onClick={this.handleClose}
                />,
            ],
            actionsError = [
                <Button
                    primary={true}
                    label="OK"
                    keyboardFocused={true}
                    onClick={this.closeErrorModal}
                />,
            ],
            actionsSendingComplete = [
                <Button
                    primary={true}
                    label="OK"
                    keyboardFocused={true}
                    onClick={this.closeSendingCompleteModal}
                />,
            ]

        return (
            <div>
                <div>
                    <Snackbar
                        open={this.state.sbPayment}
                        message={
                            `${
                                this.state.sbPaymentText
                            } ${
                                this.state.sbPaymentAmount
                            } ${
                                this.state.sbPaymentAssetCode
                            }`
                        }
                        onRequestClose={
                            this.handlePaymentSnackbarClose
                        }
                    />

                    <Dialog
                        title="Not Yet Implemented"
                        actions={actions}
                        modal={false}
                        open={this.props.modal.isShowing}
                        onRequestClose={this.handleClose}
                        paperClassName="modal-body"
                        titleClassName="modal-title"
                    >
                        Pardon the mess. We are working hard to bring you this feature very
                        soon. Please check back in a while as the feature implementation
                        is being continuously deployed.
                    </Dialog>


                    <Modal
                        open={
                            typeof this.props.appUi.modals !== "undefined" &&
                                typeof this.props.appUi.modals.signup !== "undefined" ?
                                this.props.appUi.modals.signup.showing : false
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
                        <Signup onComplete={this.completeRegistration} config={{
                            register: true,
                            publicKey: this.props.appAuth.publicKey,
                            bip32Path: this.props.appAuth.bip32Path,
                        }} />
                    </Modal>




                    <Dialog
                        title={
                            <div>
                                <i className="material-icons">
                                    developer_board
                                </i> Confirm on Ledger
                            </div>
                        }
                        actions={null}
                        modal={true}
                        open={this.state.deviceConfirmModalShown}
                        paperClassName="modal-body"
                        titleClassName="modal-title"
                    >
                        {this.transactionFeedbackMessage.call(this)}
                    </Dialog>

                    <Dialog
                        title={
                            <div className="header-icon">
                                <i className="material-icons">send</i>
                                <span>Sending Payment</span>
                            </div>
                        }
                        actions={null}
                        modal={true}
                        open={this.state.broadcastTxModalShown}
                        paperClassName="modal-body"
                        titleClassName="modal-title"
                    >
                        {this.broadcastTransactionMessage.call(this)}
                    </Dialog>

                    <Dialog
                        title="Error"
                        actions={actionsError}
                        modal={false}
                        open={this.state.errorModalShown}
                        onRequestClose={this.closeErrorModal}
                        paperClassName="modal-body"
                        titleClassName="modal-title"
                    >
                        {this.state.errorModalMessage}
                    </Dialog>

                    <Dialog
                        title={
                            <div className="header-icon">
                                <i className="material-icons">send</i>
                                <span>Transfer complete.</span>
                            </div>
                        }
                        actions={actionsSendingComplete}
                        modal={true}
                        open={this.state.sendingCompleteModalShown}
                        onRequestClose={this.closeSendingCompleteModal}
                        paperClassName="modal-body"
                        titleClassName="modal-title"
                    >
                        {this.sendingCompleteMessage.call(this)}
                    </Dialog>
                </div>

                {!this.props.accountInfo.registered &&
                    !this.props.loginManager.isExploreOnly() ?
                    <RegisterCard /> : null
                }

                {this.props.accountInfo.exists ?
                    <BalancesCard /> : <NoAccountCard />
                }

                {
                    this.props.appUi.cards.payment &&
                    this.props.appUi.cards.payment.opened && <PaymentCard onSignTransaction={this.sendPayment} />
                }
            </div>
        )
    }
}


// ...
export default withLoginManager(withAssetManager(connect(
    // map state to props.
    (state) => ({
        Account: state.Account,
        Balances: state.Balances,
        accountInfo: state.accountInfo,
        modal: state.modal,
        appAuth: state.appAuth,
        appUi: state.appUi,
    }),

    // match dispatch to props.
    (dispatch) => bindActionCreators({
        setState: AccountAction.setState,
        showAlert,
        hideAlert,
        setCurrency,
        accountExistsOnLedger,
        accountMissingOnLedger,
        setAccountRegistered,
        logIn,
        setModalLoading,
        setModalLoaded,
        updateLoadingMessage,
        changeLoginState,
        changeModalState,
        changeSnackbarState,
        ActionConstants,
        togglePaymentCard,
    }, dispatch)
)(Balances)))
