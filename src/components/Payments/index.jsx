import React, { Component } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import BigNumber from "bignumber.js"

import {
    currencyGlyph,
    pubKeyAbbr,
    getAssetCode,
    formatAmount,
    StellarSdk,
} from "../../lib/utils"
import { emoji } from "../StellarFox/env"
import { gravatarLink } from "../../lib/deneb"
import { withLoginManager } from "../LoginManager"

import {
    setAccountPayments,
    setAccountTransactions,
    setStreamer,
    accountExistsOnLedger,
    accountMissingOnLedger,
    setTab,
    setModalLoading,
    setModalLoaded,
    updateLoadingMessage,
} from "../../redux/actions"
import { action as PaymentsAction } from "../../redux/Payments"

import {
    Tabs,
    Tab,
} from "material-ui/Tabs"
import PaymentsHistory from "./PaymentsHistory"
import Transactions from "./Transactions"
import Snackbar from "../../lib/common/Snackbar"

import "./index.css"




// ...
const styles = {
    tab: {
        backgroundColor: "#2e5077",
        borderRadius: "3px",
        color: "rgba(244,176,4,0.9)",
    },
    inkBar: {
        backgroundColor: "rgba(244,176,4,0.8)",
    },
    container: {
        backgroundColor: "#2e5077",
        borderRadius: "3px",
    },
}




// <Payments> component
class Payments extends Component {

    // ...
    stellarServer = new StellarSdk.Server(this.props.accountInfo.horizon)


    // ...
    componentWillUnmount = () =>
        this.props.accountInfo.streamer.call(this)


    // ...
    componentDidMount = () => {
        this.props.setModalLoading()
        this.props.updateLoadingMessage({
            message: "Loading payments data ...",
        })
        this.props.setStreamer(this.paymentsStreamer.call(this))

        this.stellarServer
            .payments()
            .forAccount(this.props.appAuth.publicKey)
            .order("desc")
            .limit(5)
            .call()
            .then((paymentsResult) => {
                const gravatarLinkPromises =
                    paymentsResult.records.map((r) => {
                        let link = ""
                        switch (r.type) {
                            case "create_account":
                                if (
                                    r.funder === this.props.appAuth.publicKey
                                ) {
                                    link = gravatarLink(r.account)
                                } else {
                                    link = gravatarLink(r.funder)
                                }
                                break

                            // payment
                            default:
                                if(r.to === this.props.appAuth.publicKey) {
                                    link = gravatarLink(r.from)
                                } else {
                                    link = gravatarLink(r.to)
                                }
                                break
                        }
                        return link
                    })

                Promise.all(gravatarLinkPromises).then((links) => {
                    links.forEach((link, index) => {
                        paymentsResult.records[index].gravatar = link.link
                        paymentsResult.records[index].firstName = link.firstName
                        paymentsResult.records[index].lastName = link.lastName
                        paymentsResult.records[index].email = link.email
                        paymentsResult.records[index].alias = link.alias
                        paymentsResult.records[index].domain = link.domain
                    })
                    this.props.setAccountPayments(paymentsResult)
                    this.updateCursors(paymentsResult.records)
                    paymentsResult.records[0].effects().then((effects) => {
                        paymentsResult.records[0].transaction().then((tx) => {
                            this.props.setState({
                                paymentDetails: {
                                    txid: paymentsResult.records[0].id,
                                    created_at:
                                        paymentsResult.records[0].created_at,
                                    effects: effects._embedded.records,
                                    memo: tx.memo,
                                    selectedPaymentId:
                                        paymentsResult.records[0].id,
                                },
                            })
                            this.props.setModalLoaded()
                        })
                    })
                })
            })
            .catch(function (err) {
                // eslint-disable-next-line no-console
                console.log(err)
            })
    }


    // ...
    noMoreTransactionsNotice = (state) =>
        this.props.setState(
            {
                sbNoMoreTransactions: true,
                ...state,
            }
            // (_prevState) => this.props.setState(state)
        )


    // ...
    handleNoMorePaymentsSnackbarClose = () =>
        this.props.setState({ sbNoMorePayments: false, })


    // ...
    handleNoMoreTransactionsSnackbarClose = () =>
        this.props.setState({ sbNoMoreTransactions: false, })


    // ...
    paymentsStreamer = () =>
        this.stellarServer
            .payments()
            .cursor("now")
            .stream({
                onmessage: (message) => {

                    /*
                     * Payment to fund a new account.
                     */
                    if (
                        message.type === "create_account" &&
                        message.source_account === this.props.appAuth.publicKey
                    ) {
                        this.updateAccount.call(this)
                        this.props.setState({
                            sbPayment: true,
                            sbPaymentText:
                                `Payment sent to new account [${
                                    pubKeyAbbr(message.account)
                                }]: `,
                            sbPaymentAmount:
                                this.convertToFiat(message.starting_balance),
                            sbPaymentAssetCode:
                                this.props.accountInfo.currency.toUpperCase(),
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
                        this.props.setState({
                            sbPayment: true,
                            sbPaymentText: "Account Funded: ",
                            sbPaymentAmount:
                                this.convertToFiat(message.starting_balance),
                            sbPaymentAssetCode:
                                this.props.accountInfo.currency.toUpperCase(),
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
                        this.props.setState({
                            sbPayment: true,
                            sbPaymentText: "Payment Received: ",
                            sbPaymentAmount: formatAmount(
                                message.amount,
                                this.props.accountInfo.precision
                            ),
                            sbPaymentAssetCode:
                                message.asset_type === "native"
                                    ? "XLM"
                                    : message.asset_code,
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
                        this.props.setState({
                            sbPayment: true,
                            sbPaymentText: "Payment Sent: ",
                            sbPaymentAmount: formatAmount(
                                message.amount,
                                this.props.accountInfo.precision
                            ),
                            sbPaymentAssetCode:
                                message.asset_type === "native"
                                    ? "XLM"
                                    : message.asset_code,
                        })
                    }
                },
            })


    // ...
    updateAccount = () =>
        this.stellarServer
            .loadAccount(this.props.appAuth.publicKey)
            .catch(StellarSdk.NotFoundError, function (_err) {
                throw new Error("The destination account does not exist!")
            })
            .then(
                (account) => {
                    this.props.accountExistsOnLedger({ account, })
                    this.stellarServer
                        .payments()
                        .limit(5)
                        .forAccount(this.props.appAuth.publicKey)
                        .order("desc")
                        .call()
                        .then((paymentsResult) => {
                            const gravatarLinkPromises =
                                paymentsResult.records.map((r) => {
                                    let link = ""
                                    switch (r.type) {
                                        case "create_account":
                                            if (
                                                r.funder ===
                                                    this.props
                                                        .appAuth.publicKey
                                            ) {
                                                link = gravatarLink(r.account)
                                            } else {
                                                link = gravatarLink(r.funder)
                                            }
                                            break

                                        // payment
                                        default:
                                            if (
                                                r.to ===
                                                    this.props
                                                        .appAuth.publicKey
                                            ) {
                                                link = gravatarLink(r.from)
                                            } else {
                                                link = gravatarLink(r.to)
                                            }
                                            break
                                    }
                                    return link
                                })

                            Promise.all(gravatarLinkPromises).then((links) => {
                                links.forEach((link, index) => {
                                    paymentsResult.records[index].gravatar = link.link
                                    paymentsResult.records[index].firstName = link.firstName
                                    paymentsResult.records[index].lastName = link.lastName
                                    paymentsResult.records[index].email = link.email
                                    paymentsResult.records[index].alias = link.alias
                                    paymentsResult.records[index].domain = link.domain
                                })
                                this.props.setAccountPayments(paymentsResult)
                                this.updateCursors(paymentsResult.records)
                                paymentsResult.records[0].effects().then((effects) => {
                                    paymentsResult.records[0].transaction().then((tx) => {
                                        this.props.setState({
                                            paymentDetails: {
                                                txid:
                                                    paymentsResult
                                                        .records[0].id,
                                                created_at:
                                                    paymentsResult
                                                        .records[0].created_at,
                                                effects: effects
                                                    ._embedded.records,
                                                memo: tx.memo,
                                                selectedPaymentId:
                                                    paymentsResult
                                                        .records[0].id,
                                            },
                                        })
                                        this.props.setModalLoaded()
                                    })
                                })
                            })
                        })
                },
                (_e) => this.props.accountMissingOnLedger()
            )


    // ...
    handlePaymentSnackbarClose = () =>
        this.props.setState({ sbPayment: false, })


    // ...
    handleTabSelect = (_, value) => {
        this.props.setTab({ payments: value, })
        this.props.setState({
            tabSelected: value,
        })
        if (
            value === "2" &&
            this.props.state.txCursorLeft === null &&
            this.props.state.txCursorRight === null
        ) {
            this.stellarServer
                .transactions()
                .forAccount(this.props.appAuth.publicKey)
                .order("desc")
                .limit(5)
                .call()
                .then((transactionsResult) => {
                    this.props.setAccountTransactions(transactionsResult)
                    this.updateTransactionsCursors(transactionsResult.records)
                })
                .catch(function (err) {
                    // eslint-disable-next-line no-console
                    console.log(err)
                })
        }
    }


    // ...
    handlePaymentClick = (payment, paymentId) =>
        payment.effects().then((effects) =>
            payment.transaction().then((tx) =>
                this.props.setState({
                    paymentDetails: {
                        txid: payment.id,
                        created_at: payment.created_at,
                        effects: effects._embedded.records,
                        memo: tx.memo,
                        selectedPaymentId: paymentId,
                    },
                })
            )
        )


    // ...
    decodeEffectType = (effect, index) => {
        let humanizedEffectType = ""
        const icon = `filter_${index + 1}`

        switch (effect.type) {
            case "account_created":
                humanizedEffectType = (
                    <div>
                        <div className="flex-row">
                            <div>
                                <i className="material-icons">{icon}</i>
                                <span>New Acccount Created </span>
                                <span className="account-direction">
                                    {effect.account ===
                                    this.props.appAuth.publicKey
                                        ? "Yours"
                                        : "Theirs"}
                                </span>
                            </div>
                            <div className="f-e-col">
                                <div>
                                    <span className="credit">
                                        {" "}&#x0002B;{" "}
                                        {currencyGlyph(
                                            this.props.accountInfo.currency
                                        )}{" "}
                                        {this.convertToFiat(
                                            effect.starting_balance
                                        )}
                                    </span>
                                </div>
                                <div className="fade-extreme">
                                    <span className="micro-font">
                                        {effect.starting_balance}
                                    </span>{" "}
                                    <span className="pico-font small-caps">
                                        XLM
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="payment-details-body">
                            <div>
                                <span className="payment-details-account">
                                    {pubKeyAbbr(effect.account)}
                                </span>
                                <div className="payment-details-fieldset">
                                    <div className="payment-details-memo">
                                        <span className="smaller">Memo:</span>
                                        {" "}
                                        {this.props.state.paymentDetails.memo}
                                    </div>
                                    <div className="payment-details-id">
                                        ID: {effect.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                break

            case "account_removed":
                humanizedEffectType = (
                    <div>
                        <div>
                            <div className="flex-row">
                                <div>
                                    <i className="material-icons">{icon}</i>
                                    <span>Acccount Removed </span>
                                    <span className="account-direction">
                                        {
                                            effect.account ===
                                                this.props.appAuth.publicKey ?
                                                "Yours" :
                                                "Theirs"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="payment-details-body">
                            <div>
                                <span className="payment-details-account">
                                    {pubKeyAbbr(effect.account)}
                                </span>
                                <div className="payment-details-fieldset">
                                    <div className="payment-details-memo">
                                        <span className="smaller">
                                            Account Closed:
                                            {" "}
                                            {pubKeyAbbr(effect.account)}
                                        </span>
                                    </div>
                                    <div className="payment-details-id">
                                        ID: {effect.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                break

            case "account_credited":
                humanizedEffectType = (
                    <div>
                        <div className="flex-row">
                            <div>
                                <i className="material-icons">{icon}</i>
                                <span>Acccount Credited </span>
                                <span className="account-direction">
                                    {effect.account ===
                                    this.props.appAuth.publicKey
                                        ? "Yours"
                                        : "Theirs"}
                                </span>
                            </div>
                            <div>
                                <div className="f-e-col">
                                    <div>
                                        {getAssetCode(effect) === "XLM" ? (
                                            <span className="credit">
                                                {" "}&#x0002B;{" "}
                                                {currencyGlyph(
                                                    this.props
                                                        .accountInfo.currency
                                                )}{" "}
                                                {this.convertToFiat(
                                                    effect.amount
                                                )}
                                            </span>
                                        ) : (
                                            <span className="credit">
                                                {" "}&#x0002B;{" "}
                                                {effect.amount}{" "}
                                                <span className="smaller">
                                                    {getAssetCode(effect)}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="fade-extreme">
                                        <span className="micro-font">
                                            {effect.amount}
                                        </span>{" "}
                                        <span className="pico-font small-caps">
                                            XLM
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="payment-details-body">
                            <div>
                                <span className="payment-details-account">
                                    {pubKeyAbbr(effect.account)}
                                </span>
                                <div className="payment-details-fieldset">
                                    <div className="payment-details-memo">
                                        <span className="smaller">Memo:</span>
                                        {" "}
                                        {this.props.state.paymentDetails.memo}
                                    </div>
                                    <div className="payment-details-id">
                                        ID: {effect.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                break

            case "account_debited":
                humanizedEffectType = (
                    <div>
                        <div className="flex-row">
                            <div>
                                <i className="material-icons">{icon}</i>
                                <span>Acccount Debited </span>
                                <span className="account-direction">
                                    {effect.account ===
                                    this.props.appAuth.publicKey
                                        ? "Yours"
                                        : "Theirs"}
                                </span>
                            </div>
                            <div>
                                <div className="f-e-col">
                                    <div>
                                        {getAssetCode(effect) === "XLM" ? (
                                            <span className="debit">
                                                {" "}&#x02212;{" "}
                                                {currencyGlyph(
                                                    this.props
                                                        .accountInfo.currency
                                                )}{" "}
                                                {this.convertToFiat(
                                                    effect.amount
                                                )}
                                            </span>
                                        ) : (
                                            <span className="debit">
                                                {" "}&#x02212;{" "}
                                                {effect.amount}{" "}
                                                <span className="smaller">
                                                    {getAssetCode(effect)}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="fade-extreme">
                                        <span className="micro-font">
                                            {effect.amount}
                                        </span>
                                        {" "}
                                        <span className="pico-font small-caps">
                                            XLM
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="payment-details-body">
                            <div>
                                <span className="payment-details-account">
                                    {pubKeyAbbr(effect.account)}
                                </span>
                                <div className="payment-details-fieldset">
                                    <div className="payment-details-memo">
                                        <span className="smaller">Memo:</span>
                                        {" "}
                                        {this.props.state.paymentDetails.memo}
                                    </div>
                                    <div className="payment-details-id">
                                        ID: {effect.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                break

            case "signer_created":
                humanizedEffectType = (
                    <div>
                        <div className="flex-row">
                            <div>
                                <i className="material-icons">{icon}</i>
                                <span>Signer Created {emoji.pencil}</span>
                                {" "}
                                <span className="account-direction">
                                    {effect.public_key ===
                                    this.props.appAuth.publicKey
                                        ? "You"
                                        : "They"}
                                </span>
                            </div>
                            <div />
                        </div>
                        <div className="payment-details-body">
                            <div>
                                <span className="payment-details-account">
                                    {pubKeyAbbr(effect.account)}
                                </span>
                                <div className="payment-details-fieldset">
                                    <div className="payment-details-id">
                                        ID: {effect.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                break

            default:
                humanizedEffectType = effect.type
                break
        }

        return humanizedEffectType
    }


    // ...
    updateCursors = (records) =>
        this.props.setState({
            cursorLeft: records[0].paging_token,
            cursorRight: records[records.length - 1].paging_token,
        })


    // ...
    updateTransactionsCursors = (records) =>
        this.props.setState({
            txCursorLeft: records[0].paging_token,
            txCursorRight: records[records.length - 1].paging_token,
        })


    // ...
    getNextTransactionsPage = () =>
        this.stellarServer
            .transactions()
            .forAccount(this.props.appAuth.publicKey)
            .order("desc")
            .cursor(this.props.state.txCursorRight)
            .limit(5)
            .call()
            .then((transactionsResult) => {
                if (transactionsResult.records.length > 0) {
                    this.props.setState({
                        txPrevDisabled: false,
                    })
                    this.props.setAccountTransactions(transactionsResult)
                    this.updateTransactionsCursors(transactionsResult.records)
                } else {
                    this.noMoreTransactionsNotice.call(this, {
                        txNextDisabled: true,
                    })
                }
            })
            .catch(function (err) {
                // eslint-disable-next-line no-console
                console.log(err)
            })


    // ...
    getPrevTransactionsPage = () =>
        this.stellarServer
            .transactions()
            .forAccount(this.props.appAuth.publicKey)
            .order("asc")
            .cursor(this.props.state.txCursorLeft)
            .limit(5)
            .call()
            .then((transactionsResult) => {
                if (transactionsResult.records.length > 0) {
                    this.props.setState({
                        txNextDisabled: false,
                    })
                    transactionsResult.records.reverse()
                    this.props.setAccountTransactions(transactionsResult)
                    this.updateTransactionsCursors(transactionsResult.records)
                } else {
                    this.noMoreTransactionsNotice.call(this, {
                        txPrevDisabled: true,
                    })
                }
            })
            .catch(function (err) {
                // eslint-disable-next-line no-console
                console.log(err)
            })


    // ...
    determineLeftIcon = (payment) => {
        let rendered = ""

        switch (payment.type) {
            case "create_account":
                rendered =
                    payment.funder === this.props.appAuth.publicKey ?
                        <i className={
                            this.props.loginManager.isAuthenticated() ?
                                ("material-icons badge") :
                                ("material-icons")
                        }>card_giftcard</i> :
                        <i className={
                            this.props.loginManager.isAuthenticated() ?
                                ("material-icons badge") :
                                ("material-icons")
                        }>account_balance</i>
                break

            case "account_merge":
                rendered =
                    <i className={
                        this.props.loginManager.isAuthenticated() ?
                            ("material-icons badge") :
                            ("material-icons")
                    }>merge_type</i>
                break

            default:
                rendered =
                    payment.to === this.props.appAuth.publicKey ?
                        <i className={
                            this.props.loginManager.isAuthenticated() ?
                                ("material-icons badge") :
                                ("material-icons")
                        }>account_balance_wallet</i> :
                        <i className={
                            this.props.loginManager.isAuthenticated() ?
                                ("material-icons badge") :
                                ("material-icons")
                        }>payment</i>
                break
        }

        return rendered
    }


    // ...
    determinePrimaryText = (payment) => {
        let rendered = ""

        switch (payment.type) {
            case "create_account":
                rendered =
                    payment.funder === this.props.appAuth.publicKey ?
                        <span>
                            &#x02212;
                            {" "}
                            {currencyGlyph(
                                this.props.accountInfo.currency
                            )}
                            {" "}
                            {this.convertToFiat(payment.starting_balance)}
                        </span> :
                        <span>
                            &#x0002B;
                            {" "}
                            {currencyGlyph(
                                this.props.accountInfo.currency
                            )}
                            {" "}
                            {this.convertToFiat(payment.starting_balance)}
                        </span>
                break

            case "account_merge":
                rendered = "Account Merged"
                break

            default:
                if (getAssetCode(payment) === "XLM") {
                    rendered =
                        payment.to === this.props.appAuth.publicKey ?
                            <span>
                                &#x0002B;
                                {" "}
                                {currencyGlyph(
                                    this.props.accountInfo.currency
                                )}
                                {" "}
                                {this.convertToFiat(payment.amount)}
                            </span> :
                            <span>
                                &#x02212;
                                {" "}
                                {currencyGlyph(
                                    this.props.accountInfo.currency
                                )}
                                {" "}
                                {this.convertToFiat(payment.amount)}
                            </span>
                } else {
                    rendered =
                        payment.to === this.props.appAuth.publicKey ?
                            <span>
                                &#x0002B;
                                {" "}
                                {payment.amount}
                                {" "}
                                {getAssetCode(payment)}
                            </span> :
                            <span>
                                &#x02212;
                                {" "}
                                {payment.amount}
                                {" "}
                                {getAssetCode(payment)}
                            </span>
                }
                break
        }

        return rendered
    }


    // ...
    convertToXLM = (amount) => {
        BigNumber.config({ DECIMAL_PLACES: 7, ROUNDING_MODE: 4, })
        const fiatAmount = new BigNumber(amount)

        if (
            this.props.accountInfo.rates  &&
            this.props.accountInfo.rates[this.props.accountInfo.currency]
        ) {
            return fiatAmount.dividedBy(
                this.props.accountInfo.rates[
                    this.props.accountInfo.currency
                ].rate
            ).toString()
        }

        return "0"
    }


    // ...
    convertToFiat = (amount) => {
        BigNumber.config({ DECIMAL_PLACES: 2, })
        const nativeAmount = new BigNumber(amount)

        if (
            this.props.accountInfo.rates  &&
            this.props.accountInfo.rates[this.props.accountInfo.currency]
        ) {
            return nativeAmount.multipliedBy(
                this.props.accountInfo.rates[
                    this.props.accountInfo.currency
                ].rate
            ).toFixed(2)
        }

        return "0"
    }


    // ...
    render = () =>
        <div>
            <Snackbar
                open={this.props.state.sbPayment}
                message={`${this.props.state.sbPaymentText} ${
                    this.props.state.sbPaymentAmount
                } ${this.props.state.sbPaymentAssetCode}`}
                onRequestClose={
                    this.handlePaymentSnackbarClose
                }
            />
            <Snackbar
                open={this.props.state.sbNoMorePayments}
                message="No more payments found."
                onRequestClose={
                    this.handleNoMorePaymentsSnackbarClose
                }
            />
            <Snackbar
                open={this.props.state.sbNoMoreTransactions}
                message="No more transactions found."
                onRequestClose={
                    this.handleNoMoreTransactionsSnackbarClose
                }
            />

            <Tabs
                tabItemContainerStyle={styles.container}
                inkBarStyle={styles.inkBar}
                value={this.props.ui.tabs.payments}
                onChange={this.handleTabSelect.bind(this, this.value)}
            >

                <Tab style={styles.tab} label="History" value="1">
                    <div className="tab-content">

                        <PaymentsHistory
                            stellarServer={this.stellarServer}
                            paymentDetails={this.props.state.paymentDetails}
                            handlePaymentClick={this.handlePaymentClick}
                            determineLeftIcon={this.determineLeftIcon}
                            determinePrimaryText={this.determinePrimaryText}
                            nextDisabled={this.props.state.nextDisabled}
                            prevDisabled={this.props.state.prevDisabled}
                            decodeEffectType={this.decodeEffectType}
                            updateCursors={this.updateCursors}
                        />

                    </div>
                </Tab>

                <Tab style={styles.tab} label="Transactions" value="2">
                    <div className="tab-content">

                        <Transactions
                            getPrevTransactionsPage={this.getPrevTransactionsPage}
                            getNextTransactionsPage={this.getNextTransactionsPage}
                            txNextDisabled={this.props.state.txNextDisabled}
                            txPrevDisabled={this.props.state.txPrevDisabled}
                        />

                    </div>
                </Tab>

            </Tabs>
        </div>

}


// ...
export default withLoginManager(connect(
    // map state to props.
    (state) => ({
        state: state.Payments,

        accountInfo: state.accountInfo,
        loadingModal: state.loadingModal,
        ui: state.ui,
        isAuthenticated: state.auth.isAuthenticated,
        appAuth: state.appAuth,
    }),

    // map dispatch to props.
    (dispatch) => bindActionCreators({
        setState: PaymentsAction.setState,

        setAccountPayments,
        setAccountTransactions,
        setStreamer,
        accountExistsOnLedger,
        accountMissingOnLedger,
        setTab,
        setModalLoading,
        setModalLoaded,
        updateLoadingMessage,
    }, dispatch)
)(Payments))
