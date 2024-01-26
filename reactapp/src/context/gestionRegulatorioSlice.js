import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    SelectedOption: "", 
};

export const gestionRegulatorioSlice = createSlice({ // EDITAR
    name: 'gestionRegulatorio', // EDITAR
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

export const { setSelectedOption, resetSelectedOption, resetState } = gestionRegulatorioSlice.actions; // EDITAR

export default gestionRegulatorioSlice.reducer; // EDITAR
