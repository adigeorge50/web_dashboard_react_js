export default (state = [], action) => {
    switch (action.type) {
        case "UPDATE_LANG":
            console.log("UPDATE_AUTH", action)
            return {
                ...state,
                language: action.lang
            }

            break;
        
        default:
            return state;
    }
}