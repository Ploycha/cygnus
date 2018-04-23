import React, { Component } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import { action as LedgerHQAction } from "../../redux/LedgerHQ"
import { action as LoadingModalAction } from "../../redux/LoadingModal"

import {
    htmlEntities as he,
    fedToPub,
    invalidPaymentAddressMessage,
} from "../../lib/utils"
import { stellarFoundationLink } from "../StellarFox/env"

import Panel from "../Panel"
import InputField from "../../lib/common/InputField"
import Button from "../../lib/common/Button"




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




// <PanelExplorer> component
class PanelExplorer extends Component {


    // ...
    compoundFederationValidator = () => (
        (addressValidity) => addressValidity !== "" ?
            this.input.setState({error: addressValidity,}) :
            this.enterExplorer.call(this)
    )(invalidPaymentAddressMessage(this.input.state.value))


    // ...
    enterExplorer = async () => {
        const textInputValue = this.input.state.value

        /**
         * textInputValue is either VALID federation or VALID pubkey
         * check for '*' character - if present then it is federation address
         * otherwise a public key
         */
        if (textInputValue.match(/\*/)) {
            try {
                this.props.showLoadingModal("Looking up Payment Address ...")
                this.props.setLedgerPublicKey(await fedToPub(textInputValue))
                this.props.showLoadingModal("Searching for Account ...")
            } catch (error) {
                this.props.hideLoadingModal()
                this.input.setState({
                    error: error.message,
                })
            }
        }
        // Input is a valid Stellar public key
        else {
            this.props.setLedgerPublicKey(textInputValue)
        }

    }


    // ...
    render = () =>
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
                        <em>Payment Address</em>.
                    </div>
                    <div className="title-small p-t p-b">
                        Your account operations are
                        publicly accessible on the
                        global ledger. Anyone who
                        knows your account number or
                        payment address can view
                        your public transactions.
                    </div>
                    <div className="f-b">
                        <div className="f-e-col">
                            <InputField
                                name="payment-address-input"
                                type="text"
                                placeholder="Payment Address"
                                styles={styles}
                                ref={(self) => {
                                    this.input = self
                                }}
                            />
                            <div className="p-t"></div>
                            <Button
                                onClick={this.compoundFederationValidator}
                                backgroundColor="rgb(244,176,4)"
                                label="Check"
                                secondary={true}
                                fullWidth={true}
                            />
                        </div>
                    </div>
                    <div className="p-t micro-font fade-strong">
                        “Stellar” is a trademark of the<he.Nbsp />
                        <a href={stellarFoundationLink} target="_blank">
                            Stellar Development Foundation
                        </a>.
                    </div>
                </div>
            }
        />
}


// ...
export default connect(
    // map state to props.
    (_state) => ({}),
    // map dispatch to props.
    (dispatch) => bindActionCreators({
        setLedgerPublicKey: LedgerHQAction.setPublicKey,
        showLoadingModal: LoadingModalAction.showLoadingModal,
        hideLoadingModal: LoadingModalAction.hideLoadingModal,
    }, dispatch)
)(PanelExplorer)
