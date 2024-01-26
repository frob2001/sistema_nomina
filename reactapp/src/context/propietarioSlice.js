import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    PropietarioPage: {}, // EDITAR
    PropietarioCreate: {}, // EDITAR
    PropietarioDetails: {}, // EDITAR
    PropietarioSearch: {}, // EDITAR
    isEditing: false,
};

export const propietarioSlice = createSlice({ // EDITAR
    name: 'propietario', // EDITAR
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
export const { saveData, deleteData, setIsEditing, resetState } = propietarioSlice.actions; // EDITAR

// Export the reducer
export default propietarioSlice.reducer; // EDITAR
