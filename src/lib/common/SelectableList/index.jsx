import React, { Component } from "react"
import PropTypes from "prop-types"
import {
    List,
    makeSelectable,
} from "material-ui/List"




// <SelectableList> component
export default ((MUISelectableList) =>
    class extends Component {

        // ...
        static propTypes = {
            children: PropTypes.node.isRequired,
            defaultValue: PropTypes.number.isRequired,
        }


        // ...
        state = {
            selectedIndex: this.props.defaultValue,
        }


        // ...
        handleRequestChange = (_event, index) =>
            this.setState({
                selectedIndex: index,
            })


        // ...
        render = () =>
            <MUISelectableList
                value={this.state.selectedIndex}
                onChange={this.handleRequestChange}
            >
                {this.props.children}
            </MUISelectableList>

    }
)(makeSelectable(List))
