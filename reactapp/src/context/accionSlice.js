import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    AccionPage: {}, // EDITAR
    AccionCreate: {}, // EDITAR
    AccionDetails: {}, // EDITAR
    AccionSearch: {}, // EDITAR
    isEditing: false,
};

export const accionSlice = createSlice({ // EDITAR
    name: 'accion', // EDITAR
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
        resetState: () => initialState,
    },
});

// Export the actions
export const { saveData, deleteData, setIsEditing, resetState } = accionSlice.actions; // EDITAR

// Export the reducer
export default accionSlice.reducer; // EDITAR
