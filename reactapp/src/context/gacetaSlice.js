import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    GacetaPage: {}, // EDITAR
    GacetaCreate: {}, // EDITAR
    GacetaDetails: {}, // EDITAR
    isEditing: false,
};

export const gacetaSlice = createSlice({ // EDITAR
    name: 'gaceta', // EDITAR
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
export const { saveData, deleteData, setIsEditing, resetState } = gacetaSlice.actions; // EDITAR

// Export the reducer
export default gacetaSlice.reducer; // EDITAR