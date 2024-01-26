import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    PatentePage: {}, // EDITAR
    PatenteCreate: {}, // EDITAR
    PatenteDetails: {}, // EDITAR
    PatenteSearch: {}, // EDITAR
    isEditing: false,
};

export const patenteSlice = createSlice({ // EDITAR
    name: 'patente', // EDITAR
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
export const { saveData, deleteData, setIsEditing, resetState } = patenteSlice.actions; // EDITAR

// Export the reducer
export default patenteSlice.reducer; // EDITAR
