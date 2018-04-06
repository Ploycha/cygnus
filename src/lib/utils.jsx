import React, { Fragment } from "react"
import axios from "axios"
import toml from "toml"
import { config } from "../config"
import {
    bip32Prefix,
    federationEndpoint,
} from "../components/StellarFox/env"




// TODO: convert-to/use-as module
export const StellarSdk = window.StellarSdk




// ...
const domainRegex = /((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/




// ...
export const pubKeyAbbr = (pubKey) => handleException(
    () => `${pubKey.slice(0, 6)}-${pubKey.slice(50)}`,
    (_) => { throw new Error("Malformed key.") }
)




// ...
export const utcToLocaleDateTime = (utcDateTime, includeTime = true) => (
    (date) =>
        includeTime ?
            `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}` :
            date.toLocaleDateString()
)(utcDateTime ? new Date(utcDateTime) : new Date())




// ...
export const emailValid = (email) => !!(
    new RegExp([
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))/,
        /@/,
        domainRegex,
    ].map(r => r.source).join(""))
).test(email)




// ...
export const passwordValid = (password) => !!/^.{8,}$/.test(password)




// ...
export const federationIsAliasOnly = (federationAddress) =>
    !!/^[a-zA-Z\-0-9.@][^*]+$/.test(federationAddress)




// ...
export const federationAddressValid = (federationAddress) => !!(
    new RegExp([
        /^[a-zA-Z\-0-9.@]+\*/,
        domainRegex,
    ].map(r => r.source).join(""))
).test(federationAddress)




// ...
export const errorMessageForInvalidPaymentAddress = (address) => {
    // Looks like something totally invalid for this field.
    if (!address.match(/\*/) && !address.match(/^G/)) {
        return "Invalid input."
    }
    // Looks like user is entering Federation Address format.
    if (address.match(/\*/) && !federationAddressValid(address)) {
        return "Invalid payment address."
    }
    // This must be an attempt at a Stellar public key format.
    if (address.match(/^G/) && !address.match(/\*/)) {
        const publicKeyValidityObj = pubKeyValid(address)
        if (!publicKeyValidityObj.valid) {
            return publicKeyValidityObj.message
        }
    }
    return null
}




// ...
export const fedToPub = (input) => {
    if (input.match(/^G/) && !input.match(/\*/)) {
        const publicKeyValidityObj = pubKeyValid(input)
        if (publicKeyValidityObj.valid) {
            return Promise.resolve({ok: true, publicKey: input,})
        }
    }
    if (input.match(/\*/) && federationAddressValid(input)) {
        return fedToPubLookup(input)
    }
}




// ...
export const fedToPubLookup = (input) => (
    async (fedAddress) => {
        try {
            let endpoint = await endpointLookup(fedAddress)

            let publicKey =
                await axios.get(
                    `${endpoint.endpoint}?q=${fedAddress}&type=name`
                )

            return {
                ok: true,
                publicKey: publicKey.data.account_id,
            }

        } catch (error) {
            return { error, }
        }
    }
)(input)




// ...
export const endpointLookup = (address) => (
    async (domain) => {
        try {
            if (domain) {
                let endpoint = await axios.get(federationEndpoint(domain[0]))
                return {
                    ok: true,
                    endpoint: toml.parse(endpoint.data).FEDERATION_SERVER,
                }
            }
        } catch (error) {
            return {error,}
        }
    }
)(address.match(domainRegex))




// ...DEPRECATED
export const federationLookup = (federationAddress) => (
    (federationDomain) =>
        federationDomain ?
            axios
                .get(federationEndpoint(federationDomain[0]))
                .then((response) => ({
                    ok: true,
                    endpoint: toml.parse(response.data).FEDERATION_SERVER,
                })) :
            // in case of failure - return rejected promise with error description
            Promise.reject(new Error("Federation address domain not found..."))
)(federationAddress.match(domainRegex))




// ...
export const pubKeyValid = (pubKey) => {
    let validity = {}
    switch (true) {
        case pubKey.length < 56:
            validity = Object.assign(validity || {}, {
                valid: false,
                length: 56 - pubKey.length,
                message:
                    pubKey.length !== 0
                        ? `needs ${56 - pubKey.length} more characters`
                        : null,
            })
            break
        case pubKey.length === 56:
            try {
                StellarSdk.Keypair.fromPublicKey(pubKey)
                validity = Object.assign(validity || {}, {
                    valid: true,
                    message: null,
                })
            } catch (error) {
                validity = Object.assign(validity || {}, {
                    valid: false,
                    message: error.message,
                })
            }
            break
        default:
            break
    }
    return validity
}




// ...
export const publicKeyExists = (publicKey) => (
    async () => {
        const server = new StellarSdk.Server(config.horizon)
        try {
            await server.loadAccount(publicKey)
            return true
        } catch (error) {
            return false
        }
    }
)(publicKey)




// extracts Z from "XX'/YYY'/Z'"
export const extractPathIndex = (path) => handleException(
    () => path.match(/\/(\d{1,})'$/)[1],
    (_) => { throw new Error("Path index cannot be found.") }
)




// inserts path index substituting Z in "XX'/YYY'/Z'"
export const insertPathIndex = (index) => `${bip32Prefix}${index}'`




// ...
export const handleException = (fn, handler) => {
    try { return fn() }
    catch (ex) { return typeof handler === "function" ? handler(ex) : ex }
}




// ...
export const nullToUndefined = (val) => val === null ? undefined : val




// ...
export const flatten = (arr) => arr.reduce((acc, el) => acc.concat(el), [])




// declarative conditional rendering in JSX
export const ConditionalRender = (props) => (
    (cn) => Array.isArray(cn) ?
        cn.filter((c) => c.props.display) :
        cn.props.display ? cn : null
)(props.children)




// React.Fragment can only receive 'key' and 'children' as props, so...
export const RenderGroup = ({ children, }) => children




// ...
export const Null = () => null




// inject props "p" into component "C"
export const inject = (C, p) => (props) => <C {...{ ...props, ...p, }} />




// provide props into all children components (non-recursive)
export const Provide = ({ children, ...rest }) =>
    React.Children.map(
        children,
        (child) => child ? React.cloneElement(child, rest) : child
    )




// functional replacement of 'switch' statement
export const choose = (
    key,
    actions = {},
    defaultAction = () => null,
    args = []
) =>
    key in actions ?
        actions[key](...args) :
        defaultAction(...args)




// ...
export const createReducer = (initState = {}) =>
    (actions, defaultAction = (s, _a) => s) =>
        (state = initState, action) =>
            choose(
                action.type,
                actions,
                defaultAction,
                [state, action,]
            )




// ...
// TODO: move to <AssetManager> (?)
export const getAssetCode = (asset) =>
    asset.asset_type === "native" ? "XLM" : asset.asset_code




// ...
// TODO: move to <AssetManager> (?)
export const formatAmount = (amount, precision = 2) =>
    Number.parseFloat(amount).toFixed(precision)




// ...
// TODO: move to <AssetManager> (?)
export const currencyGlyph = (currency) => (
    (c) => c[currency]
)({
    "eur": "€",
    "usd": "$",
    "aud": "$",
    "nzd": "$",
    "thb": "฿",
    "pln": "zł",
})




// ...
export const capitalize = (str) =>
    str.substring(0, 1).toUpperCase() + str.substring(1)




// ...
export const emoji = {
    "pencil": "✎",
}




// ...
export const htmlEntities = {
    Minus: () => <Fragment>&#x02212;</Fragment>,
    Plus: () => <Fragment>&#x0002B;</Fragment>,
    Space: () => <Fragment>{" "}</Fragment>,
    Nbsp: () => <Fragment>&nbsp;</Fragment>,
}




// construct object from result of Object.entries() call
// entries = [[k1,v1], ... [kn, vn]]
// imitates Python's dict()
export const dict = (entries) => entries.reduce(
    (acc, [k, v,]) => Object.assign(acc, { [k]: v, }), {}
)




// when o = { a: "b", c: "d" }
// then swap(o) = { b: "a", d: "c" }
export const swap = (o) => dict(
    Object
        .entries(o)
        .map((kv) => [].concat(kv).reverse())
)




// shallowly compare two objects
export const shallowEquals = (objA, objB) => {
    if (Object.keys(objA).length !== Object.keys(objB).length)
        return false
    for (let k in objA)
        if (!(k in objB) || objA[k] !== objB[k])
            return false
    return true
}
