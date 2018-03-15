import React from "react"
import { version } from "../package.json"


// ...
export const appName = "Stellar Fox"


// ...
export const appVersion = version


// ...
export const appCopyDates = "2017-2018"


// ...
export const ssAppStateKey = `StellarFox.${appVersion}`


// ...
export const ssSaveThrottlingTime = 1000


// ...
export const appBasePath = "/"


// ...
export const appRootDomId = "app"


// ...
export const snackBarAutoHideDuration = 3500


// ...
export const securityGuideLink = "https://github.com/stellar-fox/cygnus/wiki/Security-Guide"


// ...
export const ledgerSupportLink = "https://support.ledgerwallet.com/hc/en-us/articles/115003797194"


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
