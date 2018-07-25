import React from "react"

import { Provider } from "react-redux"
import {
    applyMiddleware,
    createStore,
    combineReducers,
} from "redux"
import thunk from "redux-thunk"
import {
    composeWithDevTools as composeWithDevTools_prod
} from "redux-devtools-extension/developmentOnly"
import {
    composeWithDevTools as composeWithDevTools_dev
} from "redux-devtools-extension"

import { isObject } from "@xcmats/js-toolbox"

import throttle from "lodash/throttle"
import createHistory from "history/createBrowserHistory"
import {
    ConnectedSwitch as Switch,
    StellarRouter as Router,
    routerMiddleware,
} from "../StellarRouter"
import {
    Redirect,
    Route,
} from "react-router-dom"

import {
    loadState,
    saveState,
} from "../../lib/state-persistence"
import reducers from "../../redux"
import {
    devEnv,
    dynamicImportLibs,
    dynamicImportReducers,
} from "../../lib/utils"
import * as env from "./env"

import { MuiThemeProvider } from "@material-ui/core/styles"
import sFoxTheme from "../../lib/sfox-mui-theme"
import { CssBaseline } from "@material-ui/core"
import LegacyMuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import sFoxThemeLegacy from "../../lib/sfox-mui-theme.legacy"

import AssetManager from "../AssetManager"
import LoginManager from "../LoginManager"
import Layout from "../Layout"

import { config } from "../../config"
import firebase from "firebase"
import "firebase/auth"

import "typeface-roboto"
import "./index.css"




// firebase app
export const firebaseApp = firebase.initializeApp(config.firebase)




// browser history
export const history = createHistory({ /* basename: env.appBasePath, */ })




// store with router-redux integration and redux-devtools-extension
export const store = (() => {
    let
        composeWithDevTools = !devEnv()  ?
            composeWithDevTools_prod  :  composeWithDevTools_dev,
        s =
            createStore(
                combineReducers(reducers),
                loadState(),
                composeWithDevTools(
                    applyMiddleware(
                        thunk,
                        routerMiddleware(history)
                    )
                )
            )

    // save state in session storage in min. 1 sec. intervals
    s.subscribe(
        throttle(
            () => saveState(s.getState()),
            env.ssSaveThrottlingTime
        )
    )

    return s
})()




// <StellarFox> component - application's root
export default () =>
    <Provider store={store}>
        <Router history={history}>
            <MuiThemeProvider theme={sFoxTheme}>
                <LegacyMuiThemeProvider muiTheme={sFoxThemeLegacy}>
                    <LoginManager>
                        <AssetManager>
                            <CssBaseline />
                            <Switch>
                                <Route path={env.appBasePath}>
                                    {
                                        (routeProps) =>
                                            <Layout {...routeProps} />
                                    }
                                </Route>
                                <Redirect to={env.appBasePath} />
                            </Switch>
                        </AssetManager>
                    </LoginManager>
                </LegacyMuiThemeProvider>
            </MuiThemeProvider>
        </Router>
    </Provider>




// expose 'sf' dev. namespace only in dev. environment
if (devEnv()  &&  isObject(window)) {
    (async () => { window.sf = {
        env, history, store, React,
        dispatch: store.dispatch,
        ...await dynamicImportLibs(),
        process, // eslint-disable-line
        r: await dynamicImportReducers(),
    }})()
}




// ...
export { env }
