import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import Axios from "axios"
import { emptyString } from "@xcmats/js-toolbox"
import hoistStatics from "hoist-non-react-statics"
import { BigNumber } from "bignumber.js"
import { action as AssetManagerAction } from "../../redux/AssetManager"
import { defaultCurrencyRateUpdateTime } from "../StellarFox/env"
import { config } from "../../config"




// react's AssetManager context
const AssetManagerContext = React.createContext({})




// <AssetManager> component
class AssetManager extends Component {

    // ...
    getAssetCode = (asset) =>
        asset.asset_type === "native" ? "XLM" : asset.asset_code


    // ...
    getAssetDescription = (currency) => (
        (c) => c[currency]
    )({
        eur: "European Union Euro",
        usd: "United States Dollar",
        aud: "Australian Dollar",
        nzd: "New Zealand Dollar",
        thb: "Thai Baht",
        pln: "Polish Złoty",
    })


    // ...
    getAssetGlyph = (currency) => (
        (c) => c[currency]
    )({
        eur: "€",
        usd: "$",
        aud: "$",
        nzd: "$",
        thb: "฿",
        pln: "zł",
    })


    // ...
    getAssetDenomination = (currency) => (
        (c) => c[currency]
    )({
        eur: "EUROS",
        usd: "DOLLARS",
        aud: "AUSTRALIAN DOLLARS",
        nzd: "NEW ZEALAND DOLLARS",
        thb: "THAI BAHT บาท",
        pln: "ZŁOTYCH",
    })


    // ...
    getAccountNativeBalance = (account) =>
        account.balances.find(obj => obj.asset_type === "native").balance


    // ...
    rateStale = (currency) => (
        !this.props.state[currency]  ||
        this.props.state[currency].lastFetch +
            defaultCurrencyRateUpdateTime < Date.now()
    )


    // ...
    updateExchangeRate = async (currency) => {
        if (this.rateStale(currency)) {
            const rate = await Axios.get(
                `${config.api}/ticker/latest/${currency}`
            )
            this.props.setState({
                [currency]: {
                    rate: rate.data.data[`price_${currency}`],
                    lastFetch: Date.now(),
                },
            })
            return rate.data.data[`price_${currency}`]
        } else {
            return this.props.state[currency].rate
        }
    }


    // ...
    convertToNative = (amount) => {
        BigNumber.config({ DECIMAL_PLACES: 7, ROUNDING_MODE: 4, })
        return this.props.state[this.props.Account.currency] && amount !== emptyString() ?
            new BigNumber(amount).dividedBy(
                this.props.state[this.props.Account.currency].rate
            ).toString() : "0.0000000"
    }


    // ...
    convertToAsset = (amount) => {
        BigNumber.config({ DECIMAL_PLACES: 4, ROUNDING_MODE: 4, })
        return this.props.state[this.props.Account.currency] && amount !== emptyString() ?
            new BigNumber(amount).multipliedBy(
                this.props.state[this.props.Account.currency].rate
            ).toFixed(2) : "0.00"
    }


    // ...
    convertToPayeeCurrency = (amount) => {
        BigNumber.config({ DECIMAL_PLACES: 4, ROUNDING_MODE: 4, })
        return this.props.state[this.props.payeeCurrency] && amount !== emptyString() ?
            new BigNumber(amount).multipliedBy(
                this.props.state[this.props.payeeCurrency].rate
            ).toFixed(2) : "0.00"
    }


    // ...
    exchangeRate = (amount, assetCode) => {
        BigNumber.config({ DECIMAL_PLACES: 4, ROUNDING_MODE: 4, })
        return new BigNumber(this.convertToNative(amount)).multipliedBy(
            this.props.state[assetCode].rate
        ).toFixed(2)
    }


    // ...
    render = () =>
        <AssetManagerContext.Provider value={this}>
            { this.props.children }
        </AssetManagerContext.Provider>

}


// ...
export default connect(
    // map state to props.
    (state) => ({
        state: state.Assets,
        Account: state.Account,
        payeeCurrency: state.Balances.payeeCurrency,
    }),
    // map dispatch to props.
    (dispatch) => bindActionCreators({
        setState: AssetManagerAction.setState,
    }, dispatch)
)(AssetManager)




// <withAssetManager(...)> HOC
export const withAssetManager = (WrappedComponent) => {

    let
        // ...
        WithAssetManager = hoistStatics(
            class extends Component {

                // ...
                static propTypes = {
                    forwardedRef: PropTypes.func,
                }

                // ...
                render = () => (
                    ({ forwardedRef, ...restOfTheProps }) =>
                        React.createElement(
                            AssetManagerContext.Consumer, null,
                            (assetManager) =>
                                React.createElement(
                                    WrappedComponent, {
                                        ...restOfTheProps,
                                        ref: forwardedRef,
                                        assetManager,
                                    }
                                )
                        )
                )(this.props)

            },
            WrappedComponent
        ),

        // ...
        forwardRef = (props, ref) =>
            React.createElement(WithAssetManager,
                { ...props, forwardedRef: ref, }
            )

    // ...
    forwardRef.displayName =
        `withAssetManager(${
            WrappedComponent.displayName || WrappedComponent.name
        })`

    // ...
    forwardRef.WrappedComponent = WrappedComponent

    // ...
    return React.forwardRef(forwardRef)

}
