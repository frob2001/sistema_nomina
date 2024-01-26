import { configureStore } from '@reduxjs/toolkit';
import abogadoReducer from './abogadoSlice';
import claseReducer from './claseSlice';
import estadoReducer from './estadoSlice';
import sidebarReducer from './sidebarSlice';
import userInfoReducer from './userInfoSlice';
import clienteReducer from './clienteSlice';
import contactoCReducer from './contactoCSlice';
import contactoDReducer from './contactoDSlice';
import gacetaReducer from './gacetaSlice';
import propietarioReducer from './propietarioSlice';
import inventorReducer from './inventorSlice';
import gestionClienteReducer from './gestionClienteSlice';
import gestionGeneralReducer from './gestionGeneralSlice';
import gestionPatenteReducer from './gestionPatenteSlice';
import gestionRegulatorioReducer from './gestionRegulatorioSlice';
import gestionMarcaReducer from './gestionMarcaSlice';
import gestionInfraccionReducer from './gestionInfraccionSlice';
import patenteReducer from './patenteSlice';
import recordatorioReducer from './recordatorioSlice';
import recordatorioDetailsReducer from './recordatorioDetailsSlice';
import recordatorioSectionReducer from './recordatorioSectionSlice';
import marcaReducer from './marcaSlice';
import infraccionReducer from './infraccionSlice';
import regulatorioReducer from './regulatorioSlice';
import accionReducer from './accionSlice';

export const store = configureStore({
    reducer: {
        userinfo: userInfoReducer,
        sidebar: sidebarReducer,
        abogado: abogadoReducer,
        clase: claseReducer,
        estado: estadoReducer,
        cliente: clienteReducer,
        contactoC: contactoCReducer,
        contactoD: contactoDReducer,
        gaceta: gacetaReducer,
        propietario: propietarioReducer,
        inventor: inventorReducer,
        gestionCliente: gestionClienteReducer,
        gestionGeneral: gestionGeneralReducer,
        gestionPatente: gestionPatenteReducer,
        patente: patenteReducer,
        gestionRegulatorio: gestionRegulatorioReducer,
        gestionMarca: gestionMarcaReducer,
        gestionInfraccion: gestionInfraccionReducer,
        recordatorio: recordatorioReducer,
        recordatorioDetails: recordatorioDetailsReducer,
        recordatorioSection: recordatorioSectionReducer,
        marca: marcaReducer,
        infraccion: infraccionReducer,
        regulatorio: regulatorioReducer,
        accion: accionReducer,
    },
});

// You might add other reducers to the store as needed
