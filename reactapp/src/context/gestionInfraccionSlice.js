import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    SelectedOption: "",
};

export const gestionInfraccionesSlice = createSlice({ // EDITAR
    name: 'gestionInfracciones', // EDITAR
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

export const { setSelectedOption, resetSelectedOption, resetState } = gestionInfraccionesSlice.actions; // EDITAR

export default gestionInfraccionesSlice.reducer; // EDITAR
