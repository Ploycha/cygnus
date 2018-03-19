import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { NavLink } from "react-router-dom"
import { push } from "react-router-redux"
import { bankDrawerWidth } from "../../env"
import { Provide } from "../../lib/utils"

import Drawer from "material-ui/Drawer"

import "./BankDrawer.css"




// binds 'currentPath' state prop and 'push' dispatcher
const navLinkConnect = connect(
    (state) => ({ currentPath: state.router.location.pathname, }),
    (dispatch) => ({ push: (p) => dispatch(push(p)), })
)




// ...
const BalancesNavLink = navLinkConnect(
    ({ currentPath, paths, push, }) =>
        <NavLink
            className="menu-item"
            onClick={(e) => {
                e.preventDefault()
                if (currentPath !== paths.Balances) {
                    push(paths.Balances)
                }
            }}
            exact
            activeClassName="active"
            isActive={() => currentPath === paths.Balances}
            to={""} // required in NavLink definition but not used here
        >
            <i className="material-icons">account_balance_wallet</i>
            Balances
        </NavLink>
)




// ...
const PaymentsNavLink = navLinkConnect(
    ({ currentPath, paths, push, }) =>
        <NavLink
            className="menu-item"
            onClick={(e) => {
                e.preventDefault()
                if (currentPath !== paths.Payments) {
                    push(paths.Payments)
                }
            }}
            exact
            isActive={() => currentPath === paths.Payments}
            activeClassName="active"
            to={""} // required in NavLink definition but not used here
        >
            <i className="material-icons">payment</i>
            Payments
        </NavLink>
)




// ...
const AccountNavLink = navLinkConnect(
    ({ currentPath, paths, push, }) =>
        <NavLink
            className="menu-item"
            onClick={(e) => {
                e.preventDefault()
                if (currentPath !== paths.Account) {
                    push(paths.Account)
                }
            }}
            exact
            isActive={() => currentPath === paths.Account}
            activeClassName="active"
            to={""} // required in NavLink definition but not used here
        >
            <i className="material-icons">account_balance</i>
            Account
        </NavLink>
)




// ...
const bankDrawerStyle = {
    width: bankDrawerWidth,
    height: "calc(100% - 100px)",
    top: 65,
    borderTop: "1px solid #052f5f",
    borderBottom: "1px solid #052f5f",
    borderLeft: "1px solid #052f5f",
    borderTopRightRadius: "3px",
    borderBottomRightRadius: "3px",
    backgroundColor: "#2e5077",
}




// <BankDrawer> component
export default connect(
    (state) => ({
        accountInfo: state.accountInfo,
        drawerOpened: state.ui.drawer.isOpened,
    })
)(
    class BankDrawer extends Component {

        // ...
        static propTypes = {
            drawerOpened: PropTypes.bool.isRequired,
            paths: PropTypes.object.isRequired,
        }


        // ...
        render = () =>
            <Drawer
                containerStyle={bankDrawerStyle}
                open={this.props.drawerOpened}
            >
                <Provide paths={this.props.paths} >
                    <BalancesNavLink />
                    {
                        this.props.accountInfo.exists ?
                            <PaymentsNavLink /> : null
                    }
                    <AccountNavLink />
                </Provide>
            </Drawer>

    }
)
