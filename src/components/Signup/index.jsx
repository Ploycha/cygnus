import React from "react"
import PropTypes from "prop-types"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import {
    func,
    shorten,
    string,
} from "@xcmats/js-toolbox"
import {
    AppBar,
    Tab,
    Tabs,
    Typography,
} from "@material-ui/core"
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery"
import { withStyles } from "@material-ui/core/styles"
import ledgerhqlogo from "../Welcome/static/ledgerhqlogo.svg"
import Panel from "../../lib/mui-v1/Panel"
import LedgerAuthenticator from "../LedgerAuthenticator"
import { ledgerSupportLink } from "../StellarFox/env"
import { LinearProgress } from "@material-ui/core"
import InputField from "../../lib/mui-v1/InputField"
import Button from "../../lib/mui-v1/Button"
import { signUpNewUser } from "../../thunks/users"



/**
 * Cygnus.
 *
 * Renders signup content content.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */


const TabContainer = (props) =>
    <Typography component="div" style={{ padding: 8 * 3 }}>
        {props.children}
    </Typography>


TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
}


/**
 * `<Signup>` component.
 *
 * @function Signup
 * @returns {React.ReactElement}
 */
const Signup = ({
    classes, emailInputError, emailInputErrorMessage, passwordInputError,
    passwordInputErrorMessage, signUpNewUser,
}) => {
    const isMobile = useMediaQuery("(max-width:960px)"),

        [value, setValue] = React.useState(0),
        [visible, setVisible] = React.useState(false),
        [accountId, setAccountId] = React.useState(string.empty()),
        [email, setEmail] = React.useState(string.empty()),
        [password, setPassword] = React.useState(string.empty()),
        
        handleChange = (_event, newValue) => {
            setValue(newValue)
        },

        authViaLedger = async (ledgerData) => {
            if (ledgerData.errorMessage) {
                return false
            }
            if (!ledgerData.errorCode) {
                setAccountId(ledgerData.publicKey)
                setVisible(true)
            }
        },

        signUp = () => signUpNewUser(accountId, email, password),

        updateEmailInputValue = (event) => setEmail(event.target.value),

        updatePasswordInputValue = (event) => setPassword(event.target.value)



    return <div style={{ paddingBottom: "3rem" }} className="flex-box-col content-centered items-centered">
        <div className="flex-box-col content-centered items-centered m-t-large m-b-large">
            <Typography variant="h4" color="secondary">
                Create Account
            </Typography>
            <Typography variant="h5" color="secondary">
                Plase choose one of available Account ID inputs.
            </Typography>
        </div>
        <div className={isMobile ? classes.rootMobile : classes.root}>
            <AppBar position="static">
                <Tabs value={value} onChange={handleChange}>
                    <Tab style={{ padding: "0 0.5rem" }} icon={<img
                        className="img-logo"
                        src={ledgerhqlogo}
                        width="72px"
                        alt="LedgerHQ"
                    />}
                    />
                    <Tab
                        classes={{
                            root: isMobile ? classes.labelSmall :
                                classes.label,
                        }}
                        label="Manual Input"
                    />
                </Tabs>
            </AppBar>
            {value === 0 && <TabContainer>
                <Panel title="Sign up with Ledger">
                    {visible ?
                        <div style={{ minHeight: "330px" }}>
                            <Typography align="center" variant="caption" color="secondary">
                                Signing up with Account ID:
                            </Typography>
                            <div className="m-t-small panel-title">
                                {accountId && shorten(accountId, 11, shorten.MIDDLE, "-")}
                            </div>
                            <div className="flex-box-col items-centered content-centered">
                                <InputField
                                    id="email-input"
                                    type="email"
                                    label="Email"
                                    color="secondary"
                                    error={emailInputError}
                                    errorMessage={emailInputErrorMessage}
                                    onChange={updateEmailInputValue}
                                />
                                <InputField
                                    id="password-input"
                                    type="password"
                                    label="Password"
                                    color="secondary"
                                    error={passwordInputError}
                                    errorMessage={passwordInputErrorMessage}
                                    onChange={updatePasswordInputValue}
                                />

                                <div>
                                    <Button
                                        onClick={signUp}
                                        color="secondary"
                                        style={{ marginRight: "0px" }}
                                    >Sign Up</Button>
                                    <LinearProgress
                                        variant="indeterminate"
                                        classes={{
                                            root: classes.barRoot,
                                            colorPrimary: classes.colorPrimary,
                                            barColorPrimary: classes.barColorPrimary,
                                        }}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </div>

                            </div>
                        </div> :
                        <div style={{ minHeight: "330px" }}>
                            <div className="m-t-small panel-title">
                                Account ID will be provided by your <em>Ledger</em> device.
                            </div>
                            <Typography align="center" variant="caption" color="secondary">
                                Connect your Ledger Nano S device and select <i>Stellar</i> application.
                                Need help? Visit <a target="_blank" rel="noopener noreferrer" href={ledgerSupportLink}>
                                Ledger Support</a>.
                            </Typography>
                            <LedgerAuthenticator
                                onConnected={authViaLedger}
                                onClick={null}
                                className="welcome-lcars-input"
                            />
                        </div>
                    }
                </Panel>
            </TabContainer>}
            {value === 1 && <TabContainer>
                <Panel title="Sign up by providing Account ID">
                    <div style={{ minHeight: "330px" }}>
                        <div className="m-t-small panel-title">
                            Please provide your Account ID.
                        </div>
                        <Typography align="center" variant="caption" color="secondary">
                            Your <em>Account ID</em> has 56 characters and
                            starts with a letter "G".
                        </Typography>
                        
                    </div>
                </Panel>
            </TabContainer>}
        </div>
    </div>
}




// ...
export default func.compose(
    withStyles((theme) => ({
        bg: {
            backgroundColor: theme.palette.primary.main,
        },
        root: {
            flexGrow: 1,
            backgroundColor: theme.palette.primary.light,
            borderRadius: "3px",
            maxWidth: "485px",
            minWidth: "485px",
        },

        rootMobile: {
            flexGrow: 2,
            margin: "0  0.5rem",
            backgroundColor: theme.palette.primary.light,
            borderRadius: "3px",
        },
        barRoot: {
            height: "1px",
            marginBottom: "6px",
        },

        colorPrimary: {
            backgroundColor: theme.palette.primary.main,
        },

        barColorPrimary: {
            backgroundColor: theme.palette.primary.main,
        },
    })),
    connect(
        (state) => ({
            emailInputError: state.Errors.emailInputError,
            emailInputErrorMessage: state.Errors.emailInputErrorMessage,
            passwordInputError: state.Errors.passwordInputError,
            passwordInputErrorMessage: state.Errors.passwordInputErrorMessage,
        }),
        (dispatch) => bindActionCreators({
            signUpNewUser,
        }, dispatch),
    ),
)(Signup)
