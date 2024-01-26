import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    InventorPage: {}, // EDITAR
    InventorCreate: {}, // EDITAR
    InventorDetails: {}, // EDITAR
    InventorSearch: {}, // EDITAR
    isEditing: false,
};

export const inventorSlice = createSlice({ // EDITAR
    name: 'inventor', // EDITAR
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
export const { saveData, deleteData, setIsEditing, resetState } = inventorSlice.actions; // EDITAR

// Export the reducer
export default inventorSlice.reducer; // EDITAR
