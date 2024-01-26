import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    SelectedOption: "", 
};

export const gestionPatenteSlice = createSlice({ // EDITAR
    name: 'gestionPatente', // EDITAR
    initialState,
    reducers: {
        setSelectedOption: (state, action) => {
            state.SelectedOption = action.payload;
        },
        resetSelectedOption: (state) => {
            state.SelectedOption = "";
        },
        resetState: () => initialState,
    },
});

export const { setSelectedOption, resetSelectedOption, resetState } = gestionPatenteSlice.actions; // EDITAR

export default gestionPatenteSlice.reducer; // EDITAR
