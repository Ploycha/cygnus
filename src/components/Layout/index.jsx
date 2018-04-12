import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { compose } from "redux"
import { connect } from "react-redux"
import {
    Redirect,
    Route,
} from "react-router-dom"
import raf from "raf"

import {
    ConnectedSwitch as Switch,
    resolvePath,
    withStaticRouter,
} from "../StellarRouter"

import { ActionConstants } from "../../redux/actions"
import { Null } from "../../lib/utils"

import AlertModal from "./AlertModal"
import LoadingModal from "../LoadingModal"
import ConnectedSnackbar from "./ConnectedSnackbar"
import Welcome from "../Welcome"

import "./index.css"




// <Layout> component
export default compose(
    withStaticRouter,
    connect(
        // map state to props.
        (state) => ({
            loggedIn: state.appAuth.loginState === ActionConstants.LOGGED_IN,
        })
    )
)(
    class extends Component {

        // ...
        static propTypes = {
            loggedIn: PropTypes.bool.isRequired,
            match: PropTypes.object.isRequired,
            staticRouter: PropTypes.object.isRequired,
        }


        // ...
        state = { Bank: Null, }


        // ...
        constructor (props) {
            super(props)

            // relative resolve
            this.rr = resolvePath(this.props.match.path)

            // static paths
            this.props.staticRouter.addPaths({
                "Welcome": this.rr("."),
                "Bank": this.rr("bank/"),
            })
        }


        // ...
        renderWelcome = (routeProps) =>
            !this.props.loggedIn ?
                <Welcome {...routeProps} /> :
                <Redirect to={this.props.staticRouter.getPath("Bank")} />


        // ...
        renderBank = (routeProps) =>
            this.props.loggedIn ?
                <this.state.Bank {...routeProps} /> :
                <Redirect to={this.props.staticRouter.getPath("Welcome")} />


        // ...
        componentDidMount = () => raf(() =>
            import("../Bank")
                .then((B) => this.setState(
                    () => ({ Bank: B.default, })
                ))
        )


        // ...
        render = () => (
            (getPath) =>
                <Fragment>
                    <AlertModal />
                    <LoadingModal />
                    <ConnectedSnackbar />
                    <Switch>
                        <Route exact path={getPath("Welcome")}>
                            { this.renderWelcome }
                        </Route>
                        <Route path={getPath("Bank")}>
                            { this.renderBank }
                        </Route>
                        <Redirect to={getPath("Welcome")} />
                    </Switch>
                </Fragment>
        )(this.props.staticRouter.getPath)

    }
)
