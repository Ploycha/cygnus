import React, { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import axios from "axios"
import md5 from "../../lib/md5"

import {
    emailValid,
    passwordValid,
} from "../../lib/utils"
import { config } from "../../config"
import { awaitConnection } from "../../lib/ledger"

import {
    Step,
    Stepper,
    StepLabel,
    StepContent,
} from "material-ui/Stepper"
import LinearProgress from "material-ui/LinearProgress"
import RaisedButton from "material-ui/RaisedButton"
import FlatButton from "material-ui/FlatButton"
import InputField from "../../frontend/InputField"
import {
    setAccountRegistered,
    changeLoginState,
    ActionConstants,
} from "../../actions/index"




// ...
class NewAccount extends Component {

    // ...
    state = {
        finished: false,
        stepIndex: 0,
        email: "",
        password: "",
        accountCreated: false,
        progressCompleted: 0,
        progressText: "",
        progressError: "",
    }


    // ...
    handleNext = () => {
        const { stepIndex, } = this.state

        this.setState({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 1,
        })

        if (stepIndex >= 1) {
            this.props.onComplete({
                loginState: ActionConstants.LOGGED_IN,
                publicKey: this.props.appAuth.publicKey,
                bip32Path: this.props.appAuth.bip32Path,
                userId: this.props.appAuth.userId,
                token: this.props.appAuth.token,
            })
        }
    }


    // ...
    handlePrev = () => {
        const { stepIndex, } = this.state

        if (stepIndex > 0) {
            this.setState({ stepIndex: stepIndex - 1, })
        }
    }


    // ...
    progress = (completed) => {
        if (completed > 100) {
            this.setState({
                completed: 100,
            })
        } else {
            this.setState({ completed, })
        }
    }


    // ...
    createAccount = async () => {
        this.setState({
            completed: 1,
            progressText: "Querying device ...",
        })

        const softwareVersion = await awaitConnection()

        if (typeof softwareVersion !== "string") {
            this.setState({
                completed: 0,
                progressText: softwareVersion.message,
            })
            return false
        }

        await new Promise((res, _) => {
            this.setState({
                completed: 33,
                progressText: "Creating user ...",
            })
            setTimeout(res, 500)
        })

        const userId = await axios
            .post(
                `${config.api}/user/create/`, {
                    email: this.state.email,
                    password: this.state.password,
                }
            )
            .then((response) => {
                return response.data.id
            })
            .catch((error) => {
                this.setState({
                    progressError: error.message,
                })
                // eslint-disable-next-line no-console
                console.log(error)
                return null
            })

        await new Promise((res, _) => {
            this.setState({
                completed: 66,
                progressText: "Creating account ...",
            })
            setTimeout(res, 500)
        })

        if (userId) {
            const accountId = await axios
                .post(
                    `${config.api}/account/create/${
                        userId
                    }/${this.props.appAuth.publicKey}?path=${
                        this.props.appAuth.bip32Path
                    }&md5=${md5(this.state.email)}`
                )
                .then((response) => {
                    return response.data.account_id
                })
                .catch((error) => {
                    this.setState({
                        progressError: error.message,
                    })
                    // eslint-disable-next-line no-console
                    console.log(error)
                    return null
                })

            if (accountId) {
                this.setState({
                    accountCreated: true,
                    completed: 100,
                })
                this.props.setAccountRegistered(true)
            }
        }

        await new Promise((res, _) => {
            this.setState({
                completed: 100,
                progressText: "Completed.",
            })
            setTimeout(res, 500)
        })

        await axios
            .post(`${config.api}/user/authenticate/`, {
                email: this.state.email,
                password: this.state.password,
            })
            .then((response) => {
                this.props.setAccountRegistered(true)
                this.props.changeLoginState({
                    loginState: ActionConstants.LOGGED_IN,
                    publicKey: response.data.pubkey,
                    bip32Path: response.data.bip32Path,
                    userId: response.data.user_id,
                    token: response.data.token,
                })
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error.response.statusText)
            })

        this.handleNext.call(this)
    }


    // ...
    renderStepActions = (step) => {
        const { stepIndex, } = this.state

        return (
            <div style={{ margin: "12px 0", }}>
                {step === 0 && (
                    <RaisedButton
                        label="Next"
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        backgroundColor="rgb(15,46,83)"
                        labelColor="rgb(244,176,4)"
                        onClick={this.compoundValidate}
                        style={{ marginRight: 12, }}
                    />
                )}
                {step === 1 && (
                    <div>
                        <div className="p-b-small">
                            <span className="credit">{this.state.email}</span>
                        </div>
                        <div className="small">
                            will be associated with account
                            {" "}
                            <strong>{this.props.appAuth.bip32Path}</strong>
                            {" "}
                            on your Ledger device.
                        </div>
                        <div className="p-t"></div>
                        <RaisedButton
                            label="Register"
                            disableTouchRipple={true}
                            disableFocusRipple={true}
                            backgroundColor="rgb(15,46,83)"
                            labelColor="rgb(244,176,4)"
                            onClick={this.createAccount}
                            style={{ marginRight: 12, }}
                        />
                        <FlatButton
                            label="Back"
                            disabled={stepIndex === 0}
                            disableTouchRipple={true}
                            disableFocusRipple={true}
                            labelStyle={{ color: "rgb(15,46,83)", }}
                            onClick={this.handlePrev}
                        />
                        <div className="p-b-small"></div>
                        <LinearProgress
                            style={{ background: "rgb(244,176,4)", }}
                            color="rgba(15,46,83,0.6)"
                            mode="determinate"
                            value={this.state.completed}
                        />
                        <div className="tiny">
                            <div className="p-b-small-block">
                                {this.state.progressText}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }


    // ...
    emailValidator = (email) =>
        !emailValid(email) ? "invalid email" : null


    // ...
    passwordValidator = (password) =>
        !passwordValid(password) ? "invalid password" : null


    // ...
    compoundValidate = () => {
        let proceed = true

        if (!emailValid(this.textInputFieldEmail.state.value)) {
            this.textInputFieldEmail.setState({
                error: "invalid email",
            })
            proceed = false
        }

        if (!passwordValid(this.textInputFieldPassword.state.value)) {
            this.textInputFieldPassword.setState({
                error: "invalid password",
            })
            proceed = false
        }

        if (
            this.textInputFieldPassword.state.value !==
                this.textInputFieldPasswordConf.state.value
        ) {
            this.textInputFieldPasswordConf.setState({
                error: "password mismatch",
            })
            proceed = false
        }

        if (proceed) {
            this.setState({
                email: this.textInputFieldEmail.state.value,
                password: this.textInputFieldPassword.state.value,
            })
            this.handleNext.call(this)
        }
    }


    // ...
    render = () => {
        const
            { finished, stepIndex, } = this.state,
            styles = {
                stepLabel: {
                    fontSize: "1rem",
                },
                errorStyle: {
                    color: "#912d35",
                },
                underlineStyle: {
                    borderColor: "rgba(15,46,83,0.6)",
                },
                floatingLabelStyle: {
                    color: "rgba(15,46,83,0.5)",
                },
                floatingLabelFocusStyle: {
                    color: "rgba(15,46,83,0.35)",
                },
                inputStyle: {
                    color: "rgba(15,46,83,0.8)",
                },
            }

        return (
            <div
                style={{ maxWidth: 580, maxHeight: 580, margin: "auto", }}
            >
                <Stepper
                    connector={null}
                    activeStep={stepIndex}
                    orientation="vertical"
                >
                    <Step>
                        <StepLabel
                            style={styles.stepLabel}
                            icon={<i className="material-icons">person</i>}
                        >
                            Choose email and password.
                        </StepLabel>
                        <StepContent
                            style={{
                                borderLeft: "1px solid rgba(15,46,83,0.2)",
                            }}
                        >
                            <div className="revers">
                                <div>
                                    <InputField
                                        name="register-email"
                                        type="email"
                                        placeholder="Email"
                                        styles={styles}
                                        validator={this.emailValidator}
                                        action={this.compoundValidate}
                                        ref={(self) => { this.textInputFieldEmail = self }}
                                    />
                                </div>
                                <div>
                                    <InputField
                                        name="register-password"
                                        type="password"
                                        placeholder="Password"
                                        styles={styles}
                                        validator={this.passwordValidator}
                                        action={this.compoundValidate}
                                        ref={(self) => { this.textInputFieldPassword = self }}
                                    />
                                </div>
                                <div>
                                    <InputField
                                        name="register-password-confirmation"
                                        type="password"
                                        placeholder="Password Confirmation"
                                        styles={styles}
                                        validator={this.passwordValidator}
                                        action={this.compoundValidate}
                                        ref={(self) => { this.textInputFieldPasswordConf = self }}
                                    />
                                </div>
                            </div>
                            {this.renderStepActions(0)}
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel
                            style={styles.stepLabel}
                            icon={<i className="material-icons">verified_user</i>}
                        >
                            Verify Data
                        </StepLabel>
                        <StepContent
                            style={{ borderLeft: "none", }}
                        >
                            {this.renderStepActions(1)}
                        </StepContent>
                    </Step>
                    <Step>
                        <StepLabel
                            style={styles.stepLabel}
                            icon={<i className="material-icons">account_box</i>}
                        >
                            Your Account
                        </StepLabel>
                        <StepContent style={{ borderLeft: "none", }}>
                            {this.renderStepActions(2)}
                        </StepContent>
                    </Step>
                </Stepper>
                {(finished && this.state.accountCreated) && (
                    <div
                        style={{
                            fontSize: "1rem",
                            margin: "20px 0",
                            textAlign: "center",
                        }}
                    >
                        <i className="material-icons">done_all</i>
                        Your account has been registered.
                    </div>
                )}
                {(finished && !this.state.accountCreated) && (
                    <div
                        className="outline-error"
                        style={{
                            color: "#D32F2F",
                            fontSize: "1rem",
                            margin: "20px 0",
                            textAlign: "center",
                        }}
                    >
                        <i className="material-icons">error</i>
                        There was a problem registering your account.
                        <div className="small">
                            Reason: {this.state.progressError}
                        </div>
                    </div>
                )}
            </div>
        )
    }
}


// ...
export default connect(
    // map state to props.
    (state) => ({
        accountInfo: state.accountInfo,
        appAuth: state.appAuth,
    }),

    // match dispatch to props.
    (dispatch) => bindActionCreators({
        setAccountRegistered,
        changeLoginState,
    }, dispatch)
)(NewAccount)
