import React, { Component, Fragment } from "react"
import { bindActionCreators, compose } from "redux"
import { connect } from "react-redux"
import { withStyles } from "@material-ui/core/styles"
import { IconButton, Menu, MenuItem } from "@material-ui/core"
import { gravatar, gravatarSize48 } from "../../components/StellarFox/env"
import Avatar from "@material-ui/core/Avatar"
import { action as AccountAction } from "../../redux/Account"
import { actions as AppActions } from "../../redux/App"
import { action as AssetsAction } from "../../redux/AssetManager"
import { action as AuthAction } from "../../redux/Auth"
import { action as BalancesAction } from "../../redux/Balances"
import { action as BankAction } from "../../redux/Bank"
import { action as ContactsAction } from "../../redux/Contacts"
import { action as LedgerHQAction } from "../../redux/LedgerHQ"
import { action as LoginManagerAction } from "../../redux/LoginManager"
import { action as StellarAccountAction } from "../../redux/StellarAccount"
import { action as PaymentsAction } from "../../redux/Payments"
import { firebaseApp } from "../../components/StellarFox"
import { withLoginManager } from "../../components/LoginManager"
import PowerIcon from "@material-ui/icons/PowerSettingsNew"




// ...
const styles = theme => ({
    menu: {
        backgroundColor: theme.palette.secondary.light,
    },
    menuItem: {
        color: theme.palette.primary.light,
    },
})




// ...
class UserMenu extends Component {

    state = {
        anchorEl: null,
    }


    // ...
    openMenu = (event) => {
        this.setState({ anchorEl: event.currentTarget })
    }


    // ...
    handleClose = (_event, action) => {
        this.setState({ anchorEl: null })
        typeof action === "function" && action()
    }


    // ...
    logout = () => {
        firebaseApp.auth("session").signOut()
        this.props.resetAccountState()
        this.props.resetAppState()
        this.props.resetAssetsState()
        this.props.resetAuthState()
        this.props.resetBalancesState()
        this.props.resetBankState()
        this.props.resetContactsState()
        this.props.resetLedgerHQState()
        this.props.resetLoginManagerState()
        this.props.resetPaymentsState()
        this.props.resetStellarAccountState()
    }


    // ...
    render = () => {
        const { anchorEl } = this.state
        const { authenticated, classes, gravatarHash } = this.props

        return (
            <div className="f-b m-l-small">
                {authenticated ?
                    <Fragment>
                        <IconButton
                            aria-owns={anchorEl ? "user-menu" : null}
                            aria-haspopup="true"
                            onClick={this.openMenu}
                            color="inherit"
                        >
                            <Avatar className={classes.avatar}
                                src={`${gravatar}${gravatarHash}?${
                                    gravatarSize48}&d=robohash`}
                            />
                        </IconButton>
                        <Menu
                            classes={{ paper: classes.menu }}
                            id="user-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={this.handleClose}
                        >
                            <MenuItem classes={{ root: classes.menuItem }}
                                onClick={(event) =>
                                    this.handleClose(event, this.logout)}
                            >Logout</MenuItem>
                        </Menu>
                    </Fragment> :
                    <IconButton
                        color="inherit"
                        aria-label="Logout"
                        onClick={this.logout}
                    >
                        <PowerIcon />
                    </IconButton>
                }
            </div>
        )
    }
}




// ...
export default compose(
    connect(
        (state) => ({
            authenticated: state.Auth.authenticated,
            gravatarHash: state.Account.gravatar,
            needsRegistration: state.Account.needsRegistration,
            publicKey: state.LedgerHQ.publicKey,
            bip32Path: state.LedgerHQ.bip32Path,
            token: state.LoginManager.token,
            userId: state.LoginManager.userId,
        }),
        (dispatch) => bindActionCreators({
            resetAccountState: AccountAction.resetState,
            resetAppState: AppActions.resetState,
            resetAssetsState: AssetsAction.resetState,
            resetAuthState: AuthAction.resetState,
            resetBalancesState: BalancesAction.resetState,
            resetBankState: BankAction.resetState,
            resetContactsState: ContactsAction.resetState,
            resetLedgerHQState: LedgerHQAction.resetState,
            resetLoginManagerState: LoginManagerAction.resetState,
            resetPaymentsState: PaymentsAction.resetState,
            resetStellarAccountState: StellarAccountAction.resetState,
        }, dispatch)
    ),
    withStyles(styles),
    withLoginManager,
)(UserMenu)
