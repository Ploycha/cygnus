import React from "react"
import { connect } from "react-redux"

import "./BankAppBarTitle.css"




// ...
export default connect(
    // map state to props.
    (state) => ({
        ledgerVer: state.auth.ledgerSoftwareVersion,
        viewName: state.nav.viewName,
    })
)(
    // BankAppBarTitle component
    ({
        ledgerVer,
        viewName,
    }) =>
        <div className="flex-start">
            <div className="app-bar-title">
                <div className="bar-title"><span>Stellar Fox</span></div>
                <div className="bar-subtitle">{viewName}</div>
            </div>
            <div className="indicator-set-col">
                <div className="badge">test net</div>
                <div className="p-b-small" />
                <div>
                    {
                        ledgerVer ?
                            <span className="ledger-nano-s"></span> :
                            <span>&nbsp;</span>
                    }
                </div>
            </div>
        </div>
)
