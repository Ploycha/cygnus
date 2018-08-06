import React from "react"
import Dialog from "material-ui/Dialog"

import "./index.css"




// <Modal> component
export default ({
    title, actions, open, hideModal, children, repositionOnUpdate,
    paperClassName, titleClassName, bodyClassName,
}) =>
    <Dialog
        paperClassName={paperClassName || "paper-modal"}
        titleClassName={titleClassName || "title-modal"}
        bodyClassName={bodyClassName || "body-modal"}
        title={title}
        actions={actions}
        modal={true}
        open={open}
        onRequestClose={hideModal}
        autoScrollBodyContent={false}
        repositionOnUpdate={repositionOnUpdate || false}
    >
        {children}
    </Dialog>
