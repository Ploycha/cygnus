import React from "react"
import {
    homepage,
    version,
} from "../../../package.json"


// ...
export const appName = "Stellar Fox"


// ...
export const appVersion = version


// ...
export const appCopyDates = "2017-2018"


// ...
export const appLandingPageLink = homepage


// ...
export const ssAppStateKey = `StellarFox.${appVersion}`


// ...
export const ssSaveThrottlingTime = 1000


// ...
export const appBasePath = "/"


// ...
export const appRootDomId = "app"


// ...
export const unknownPubKeyAbbr = "XXXXXX-XXXXXX"


// ...
export const bip32Prefix = "44'/148'/"


// ...
export const snackbarAutoHideDuration = 3500


// ...
export const bankDrawerWidth = 180


// ...
export const contentPaneSeparation = 20


// ...
export const securityGuideLink =
    "https://github.com/stellar-fox/cygnus/wiki/Security-Guide"


// ...
export const ledgerSupportLink =
    "https://support.ledgerwallet.com/hc/en-us/articles/115003797194"


// ...
export const TopBarSecurityMessage = () =>
    <div className="alert-message">
        <span>we will <u>never</u> ask you for your secret key.</span>
        &nbsp;&nbsp;
        <span>please read this <a target="_blank"
            rel="noopener noreferrer"
            href={securityGuideLink}>
            <strong>short guide</strong>
        </a> to keep your finances secure.</span>
    </div>


// ...
export const NotImplementedBadge = () =>
    <span className="red-badge">NOT IMPLEMENTED YET</span>


// ...
export const gravatar = "https://www.gravatar.com/avatar/"


// ...
export const gravatarSize = "s=96"


// ...
export const defaultCurrencyRateUpdateTime = 300000


// ...
export const federationEndpoint = (domain) =>
    `https://${domain}/.well-known/stellar.toml`


// ...
export const minimumAccountReserve = 1


// ...
export const minimumReserveMessage =
    `Minimum reserve of ${minimumAccountReserve} required.`


// ...
export const notImplementedText =
    "We are hard at work to bring you this feature very soon. Please check back in a while as our codeis being frequently deployed."