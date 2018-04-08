import React from "react"
import Dialog from "material-ui/Dialog"

import "./index.css"




// <Modal> component
export default ({
    title, actions, open, hideModal, children,
}) =>
    <Dialog
        paperClassName="paper-modal"
        titleClassName="title-modal"
        bodyClassName="body-modal"
        title={title}
        actions={actions}
        modal={true}
        open={open}
        onRequestClose={hideModal}
        autoScrollBodyContent={false}
        repositionOnUpdate={true}
    >
        {children}
    </Dialog>
