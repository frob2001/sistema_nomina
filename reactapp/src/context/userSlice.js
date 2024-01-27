import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLogged: false,
    user: {},
};

export const userlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        saveData: (state, action) => {
            const { userData } = action.payload;
            state.user = userData; // Corrected this line
        },
        loggin: (state) => {
            state.isLogged = true;
        },
        logout: (state) => {
            state.isLogged = false;
        },
    },
});


// Export the actions
export const { loggin, logout, saveData } = userlice.actions;

// Export the reducer
export default userlice.reducer;
