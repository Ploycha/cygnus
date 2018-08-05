import React, { Component, Fragment } from "react"
import { withStyles } from "@material-ui/core/styles"
import { bindActionCreators, compose } from "redux"
import { connect } from "react-redux"
import { emptyString, shorten } from "@xcmats/js-toolbox"
import ReducedContactSuggester from "./ReducedContactSuggester"
import InputField from "../../lib/mui-v1/InputField"
import Button from "../../lib/mui-v1/Button"
import { CircularProgress, Typography } from "@material-ui/core"
import { action as BalancesAction } from "../../redux/Balances"
import { action as ModalAction } from "../../redux/Modal"
import Avatar from "@material-ui/core/Avatar"
import {
    loadAccount,
    buildAssetPaymentTx,
    assetBalance,
    submitTransaction,
} from "../../lib/stellar-tx"
import {
    insertPathIndex,
    htmlEntities as he,
    StellarSdk,
} from "../../lib/utils"
import { signTransaction, getSoftwareVersion } from "../../lib/ledger"
import clone from "lodash/clone"
import BigNumber from "bignumber.js"
import { gravatar, gravatarSize } from "../StellarFox/env"
import md5 from "../../lib/md5"


// ...
const styles = (theme) => ({
    root: {
        borderRadius: 3,
        width: 96,
        height: 96,
        minWidth: 0,
        border: `2px solid ${theme.palette.primary.fade}`,
        marginBottom: "3px",
        opacity: "0.95 !important",
    },
    img: {
        width: 96,
        height: 96,
        minWidth: 96,
        borderRadius: "5px",
        border: `3px solid ${theme.palette.secondary.light}`,
    },
})



// ...
export default compose(
    withStyles(styles),
    connect(
        // map state to props.
        (state) => ({
            asset: state.Assets.selected,
            userId: state.LoginManager.userId,
            token: state.LoginManager.token,
            amount: state.Balances.amount,
            payee: state.Balances.payee,
            payeeEmailMD5: state.Balances.payeeEmailMD5,
            payeeFullName: state.Balances.payeeFullName,
            horizon: state.StellarAccount.horizon,
            memoText: state.Balances.memoText,
            publicKey: state.LedgerHQ.publicKey,
            bip32Path: state.LedgerHQ.bip32Path,
            transactionAsset: state.Balances.transactionAsset,

        }),
        // match dispatch to props.
        (dispatch) => bindActionCreators({
            setState: BalancesAction.setState,
            resetState: BalancesAction.resetState,
            showModal: ModalAction.showModal,
        }, dispatch)
    ),
    withStyles((theme) => ({
        root: theme.mixins.gutters({
            paddingTop: 16,
            paddingBottom: 16,
            minWidth: 250,
            backgroundColor: theme.palette.secondary.main,
            opacity: "0.7",
        }),

        img: {
            borderRadius: 3,
            width: 48,
            height: 48,
            border: `1px solid ${theme.palette.secondary.dark}`,
        },

    }))
)(
    class extends Component {

        // ...
        state = {
            error: false,
            errorMessage: emptyString(),
            inProgress: false,
            statusMessage: emptyString(),
        }


        // ...
        componentDidMount = () => {
            this.props.resetState()
            this.setState({
                availableBalance: new BigNumber(
                    this.props.asset.balance
                ).toFixed(2),
            })
        }


        // ...
        updateInputValue = (event) => {

            const currentBalance = new BigNumber(this.props.asset.balance),
                availableBalance = new BigNumber(
                    this.props.asset.balance
                ).minus(event.target.value)


            if (!/^(\d+)([.](\d{0,2}))?$/.test(event.target.value)) {
                this.setState({
                    error: true,
                    errorMessage: "Invalid amount entered.",
                    availableBalance: currentBalance.toFixed(2),
                })
                this.props.setState({
                    amount: emptyString(),
                    transactionAsset: null,
                })
            }
            else if (availableBalance.isLessThan(0)) {
                this.setState({
                    error: true,
                    errorMessage: "Not enough funds available.",
                    availableBalance: currentBalance.toFixed(2),
                })
                this.props.setState({
                    amount: emptyString(),
                    transactionAsset: null,
                })
            }
            else if (availableBalance.isEqualTo(currentBalance)) {
                this.setState({
                    error: true,
                    errorMessage: "Amount needs to be greater than 0.00",
                    availableBalance: currentBalance.toFixed(2),
                })
                this.props.setState({
                    amount: emptyString(),
                    transactionAsset: null,
                })
            }
            else {
                this.setState({
                    error: false,
                    errorMessage: emptyString(),
                    availableBalance: availableBalance.toFixed(2),
                })
                this.props.setState({
                    amount: event.target.value,
                    transactionAsset: clone(this.props.asset),
                })
            }
        }


        // ...
        sendAsset = async () => {

            this.props.setState({
                cancelEnabled: false,
            })

            this.setState({
                inProgress: true,
                statusMessage: "Fetching account info ...",
            })

            let availableAssetBalance = null

            const paymentData = {
                source: this.props.publicKey,
                destination: this.props.payee,
                amount: this.props.amount,
                memo: this.props.memoText,
                network: this.props.horizon,
                assetCode: this.props.asset.asset_code,
                assetIssuer: this.props.asset.asset_issuer,
            }

            const account = await loadAccount(
                this.props.payee, this.props.horizon
            )

            const asset = new StellarSdk.Asset(
                this.props.asset.asset_code,
                this.props.asset.asset_issuer
            )

            try {
                availableAssetBalance = assetBalance(account, asset)
            } catch (error) {
                this.props.setState({
                    cancelEnabled: true,
                })

                this.setState({
                    inProgress: false,
                    statusMessage: error.message,
                })
                return Promise.resolve({
                    error: true, message: error.message,
                })
            }

            if (availableAssetBalance) {
                let tx = await buildAssetPaymentTx(paymentData)

                this.setState({
                    statusMessage: "Waiting for device ...",
                })

                try {
                    await getSoftwareVersion()

                    this.setState({
                        statusMessage: "Awaiting signature ...",
                    })

                    const signedTx = await signTransaction(
                        insertPathIndex(this.props.bip32Path),
                        this.props.publicKey,
                        tx
                    )

                    this.setState({
                        statusMessage: "Sending transaction ...",
                    })

                    const broadcast = await submitTransaction(
                        signedTx, this.props.horizon
                    )

                    await this.props.setState({
                        paymentId: broadcast.hash,
                        ledgerId: broadcast.ledger,
                        transactionType: null,
                    })

                    await this.setState({
                        inProgress: false,
                        statusMessage: emptyString(),
                    })

                    this.props.showModal("txCustomAssetComplete")


                } catch (error) {
                    this.props.setState({
                        cancelEnabled: true,
                    })

                    this.setState({
                        inProgress: false,
                        statusMessage: error.message,
                    })
                    return Promise.resolve({
                        error: true, message: error.message,
                    })
                }

            }

            this.props.setState({
                cancelEnabled: true,
            })

            return Promise.resolve({ ok: true, })
        }



        // ...
        render = () => (
            ({ amount, asset, assetManager, classes, payeeEmailMD5, payeeFullName, }) =>
                <Fragment>
                    {asset &&
                        <div className="flex-box-row space-between">
                            <div className="flex-box-col items-flex-start">
                                <div className="flex-box-row items-centered">
                                    <Avatar src={asset.avatar} /><he.Nbsp /><he.Nbsp />
                                    <Typography variant="subheading" color="primary">
                                        Send<he.Nbsp />
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                textShadow: "0px 0px 2px rgba(15, 46, 83, 0.35)",
                                            }}
                                        >
                                            {assetManager.getAssetDescription(
                                                asset.asset_code.toLowerCase()
                                            )}
                                        </span> to:
                                    </Typography>
                                </div>

                                <ReducedContactSuggester />
                                <div className="p-t-large flex-box-row items-flex-end">
                                    <div>
                                        <InputField
                                            id="payment-amount"
                                            type="text"
                                            label={`${
                                                assetManager.getAssetGlyph(
                                                    asset.asset_code.toLowerCase()
                                                )
                                            } Amount`}
                                            color="primary"
                                            error={this.state.error}
                                            errorMessage={this.state.errorMessage}
                                            onChange={this.updateInputValue}
                                        />
                                        <Typography variant="caption" color="primary">
                                        Available Balance: {assetManager.getAssetGlyph(
                                                asset.asset_code.toLowerCase()
                                            )} {this.state.availableBalance}
                                        </Typography>
                                    </div>
                                    <div className="p-l-large" style={{ paddingBottom: "1.2rem", }}>
                                        <Button
                                            color="primary"
                                            onClick={this.sendAsset}
                                            disabled={this.props.amount === emptyString() || !this.props.payee}
                                        >
                                            {this.state.inProgress ? <CircularProgress
                                                color="secondary" thickness={4} size={20}
                                            /> : "Sign & Send"}
                                        </Button>
                                        <Typography variant="caption" color="primary">
                                            {this.state.statusMessage ?
                                                this.state.statusMessage : <he.Nbsp />
                                            }
                                        </Typography>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Typography align="center" variant="body2" color="primary">
                                    Recipient
                                </Typography>
                                <Avatar classes={{
                                    root: classes.root, img: classes.img,
                                }} src={`${gravatar}${payeeEmailMD5 ?
                                    payeeEmailMD5 : this.props.payee ?
                                        md5(this.props.payee) : emptyString()
                                }?${gravatarSize}&d=robohash`
                                }
                                />
                                <Typography align="center" variant="body1" color="primary">
                                    {shorten(payeeFullName, 12, shorten.END)}
                                </Typography>
                                <Typography align="center" variant="subheading" color="primary">
                                    {assetManager.getAssetGlyph(
                                        asset.asset_code.toLowerCase()
                                    )} {new BigNumber(amount || 0).toFixed(2)}
                                </Typography>
                            </div>
                        </div>
                    }
                </Fragment>
        )(this.props)
    }
)
