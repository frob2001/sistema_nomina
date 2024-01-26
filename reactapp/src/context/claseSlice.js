import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    ClasePage: {},
    ClaseCreate: {},
    ClaseDetails: {},
    isEditing: false,
};

export const claseSlice = createSlice({
    name: 'clase',
    initialState,
    reducers: {
        saveData: (state, action) => {
            const { objectName, value } = action.payload;
            state[objectName] = value;
        },
        deleteData: (state, action) => {
            const { objectName } = action.payload;
            state[objectName] = {};
        },
        setIsEditing: (state, action) => {
            state.isEditing = action.payload;
        },
        resetState: () => initialState,
    },
});

// Export the actions
export const { saveData, deleteData, setIsEditing, resetState } = claseSlice.actions;

// Export the reducer
export default claseSlice.reducer;
