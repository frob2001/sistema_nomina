import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    SelectedOption: "", 
};

export const gestionClienteSlice = createSlice({ // EDITAR
    name: 'gestionCliente', // EDITAR
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

export const { setSelectedOption, resetSelectedOption, resetState } = gestionClienteSlice.actions; // EDITAR

export default gestionClienteSlice.reducer; // EDITAR
