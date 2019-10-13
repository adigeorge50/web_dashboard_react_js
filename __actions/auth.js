
const UPDATE_AUTH = "UPDATE_AUTH";

export const updateAuth = (authToken, fullName, roles) => {
    return {
        type: UPDATE_AUTH,
        authToken,
        fullName,
        roles
    }
};