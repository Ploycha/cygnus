import React, { Component } from "react"
import PropTypes from "prop-types"
import {
    bindActionCreators,
    compose,
} from "redux"
import { connect } from "react-redux"
import Axios from "axios"
import { config } from "../../config"
import {
    gravatar,
    gravatarSize
} from "../StellarFox/env"
import Input from "../../lib/common/Input"
import Button from "../../lib/mui-v1/Button"
import Divider from "../../lib/mui-v1/Divider"
import MD5 from "../../lib/md5"
import {
    emailValid,
    federationIsAliasOnly,
} from "../../lib/utils"
import { action as AccountAction } from "../../redux/Account"
import { action as SnackbarAction } from "../../redux/Snackbar"
import { withLoginManager } from "../LoginManager"




// <Profile> component
class Profile extends Component {

    // ...
    static propTypes = {
        setState: PropTypes.func.isRequired,
    }


    // ...
    componentDidMount = () => {
        if (this.props.loginManager.isAuthenticated()) {
            this.getUserData()
            this.getAccountData()
        }
    }


    // ...
    getUserData = () => Axios
        .post(`${config.api}/user/`, {
            id: this.props.userId,
            token: this.props.token,
        })
        .then(({data: {data,},}) => {
            this.props.setState({
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                email: data.email,
                gravatarPath: this.setGravatarPath(data.email),
            })
        })
        // eslint-disable-next-line no-console
        .catch(error => console.log(error.message))


    // ...
    getAccountData = () => Axios
        .post(`${config.api}/account/`, {
            id: this.props.userId,
            token: this.props.token,
        })
        .then(({data: {data,},}) => {
            this.props.setState({
                paymentAddress: (data.alias  &&  data.domain) ?
                    `${data.alias}*${data.domain}` : "",
                discoverable: data.visible,
                memo: data.memo,
            })
        })
        // eslint-disable-next-line no-console
        .catch(error => console.log(error.message))


    // ...
    setGravatarPath = (email) =>
        `${gravatar}${MD5(email)}${gravatarSize}`


    // ...
    updateResource = async (resource, attr) => Axios
        .post(`${config.api}/${resource}/update/`, {
            ...attr,
            id: this.props.userId,
            token: this.props.token,
        })
        // eslint-disable-next-line no-console
        .catch(error => console.log(error))


    // ...
    updateProfile = async () => {
        const
            alias = this.props.state.paymentAddress.match(/\*/) ?
                (this.props.state.paymentAddress) :
                (`${this.props.state.paymentAddress}*stellarfox.net`),

            memo_type = this.props.state.memo.length > 0 ? "text" : null,

            memo = this.props.state.memo

        await this.updateResource("user",{
            first_name: this.props.state.firstName,
            last_name: this.props.state.lastName,
        })

        await this.updateResource("account", {
            alias,
            memo_type,
            memo,
        })
        this.props.popupSnackbar("User profile has been updated.")
    }


    // ...
    changeFirstName = (event) =>
        this.props.setState({ firstName: event.target.value, })


    // ...
    changeLastName = (event) =>
        this.props.setState({ lastName: event.target.value, })


    // ...
    changePaymentAddress = (event) =>
        this.props.setState({paymentAddress: event.target.value,})
    
    
    // ...
    changeMemo = (event) =>
        this.props.setState({memo: event.target.value,})


    // ...
    changeEmail = (event) => {
        if (emailValid(event.target.value)) {
            this.props.setState({
                gravatarPath: this.setGravatarPath(event.target.value),
            })
        }
        this.props.setState({ email: event.target.value, })
    }


    // ...
    render = () =>
        <div className="tab-content">
            <div className="f-b space-between">
                <div>
                    <h2 className="tab-content-headline">
                        Account Profile
                    </h2>
                    <div className="account-title">
                        Manage your profile details.
                    </div>
                    <div className="account-subtitle">
                        The details of your account profile are
                        confidential and contribute to KYC/AML
                        compliance. Any changes to the following fields
                        will require your digital signature.
                    </div>
                </div>
                <figure style={{ marginRight: "0px", marginBottom: "0px",}}>
                    <img
                        className="image"
                        src={this.props.state.gravatarPath}
                        alt="Gravatar"
                    />
                </figure>
            </div>
            <Input
                width="100%"
                className="lcars-input p-b p-t-large"
                value={this.props.state.firstName}
                label="First Name"
                inputType="text"
                maxLength="100"
                autoComplete="off"
                handleChange={this.changeFirstName}
                subLabel={`First Name: ${this.props.state.firstName}`}
            />
            <Input
                className="lcars-input p-b p-t"
                value={this.props.state.lastName}
                label="Last Name"
                inputType="text"
                maxLength="100"
                autoComplete="off"
                handleChange={this.changeLastName}
                subLabel={`Last Name: ${this.props.state.lastName}`}
            />
            <Input
                className="lcars-input p-b-large p-t"
                value={this.props.state.email}
                label="Email"
                inputType="text"
                maxLength="100"
                autoComplete="off"
                handleChange={this.changeEmail}
                subLabel={`Email: ${this.props.state.email}`}
            />
            <Divider color="secondary" />
            <div className="f-b space-between">
                <div>
                    <h2 className="tab-content-headline">
                        Payment Address
                    </h2>
                    <div className="account-title">
                        Manage your payment address details.
                    </div>
                    <div className="account-subtitle">
                        Your payment address is visible
                        to the public by default. Any changes to the following
                        settings will require your digital signature.
                    </div>
                </div>
            </div>
            <Input
                className="lcars-input p-t-large p-b"
                value={this.props.state.paymentAddress}
                label="Payment Address Alias"
                inputType="text"
                maxLength="100"
                autoComplete="off"
                handleChange={this.changePaymentAddress}
                subLabel={
                    federationIsAliasOnly(this.props.state.paymentAddress)
                        ? `Payment Address: ${
                            this.props.state
                                .paymentAddress
                        }*stellarfox.net`
                        : `Payment Address: ${
                            this.props.state
                                .paymentAddress
                        }`
                }
            />
            <Input
                className="lcars-input p-t p-b-large"
                value={this.props.state.memo}
                label="Memo"
                inputType="text"
                maxLength="28"
                autoComplete="off"
                handleChange={this.changeMemo}
                subLabel={`Memo: ${this.props.state.memo}`}
            />
            <Button color="secondary" onClick={this.updateProfile}>
                Update
            </Button>
        </div>
}


// ...
export default compose(
    withLoginManager,
    connect(
        // bind state to props.
        (state) => ({
            state: state.Account,
            token: state.LoginManager.token,
            userId: state.LoginManager.userId,
        }),
        // bind dispatch to props.
        (dispatch) => bindActionCreators({
            setState: AccountAction.setState,
            popupSnackbar: SnackbarAction.popupSnackbar,
        }, dispatch)
    )
)(Profile)
