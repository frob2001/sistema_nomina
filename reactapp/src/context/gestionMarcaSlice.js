import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    SelectedOption: "",
};

export const gestionMarcasSlice = createSlice({ // EDITAR
    name: 'gestionMarcas', // EDITAR
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

export const { setSelectedOption, resetSelectedOption, resetState } = gestionMarcasSlice.actions; // EDITAR

export default gestionMarcasSlice.reducer; // EDITAR
