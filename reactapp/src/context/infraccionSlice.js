import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    InfraccionPage: {}, // EDITAR
    InfraccionCreate: {}, // EDITAR
    InfraccionDetails: {}, // EDITAR
    InfraccionSearch: {}, // EDITAR
    isEditing: false,
};

export const infraccionSlice = createSlice({ // EDITAR
    name: 'infraccion', // EDITAR
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
export const { saveData, deleteData, setIsEditing, resetState } = infraccionSlice.actions; // EDITAR

// Export the reducer
export default infraccionSlice.reducer; // EDITAR
