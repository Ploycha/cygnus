import React, { Component } from "react"
import PropTypes from "prop-types"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton"
import Button from "../../lib/common/Button"
import Toggle from "../../lib/common/Toggle"
import { appName } from "../StellarFox/env"
import { action as AccountAction } from "../../redux/Account"
import { withLoginManager } from "../LoginManager"
import { withAssetManager } from "../AssetManager"



// <Settings> component
class Settings extends Component {

    // ...
    static propTypes = {
        setState: PropTypes.func.isRequired,
    }


    // ...
    updateExchangeRate = () => {
        // eslint-disable-next-line no-console
        console.log("TODO: handle action")
        this.props.assetManager.updateExchangeRate()
    }


    // ...
    render = () =>
        <div className="tab-content">
            <div className="f-b space-between">
                <div>
                    <h2 className="tab-content-headline">Account Settings</h2>
                    <div className="account-title">
                        Adjust settings for your account.
                    </div>
                    <div className="account-subtitle">
                        General account settings. This
                        configuration specifies how the account related
                        views are displayed to the user.
                    </div>
                </div>
            </div>

            <div className="account-title p-t-large">
                Extended Account Number:
            </div>
            <div className="account-subtitle m-t-small">
                <span className="bg-green">
                    {this.props.appAuth.publicKey}
                </span>
            </div>
            <div className="account-title p-t-large">
                Display Currency:
            </div>
            <div className="account-subtitle">
                Choose the currency you want to use in your
                account.
            </div>
            <RadioButtonGroup
                onChange={this.updateExchangeRate}
                className="account-radio-group m-t"
                name="currencySelect"
                defaultSelected={this.props.accountInfo.currency}
            >
                <RadioButton
                    className="p-b-small"
                    value="eur"
                    label="Euro [EUR]"
                    labelStyle={{ color: "rgba(244,176,4,0.9)", }}
                    iconStyle={{ fill: "rgba(244,176,4,1)", }}
                />
                <RadioButton
                    className="p-b-small"
                    value="usd"
                    label="U.S. Dollar [USD]"
                    labelStyle={{ color: "rgba(244,176,4,0.9)", }}
                    iconStyle={{ fill: "rgba(244,176,4,1)", }}
                />
                <RadioButton
                    className="p-b-small"
                    value="aud"
                    label="Australian Dollar [AUD]"
                    labelStyle={{ color: "rgba(244,176,4,0.9)", }}
                    iconStyle={{ fill: "rgba(244,176,4,1)", }}
                />
                <RadioButton
                    className="p-b-small"
                    value="nzd"
                    label="New Zealand Dollar [NZD]"
                    labelStyle={{ color: "rgba(244,176,4,0.9)", }}
                    iconStyle={{ fill: "rgba(244,176,4,1)", }}
                />
                <RadioButton
                    className="p-b-small"
                    value="pln"
                    label="Polish Złoty [PLN]"
                    labelStyle={{ color: "rgba(244,176,4,0.9)", }}
                    iconStyle={{ fill: "rgba(244,176,4,1)", }}
                />
                <RadioButton
                    value="thb"
                    label="Thai Baht [THB]"
                    labelStyle={{ color: "rgba(244,176,4,0.9)", }}
                    iconStyle={{ fill: "rgba(244,176,4,1)", }}
                />
            </RadioButtonGroup>

            {!this.props.accountInfo.registered &&
                !this.props.loginManager.isExploreOnly() ?
                <div>
                    <div className="p-t p-b" />
                    <div className="account-title p-t">
                        Register this account with {appName}:
                    </div>
                    <div className="account-subtitle">
                        Get access to unique services and
                        remittance service.
                    </div>
                    <div className="p-b" />
                    <Button
                        label="Register"
                        secondary={true}
                        onClick={this.showSignupModal}
                    />
                </div> : null}

            {this.props.loginManager.isAuthenticated() ? (

                <div className="m-t-large f-b space-between outline">
                    <div>
                        <div className="account-title">
                            Make Account Discoverable
                        </div>
                        <div className="account-subtitle">
                            Your account number will be
                            publicly discoverable and can be
                            found by others via your payment
                            address.
                        </div>
                    </div>
                    <div>
                        <Toggle
                            defaultToggled={this.props.state.discoverable}
                            onToggle={this.changeAccountDiscoverability}
                        />
                    </div>
                </div>

            ) : null}
        </div>
}

export default withLoginManager(withAssetManager(connect(
    // bind state to props.
    (state) => ({
        state: state.Account,
        appAuth: state.appAuth,
        accountInfo: state.accountInfo,
    }),

    // bind dispatch to props.
    (dispatch) => bindActionCreators({
        setState: AccountAction.setState,
    }, dispatch)
)(Settings)))