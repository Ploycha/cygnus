import React, { Fragment } from "react"
import { bindActionCreators } from "redux"
import { connect } from "react-redux"
import { func } from "@xcmats/js-toolbox"
import { withStyles } from "@material-ui/core/styles"
import AboutContent from "../Welcome/AboutContent"
import LoginChoices from "../Welcome/LoginChoices"
import TopHeadingContent from "../Welcome/TopHeadingContent"




/**
 * Cygnus.
 *
 * Renders stand-alone login view.
 *
 * @module client-ui-components
 * @license Apache-2.0
 */




/**
 * `<LoginView>` component.
 *
 * @function LoginView
 * @returns {React.ReactElement}
 */
const LoginView = ({ classes }) =>
    <Fragment>
        <div className={classes.bg}>
            <TopHeadingContent />
        </div>
        <div className="hero-no-shadow">
            <LoginChoices />
        </div>
        <AboutContent />
    </Fragment>




// ...
export default func.compose(
    withStyles((theme) => ({
        bg: {
            backgroundColor: theme.palette.primary.light,
        },
    })),
    connect(
        (_state) => ({}),
        (dispatch) => bindActionCreators({}, dispatch),
    ),
)(LoginView)
