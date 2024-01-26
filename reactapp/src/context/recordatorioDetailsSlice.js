import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    RecordatoriosPatentesDetails: { isEditing: false }, 
    RecordatoriosMarcasDetails: { isEditing: false },
    RecordatoriosAccionesDetails: { isEditing: false },
    RecordatoriosRegulatorioDetails: { isEditing: false },
    RecordatoriosInfraccionDetails: { isEditing: false },
};

export const recordatorioDetailsSlice = createSlice({ // EDITAR
    name: 'recordatorioDetails', // EDITAR
    initialState,
    reducers: {
        saveDataDetails: (state, action) => {
            const { objectName, value } = action.payload;
            state[objectName] = { ...state[objectName], ...value };
        },
        deleteDataDetails: (state, action) => {
            const { objectName } = action.payload;
            state[objectName] = {wasDeleted: true, isEditing: false};
        },
        completelyDeleteDataDetails: (state, action) => {
            const { objectName } = action.payload;
            state[objectName] = { isEditing: false };
        },
        toggleIsEditing: (state, action) => {
            const { objectName, isEditingValue } = action.payload;
            state[objectName] = { ...state[objectName], isEditing: isEditingValue };
        }
    },
});

// Export the actions
export const { saveDataDetails, deleteDataDetails, completelyDeleteDataDetails, toggleIsEditing } = recordatorioDetailsSlice.actions; // EDITAR

// Export the reducer
export default recordatorioDetailsSlice.reducer; // EDITAR
