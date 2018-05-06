import React from "react"
import NotificationsActive from "@material-ui/icons/NotificationsActive"




// ...
export default () =>
    <div className="f-b p-b">
        <NotificationsActive
            className="svg-margin svg-warning svg-tiny"
        />
        <span className="small">
            Data integrity signature missing.
        </span>
    </div>
