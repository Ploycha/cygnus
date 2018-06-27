import {
    liveNetAddr,
    testNetAddr,
} from "../components/StellarFox/env"

import BigNumber from "bignumber.js"




// TODO: convert-to/use-as module
export const StellarSdk = window.StellarSdk




// ...
export const server = (network) => {
    if (network === liveNetAddr) {
        StellarSdk.Network.usePublicNetwork()
        return new StellarSdk.Server(liveNetAddr)
    }
    StellarSdk.Network.useTestNetwork()
    return new StellarSdk.Server(testNetAddr)
}




// ...
export const loadAccount = async (publicKey, network) =>
    await server(network).loadAccount(publicKey)




// ...
export const payments = (network) =>
    server(network).payments().cursor("now")




// ...
export const operations = (network) =>
    server(network).operations().cursor("now")


// ...
export const buildSetDataTx = async (txData) =>
    new StellarSdk.TransactionBuilder(
        await loadAccount(txData.source, txData.network)
    ).addOperation(StellarSdk.Operation.manageData({
        name: txData.name,
        value: txData.value,
    })).build()

// ...
export const buildCreateAccountTx = async (txData) =>
    new StellarSdk.TransactionBuilder(
        await loadAccount(txData.source, txData.network)
    ).addOperation(StellarSdk.Operation.createAccount({
        destination: txData.destination,
        startingBalance: txData.amount,
    })).addMemo(StellarSdk.Memo.text(txData.memo)).build()




// ...
export const buildPaymentTx = async (txData) =>
    new StellarSdk.TransactionBuilder(
        await loadAccount(txData.source, txData.network)
    ).addOperation(StellarSdk.Operation.payment({
        destination: txData.destination,
        asset: StellarSdk.Asset.native(),
        amount: txData.amount,
    })).addMemo(StellarSdk.Memo.text(txData.memo)).build()




// ...
export const submitTransaction = async (signedTx, network) =>
    server(network).submitTransaction(signedTx)




// ...
export const displayLastBalance = (balance) => {
    const bnBalance = new BigNumber(balance)

    if (bnBalance.isEqualTo(0)) {
        return bnBalance.toString()
    }

    if (bnBalance.isGreaterThan(0)) {
        return `+ ${balance.toString()}`
    }

    if (bnBalance.isLessThan(0)) {
        return `- ${balance.toString()}`
    }
}




// ...
export const displayDebit = (debit) =>
    debit ? `- ${new BigNumber(debit).abs().toString()}` : ""




// ...
export const displayCredit = (credit) =>
    credit ? `+ ${new BigNumber(credit).abs().toString()}` : ""




// ...
export const lastBalance = (initial, next) =>
    new BigNumber(initial).plus(next).toString()




// ...
export const debit = (operations, publicKey) => {
    const balance = operationsBalance(operations, publicKey)

    if (balance.isLessThan(0)) {
        return balance.toString()
    }

    return ""
}




// ...
export const credit = (operations, publicKey) => {
    const balance = operationsBalance(operations, publicKey)

    if (balance.isGreaterThan(0)) {
        return balance.toString()
    }

    return ""
}




// ...
export const operationsBalance = (operations, publicKey) => {
    const parsedOps = operations.map((op) => operationParse(op, publicKey))
    let balance = new BigNumber("0.0000000")

    parsedOps.forEach((op) => {
        if (op) {
            const match = op.match(/([+-]{1}) (.+)/)
            if (match) {
                let sign = match[1]
                let amount = new BigNumber(match[2])
                if (sign === "+") {
                    balance = balance.plus(amount)
                } else {
                    balance = balance.minus(amount)
                }
            }
        }
    })

    return balance
}



// ...
export const operationParse = (operation, publicKey) => ((sign) => {
    if (operation.startingBalance) {
        return `${sign} ${operation.startingBalance}`
    }

    if (operation.amount) {
        return `${sign} ${operation.amount}`
    }

})(creditOrDebit(operation, publicKey))




// ...
export const creditOrDebit = (operation, publicKey) => {
    if ([ "createAccount", "payment", ].includes(operation.type)) {
        return operation.destination === publicKey ? "+" : "-"
    }
}
