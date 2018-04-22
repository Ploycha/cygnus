import {
    loadAccount,
    operations,
    payments,
} from "../../lib/stellar-tx"




// ...
export const paymentsStreamer = (
    publicKey, popupSnackbar, updateAccountTree
) =>
    payments().stream({
        onmessage: (message) => {

            const RECEIVED = [
                (message.type === "create_account" &&
                    message.account === publicKey),
                (message.type === "payment" &&
                    message.to === publicKey),
            ]

            const SENT = [
                (message.type === "create_account" &&
                    message.source_account === publicKey),
                (message.type === "payment" &&
                    message.from === publicKey),
            ]

            RECEIVED.some(el => el) && popupSnackbar("Payment received.") &&
                loadAccount(publicKey).then(
                    account => updateAccountTree(account)
                )

            SENT.some(el => el) && popupSnackbar("Payment sent.") &&
                loadAccount(publicKey).then(
                    account => updateAccountTree(account)
                )
        },
    })




// ...
export const operationsStreamer = (
    publicKey, popupSnackbar, updateAccountTree
) =>
    operations().stream({
        onmessage: (message) => {
            const HOME_DOMAIN_UPDATE = [
                (message.type === "set_options" &&
                    message.source_account === publicKey &&
                    message.home_domain
                ),
            ]

            const HOME_DOMAIN_REMOVE = [
                (message.type === "set_options" &&
                    message.source_account === publicKey &&
                    !message.home_domain
                ),
            ]

            HOME_DOMAIN_UPDATE.some(el => el) &&
            popupSnackbar("Account domain updated.") &&
            loadAccount(publicKey).then(
                account => updateAccountTree(account)
            )

            HOME_DOMAIN_REMOVE.some(el => el) &&
            popupSnackbar("Account domain removed.") &&
            loadAccount(publicKey).then(
                account => updateAccountTree(account)
            )
        },
    })
