import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    AbogadoPage: {},
    AbogadoCreate: {},
    AbogadoDetails: {},
    isEditing: false,
};

export const abogadoSlice = createSlice({
    name: 'abogado',
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
export const { saveData, deleteData, setIsEditing, resetState } = abogadoSlice.actions;

// Export the reducer
export default abogadoSlice.reducer;
