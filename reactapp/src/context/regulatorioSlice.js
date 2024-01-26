import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    RegulatorioPage: {}, // EDITAR
    RegulatorioCreate: {}, // EDITAR
    RegulatorioDetails: {}, // EDITAR
    RegulatorioSearch: {}, // EDITAR
    isEditing: false,
};

export const regulatorioSlice = createSlice({ // EDITAR
    name: 'regulatorio', // EDITAR
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
export const { saveData, deleteData, setIsEditing, resetState } = regulatorioSlice.actions; // EDITAR

// Export the reducer
export default regulatorioSlice.reducer; // EDITAR
