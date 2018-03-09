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
    ConnectedRouter as Router,
    routerReducer,
    routerMiddleware,
    // push,
} from "react-router-redux"

import {
    composeWithDevTools,
    // devToolsEnhancer,
} from "redux-devtools-extension"
// import { createLogger } from "redux-logger"
import thunk from "redux-thunk"


import reducers from "./reducers"
import {
    unregister,
    // registerServiceWorker,
} from "./registerServiceWorker"

import throttle from "lodash/throttle"
import {
    loadState,
    saveState,
} from "./lib/StatePersistence"

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import stellarTheme from "./frontend/themes/stellar"

import Layout from "./components/Layout"

import "./index.css"




// // store with simple logger
// const store = createStore(
//     reducers,
//     loadState(),
//     applyMiddleware(thunk, createLogger())
// )


// // store with redux-devtools-extension
// const store = createStore(
//     reducers,
//     loadState(),
//     devToolsEnhancer()
// )


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
        applyMiddleware(thunk,
            routerMiddleware(history)
        )
    )
)


// save state in session storage in min. 1 sec. intervals
store.subscribe(throttle(() => saveState(store.getState()), 1000))




// application's root
ReactDOM.render(

    // ...
    <Provider store={store}>
        <MuiThemeProvider muiTheme={stellarTheme}>
            <Router history={history}>
                <Route component={Layout} />
            </Router>
        </MuiThemeProvider>
    </Provider>,

    // ...
    document.getElementById("app")

)




// ...
// registerServiceWorker()
unregister()
