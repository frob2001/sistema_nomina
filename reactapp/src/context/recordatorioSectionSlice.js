import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    RecordatorioPage: {},
    RecordatorioCreate: {},
    RecordatorioDetails: {},
    isEditing: false,
};

export const recordatorioSectionSlice = createSlice({
    name: 'recordatorioSection',
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
export const { saveData, deleteData, setIsEditing, resetState } = recordatorioSectionSlice.actions;

// Export the reducer
export default recordatorioSectionSlice.reducer;
