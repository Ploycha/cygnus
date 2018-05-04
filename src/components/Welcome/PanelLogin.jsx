import React, { Fragment } from "react"

import { appName } from "../StellarFox/env"

import Login from "../Login"
import Panel from "../../lib/mui-v1/Panel"

import sflogo from "../StellarFox/static/sflogo.svg"




// <PanelLogin> component
export default () =>
    <Panel
        title="Customize"
        content={
            <Fragment>
                <img
                    className="panel-logo"
                    src={sflogo}
                    width="140px"
                    alt={appName}
                />
                <div className="title">
                    Manage your account with ease.
                </div>
                <div className="title-small p-t">
                    Once you have opened your
                    account you can log in here
                    to your banking terminal.
                </div>
                <div className="f-b">
                    <Login />
                </div>
            </Fragment>
        }
    />
