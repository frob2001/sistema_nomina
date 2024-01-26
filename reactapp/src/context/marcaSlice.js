import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    MarcaPage: {}, // EDITAR
    MarcaCreate: {}, // EDITAR
    MarcaDetails: {}, // EDITAR
    MarcaSearch: {}, // EDITAR
    MarcaDuplicate: {}, // EDITAR
    isEditing: false,
    isMarcaFetched: false,
};

export const marcaSlice = createSlice({ // EDITAR
    name: 'marca', // EDITAR
    initialState,
    reducers: {
        saveData: (state, action) => {
            const { objectName, value } = action.payload;

            // Merge new attributes with existing ones without duplication
            state[objectName] = {
                ...state[objectName],
                ...value,
            };
        },
        deleteData: (state, action) => {
            const { objectName } = action.payload;
            state[objectName] = {};
        },
        setIsEditing: (state, action) => {
            state.isEditing = action.payload;
        },
        setIsMarcaFetched: (state, action) => {
            state.isMarcaFetched = action.payload;
        },
        resetState: () => initialState,
    },
});

// Export the actions
export const { saveData, deleteData, setIsEditing, setIsMarcaFetched, resetState } = marcaSlice.actions; // EDITAR

// Export the reducer
export default marcaSlice.reducer; // EDITAR
