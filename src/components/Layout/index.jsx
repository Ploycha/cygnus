import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import {
    Redirect,
    Route,
} from "react-router-dom"

import {
    ConnectedSwitch as Switch,
    resolvePath,
    withStellarRouter,
} from "../StellarRouter"

import { ActionConstants } from "../../redux/actions"

import LoadingModal from "../LoadingModal"
import Welcome from "../Welcome"
import Bank from "../Bank"




// <Layout> component
export default withStellarRouter(connect(
    // map state to props.
    (state) => ({
        loggedIn: state.appAuth.loginState === ActionConstants.LOGGED_IN,
    })
)(
    class extends Component {

        // ...
        static propTypes = {
            loggedIn: PropTypes.bool.isRequired,
            match: PropTypes.object.isRequired,
            staticRouter: PropTypes.object.isRequired,
        }


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
        render = () => (
            ({ loggedIn, }, getPath) =>
                <Fragment>
                    <LoadingModal />
                    <Switch>
                        <Route exact path={getPath("Welcome")}>
                            {
                                !loggedIn ?
                                    <Welcome /> :
                                    <Redirect to={getPath("Bank")} />
                            }
                        </Route>
                        <Route path={getPath("Bank")}>
                            {
                                loggedIn ?
                                    <Bank /> :
                                    <Redirect to={getPath("Welcome")} />
                            }
                        </Route>
                        <Redirect to={getPath("Welcome")} />
                    </Switch>
                </Fragment>
        )(this.props, this.props.staticRouter.getPath)

    }
))
