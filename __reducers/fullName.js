export default (state = '', action) => {
    switch (action.type) {
        case "SET_FULL_NAME":
            return action.fullName;  
        default:
            return state;
    }
}