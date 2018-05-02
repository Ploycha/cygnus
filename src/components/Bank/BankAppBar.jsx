import React, { Component } from "react"
import PropTypes from "prop-types"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"

import { action as AccountAction } from "../../redux/Account"
import { action as BankAction } from "../../redux/Bank"
import { action as LedgerHQAction } from "../../redux/LedgerHQ"
import { action as LoginManagerAction } from "../../redux/LoginManager"
import { action as StellarAccountAction } from "../../redux/StellarAccount"
import { action as PaymentsAction } from "../../redux/Payments"

import AppBar from "material-ui/AppBar"
import IconButton from "material-ui/IconButton"
import BankAppBarTitle from "./BankAppBarTitle"
import BankAppBarItems from "./BankAppBarItems"




// ...
const style = {
    appBar : {
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10001,
    },
    icon : {
        color: "rgba(15, 46, 83, 0.45)",
    },
}




// <BankAppBar> component
export default connect(
    // map state to props.
    (state) => ({
        currentView: state.Router.currentView,
    }),
    // map dispatch to props.
    (dispatch) => bindActionCreators({
        resetAccountState: AccountAction.resetState,
        resetLedgerHQState: LedgerHQAction.resetState,
        resetLoginManagerState: LoginManagerAction.resetState,
        resetPaymentsState: PaymentsAction.resetState,
        resetStellarAccountState: StellarAccountAction.resetState,
        toggleDrawer: BankAction.toggleDrawer,
    }, dispatch)
)(
    class extends Component {

        // ...
        static propTypes = {
            currentView: PropTypes.string.isRequired,
            resetAccountState: PropTypes.func.isRequired,
            resetLedgerHQState: PropTypes.func.isRequired,
            resetLoginManagerState: PropTypes.func.isRequired,
            resetPaymentsState: PropTypes.func.isRequired,
            resetStellarAccountState: PropTypes.func.isRequired,
            toggleDrawer: PropTypes.func.isRequired,
        }


        // ...
        handleLogOutClick = () => {
            this.props.resetAccountState()
            this.props.resetLedgerHQState()
            this.props.resetLoginManagerState()
            this.props.resetPaymentsState()
            this.props.resetStellarAccountState()
        }


        // ...
        render = () => (
            ({ currentView, toggleDrawer, }) =>
                <AppBar
                    title={
                        <div className="flex-row">
                            <BankAppBarTitle viewName={currentView} />
                            <BankAppBarItems />
                        </div>
                    }
                    className="navbar"
                    style={style.appBar}
                    onLeftIconButtonClick={toggleDrawer}
                    iconElementRight={
                        <IconButton
                            iconStyle={style.icon}
                            onClick={this.handleLogOutClick}
                        >
                            <i className="material-icons">
                                power_settings_new
                            </i>
                        </IconButton>
                    }
                />
        )(this.props)

    }
)
