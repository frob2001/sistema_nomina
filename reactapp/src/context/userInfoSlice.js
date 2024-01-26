import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLogged: false
};

export const userInfoSlice = createSlice({
    name: 'userinfo',
    initialState,
    reducers: {
        loggin: (state) => {
            state.isLogged = true;
        },
        logout: (state) => {
            state.isLogged = false;
        },
    },
});


// Export the actions
export const { loggin, logout } = userInfoSlice.actions;

// Export the reducer
export default userInfoSlice.reducer;
