import React from "react"
import ReactDOM from "react-dom"
import { Route } from "react-router-dom"
import createHistory from "history/createBrowserHistory"

import {
    applyMiddleware,
    createStore,
    combineReducers,
} from "redux"
import { Provider } from "react-redux"

import {
    routerReducer,
    routerMiddleware,
} from "react-router-redux"

import {
    composeWithDevTools,
} from "redux-devtools-extension"
import thunk from "redux-thunk"

import { inject } from "./lib/utils"

import reducers from "./reducers"
import {
    unregister,
    // registerServiceWorker,
} from "./registerServiceWorker"

import {
    appBasePath,
    appRootDomId,
    ssSaveThrottlingTime,
} from "./env"
import throttle from "lodash/throttle"
import {
    loadState,
    saveState,
} from "./lib/StatePersistence"

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import stellarTheme from "./frontend/themes/stellar"

import StellarRouter from  "./components/StellarRouter"
import Layout from "./components/Layout"

import "./index.css"




// browser history
const history = createHistory()


// store with router-redux integration and redux-devtools-extension
const store = createStore(
    combineReducers({
        ...reducers,
        router: routerReducer,
    }),
    loadState(),
    composeWithDevTools(
        applyMiddleware(
            thunk,
            routerMiddleware(history)
        )
    )
)


// save state in session storage in min. 1 sec. intervals
store.subscribe(
    throttle(
        () => saveState(store.getState()),
        ssSaveThrottlingTime
    )
)


// application's root
const StellarFox = () =>
    <Provider store={store}>
        <MuiThemeProvider muiTheme={stellarTheme}>
            <StellarRouter history={history}>
                <Route component={inject(Layout, { basePath: appBasePath, })} />
            </StellarRouter>
        </MuiThemeProvider>
    </Provider>


// render application's root into the DOM
ReactDOM.render(
    <StellarFox />,
    document.getElementById(appRootDomId)
)




// ...
// registerServiceWorker()
unregister()
