export default (state = [], action) => {
    switch (action.type) {
        case "UPDATE_AUTH":
            console.log("UPDATE_AUTH", action)
            return {
                ...state,
                authToken: action.authToken,
                fullName: action.fullName,
                isAuthenticated: action.authToken !== null,
                roles: action.roles
            }

            break;
        
        default:
            return state;
    }
}