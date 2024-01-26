import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    RecordatoriosPatentes: {}, 
    RecordatoriosMarcas: {},
    RecordatoriosAcciones: {},
    RecordatoriosRegulatorio: {},
    RecordatoriosInfraccion: {},
};

export const recordatorioSlice = createSlice({ // EDITAR
    name: 'recordatorio', // EDITAR
    initialState,
    reducers: {
        saveData: (state, action) => {
            const { objectName, value } = action.payload;
            state[objectName] = value;
            /*console.log('Recordatorio data guardado: ', objectName);*/
        },
        deleteData: (state, action) => {
            const { objectName } = action.payload;
            state[objectName] = {wasDeleted: true};
           /* console.log('Recordatorio data eliminado: ', objectName);*/
        },
        completelyDeleteData: (state, action) => {
            const { objectName } = action.payload;
            state[objectName] = {};
           /* console.log('Recordatorio data eliminado totalmente: ', objectName);*/
        },
    },
});

// Export the actions
export const { saveData, deleteData, completelyDeleteData } = recordatorioSlice.actions; // EDITAR

// Export the reducer
export default recordatorioSlice.reducer; // EDITAR
