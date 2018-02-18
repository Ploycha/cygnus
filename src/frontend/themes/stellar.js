import getMuiTheme from "material-ui/styles/getMuiTheme"

const stellarTheme = getMuiTheme({
    tooltip: {
        color: "rgb(15,46,83)",
        rippleBackgroundColor: "rgb(244,176,4)",
    },
    raisedButton: {
        disabledColor: "rgba(15, 46, 83, 0.5)",
    },
    datePicker: {
        selectColor: "rgb(15,46,83)",
        selectTextColor: "rgb(244,176,4)",
        headerColor: "rgb(15,46,83)",
        textColor: "rgb(244,176,4)",
    },
    flatButton: {
        primaryTextColor: "rgb(15,46,83)",
    },

})

export default stellarTheme