import React, { Component } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import { string } from "@xcmats/js-toolbox"
import { Typography } from "@material-ui/core"
import { bip32Prefix } from "../StellarFox/env"
import { getPublicKey } from "../../lib/ledger"

import Input from "../../lib/common/Input"
import Button from "../../lib/mui-v1/Button"
import Switch from "../../lib/mui-v1/Switch"

import { action as LedgerHQAction } from "../../redux/LedgerHQ"




// <LedgerAuthenticator> component
class LedgerAuthenticator extends Component {

    // ...
    state = {
        derivationPath: "0",
        pathEditable: false,
        useDefaultAccount: true,
        buttonDisabled: false,
        status: string.empty(),
    }


    // ...
    componentDidMount = () => this.props.resetLedgerState()


    // ...
    initQueryDevice = async () => {
        let bip32Path = this.formBip32Path(),
            softwareVersion = null,
            publicKey = null
        this.setState({
            buttonDisabled: true,
            status: "Waiting for device ...",
        })
        try {
            softwareVersion = await this.props.getSoftwareVersion()
            publicKey = await getPublicKey(bip32Path)
        } catch (ex) {
            this.setState({
                buttonDisabled: false,
                status: `${ex.message}`,
            })
            this.props.onConnected.call(this, {
                publicKey: null,
                softwareVersion: null,
                bip32Path: null,
                errorMessage: ex.message,
            })
            return false
        }
        this.setState({ status: `Connected. Version: ${softwareVersion}` })
        this.props.onConnected.call(this, {
            publicKey,
            softwareVersion,
            bip32Path: this.state.derivationPath,
            errorMessage: null,
        })
    }


    // ...
    errorCodeToUserMessage = (code) => {
        let message = string.empty()
        switch (code) {
            case 26625:
                message =
                    "Ledger is autolocked. Please unlock it first."
                break
            case "U2F_5":
                message =
                    "Ledger sign in timeout. " +
                    "Device turned off or disconnected."
                break
            default:
                break
        }
        return message
    }


    // ...
    formBip32Path = () =>
        this.state.derivationPath === string.empty() ?
            `${bip32Prefix}0'` :
            `${bip32Prefix}${this.state.derivationPath}'`


    // ...
    handlePathChange = (event) => {
        event.persist()
        if (isNaN(event.target.value)) {
            return false
        } else {
            this.setState({ derivationPath: event.target.value })
        }
    }


    // ...
    handleCheckboxClick = (event) => {
        event.persist()
        this.setState({
            useDefaultAccount: event.target.checked,
            pathEditable: !event.target.checked,
        })
        // reset derivation path to 0
        if (event.target.checked) {
            this.setState({ derivationPath: "0" })
        }
    }


    // ...
    render = () =>
        <div className="flex-box-col items-centered content-centered">
            <div className="m-t m-b flex-box-row items-centered content-centered">
                <Typography variant="body2" color={
                    this.props.className.match(/reverse/) ?
                        "primary" : "secondary"
                }
                >
                    Use default account
                </Typography>
                <Switch
                    checked={this.state.useDefaultAccount}
                    onChange={this.handleCheckboxClick}
                    color={
                        this.props.className.match(/reverse/) ?
                            "primary" : "secondary"
                    }
                />
            </div>

            { this.state.pathEditable &&
                <Input
                    style={{ marginBottom: "1rem" }}
                    className={this.props.className}
                    label="Account Index"
                    inputType="text"
                    maxLength="5"
                    autoComplete="off"
                    value={this.state.derivationPath}
                    handleChange={this.handlePathChange}
                    subLabel={`Account Derivation Path: [${
                        bip32Prefix
                    }${this.state.derivationPath}']`}
                />
            }

            <Button
                disabled={this.state.buttonDisabled}
                onClick={this.initQueryDevice}
                color={
                    this.props.className.match(/reverse/) ?
                        "primary" : "secondary"
                }
            >
                Authenticate
            </Button>

            
            <Typography style={{marginTop: "0.5rem"}} variant="caption" color={
                this.props.className.match(/reverse/) ?
                    "primary" : "secondary"
            }
            >{this.state.status}</Typography>
            
        </div>


}


// ...
export default connect(
    // map state to props.
    (state) => ({
        LedgerHQ: state.LedgerHQ,
    }),
    // map dispatch to props.
    (dispatch) => bindActionCreators({
        getSoftwareVersion: LedgerHQAction.getSoftwareVersion,
        resetLedgerState: LedgerHQAction.resetState,
    }, dispatch)
)(LedgerAuthenticator)
