import React from "react"
import {
    appVersion,
    appName,
    appCopyDates,
    appLandingPageLink,
} from "../StellarFox/env"
import {
    emoji,
    htmlEntities as he,
} from "../../lib/utils"

import "./Footer.css"




// <Footer> component
export default () =>
    <div className="footer">
        <div className="flex-row-space-between">
            <div>
                <emoji.Lightning /><he.Nbsp /><he.Nbsp />
                <he.Copy /><he.Nbsp /><he.Nbsp />
                <a target="_blank"
                    href={appLandingPageLink}>
                    <span className="stellar-style">{appName}</span>
                </a>
                <he.Nbsp /><he.Nbsp />
                <emoji.Stars /><emoji.Rocket /><emoji.Fox /><emoji.Stars />
                <he.Nbsp /><he.Nbsp />
                {appCopyDates}<he.Nbsp /><he.Nbsp /><emoji.Lightning />.
            </div>
            <div>
                ver.<he.Nbsp />
                <span className="stellar-style">{appVersion}</span>
                <he.Nbsp /><he.Nbsp />
                <emoji.Fire />
                <he.Nbsp /><he.Nbsp />
            </div>
        </div>
    </div>
