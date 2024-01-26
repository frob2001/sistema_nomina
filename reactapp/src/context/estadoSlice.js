import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    EstadoPage: {},
    EstadoCreate: {},
    EstadoDetails: {},
    isEditing: false,
};

export const estadoSlice = createSlice({
    name: 'estado',
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
export const { saveData, deleteData, setIsEditing, resetState } = estadoSlice.actions;

// Export the reducer
export default estadoSlice.reducer;
