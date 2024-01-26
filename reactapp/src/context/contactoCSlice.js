import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    ContactoCreate: {}, 
    ContactoDetails: {}, 
    isEditing: false,
    newContactos: [],
    isCreating: false,
    isViewing: false,
    selectedIndex: null
};

export const contactoCSlice = createSlice({ // EDITAR
    name: 'contactoC', // EDITAR
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
        addNewContacto: (state, action) => {
            state.newContactos.push(action.payload);
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
        setSelectedIndex: (state, action) => {
            state.selectedIndex = action.payload;
        },
        deleteSelectedIndex: state => {
            state.selectedIndex = null;
        },
        deleteContacto: (state, action) => {
            const index = action.payload;
            if (index >= 0 && index < state.newContactos.length) {
                state.newContactos.splice(index, 1);
            }
        },
        editContacto: (state, action) => {
            const { index, contacto } = action.payload;
            if (index >= 0 && index < state.newContactos.length) {
                state.newContactos[index] = contacto;
            }
        },
        resetState: () => initialState
    },
});

// Export the actions
export const { saveData, deleteData, setIsEditing, addNewContacto, toggleIsCreating, openViewing, closeCreating, closeViewing, setSelectedIndex, deleteSelectedIndex, resetState, deleteContacto, editContacto} = contactoCSlice.actions; // EDITAR

// Export the reducer
export default contactoCSlice.reducer; // EDITAR
