import React, { Component } from "react"
import { withLoginManager } from "../LoginManager"
import Heading from "./Heading"
import PanelLedger from "./PanelLedger"
import PanelLogin from "./PanelLogin"
import PanelExplorer from "./PanelExplorer"
import Footer from "../Layout/Footer"

import "./index.css"




// <Welcome> component
export default withLoginManager(
    class extends Component {

        // ...
        state = {
            modalShown: false,
            modalButtonText: "CANCEL",
        }


        // ...
        setModalButtonText = (text) =>
            this.setState({
                modalButtonText: text,
            })


        // ...
        handleSignup = () =>
            this.setState({
                modalButtonText: "CANCEL",
                modalShown: true,
            })


        // ...
        render = () =>
            <div className="welcome-content">
                <Heading />
                <div>
                    <div className="flex-row-space-between">
                        <PanelLedger />
                        <PanelLogin />
                        <PanelExplorer />
                    </div>
                </div>
                <Footer />
            </div>

    }
)
