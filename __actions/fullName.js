
const SET_FULL_NAME = "SET_FULL_NAME";

export const updateFullName = (fullName) => {
    return {
        type: SET_FULL_NAME,
        fullName,
    }
};