import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    ClientePage: {}, // EDITAR
    ClienteCreate: {}, // EDITAR
    ClienteDetails: {}, // EDITAR
    ClienteSearch: {}, // EDITAR
    CreateDocuments: null,
    CreateEmails: null,
    isEditing: false,
};

export const clienteSlice = createSlice({ // EDITAR
    name: 'cliente', // EDITAR
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
export const { saveData, deleteData, setIsEditing, resetState } = clienteSlice.actions; // EDITAR

// Export the reducer
export default clienteSlice.reducer; // EDITAR
