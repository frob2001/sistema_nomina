import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    ContactoCreate: {}, 
    ContactoDetails: {}, 
    isEditing: false,
    isCreating: false,
    isViewing: false,
    selectedId: null,
    wasRefreshed: false, // Simple switch para refrescar la tabla
};

export const contactoDSlice = createSlice({ // EDITAR
    name: 'contactoD', // EDITAR
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
        toggleIsCreating: state => {
            state.isCreating = !state.isCreating;
        },
        openViewing: state => {
            state.isViewing = true;
        },
        closeCreating: state => {
            state.isCreating = false;
        },
        closeViewing: state => {
            state.isViewing = false;
        },
        setSelectedId: (state, action) => {
            state.selectedId = action.payload;
        },
        deleteSelectedId: state => {
            state.selectedId = null;
        },
        refreshObjectData: state => {
            state.wasRefreshed = true;
        },
        resetRefreshSwitch: state => {
            state.wasRefreshed = false;
        },
        resetStateD: () => initialState
    },
});

// Export the actions
export const { saveData, deleteData, setIsEditing, toggleIsCreating, openViewing, closeCreating, closeViewing, setSelectedId, deleteSelectedId, resetStateD, refreshObjectData, resetRefreshSwitch } = contactoDSlice.actions; // EDITAR

// Export the reducer
export default contactoDSlice.reducer; // EDITAR
