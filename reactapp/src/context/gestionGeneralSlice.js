import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    SelectedOption: "", 
};

export const gestionGeneralSlice = createSlice({ // EDITAR
    name: 'gestionGeneral', // EDITAR
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

export const { setSelectedOption, resetSelectedOption, resetState } = gestionGeneralSlice.actions; // EDITAR

export default gestionGeneralSlice.reducer; // EDITAR
