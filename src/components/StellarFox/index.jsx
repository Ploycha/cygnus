import React from "react"
import { Provider } from "react-redux"
import { ConnectedRouter as Router } from "react-router-redux"

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import stellarTheme from "./theme"

import LoginManager from "../LoginManager"
import AssetManager from "../AssetManager"
import Layout from "../Layout"

import "./index.css"




// <StellarFox> component - application's root
export default ({
    store, history,
}) =>
    <Provider store={store}>
        <MuiThemeProvider muiTheme={stellarTheme}>
            <Router history={history}>
                <LoginManager>
                    <AssetManager>
                        <Layout />
                    </AssetManager>
                </LoginManager>
            </Router>
        </MuiThemeProvider>
    </Provider>
