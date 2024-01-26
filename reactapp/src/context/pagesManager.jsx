import React, { useEffect, useContext, useRef } from 'react';
import pagesContext from './pagesContext';

// Redux
import { useDispatch } from 'react-redux';

// Páginas
import { resetState as resetMarcas } from './marcaSlice'; // Marcas Page
import { resetState as resetAcciones } from './accionSlice'; // Acciones a terceros Page

import { resetState as resetPatentes } from './patenteSlice'; // Patentes Page
import { resetState as resetInventores } from './inventorSlice'; // Inventores Page

import { resetState as resetRegulatorios } from './regulatorioSlice'; // Regulatorios Page

import { resetState as resetInfracciones } from './infraccionSlice'; // Infracciones Page

import { resetState as resetClientes } from './clienteSlice'; // Clientes Page
import { resetState as resetContactosC } from './contactoCSlice'; // Contactos C Page
import { resetStateD as resetContactosD } from './contactoDSlice'; // Contactos D Page
import { resetState as resetGacetas } from './gacetaSlice'; // Gacetas Page
import { resetState as resetPropietarios } from './propietarioSlice'; // Propietarios Page

import { resetState as resetAbogados } from './abogadoSlice'; // Abogados Page
import { resetState as resetClases } from './claseSlice'; // Clases Page
import { resetState as resetEstados } from './estadoSlice'; // Estados Page

import { resetState as resetGestionCliente } from './gestionClienteSlice'; // Gestión clientes Page
import { resetState as resetGestionGeneral } from './gestionGeneralSlice'; // Gestión general Page
import { resetState as resetGestionInfraccion } from './gestionInfraccionSlice'; // Gestión infracción Page
import { resetState as resetGestionMarca } from './gestionMarcaSlice'; // Gestión marcas Page
import { resetState as resetGestionPatente } from './gestionPatenteSlice'; // Gestión patentes Page
import { resetState as resetGestionRegulatorio } from './gestionRegulatorioSlice'; // Gestión regulatorio Page

import { resetState as resetRecordatorios } from './recordatorioSectionSlice'; // Recordatorios Page

// Recordatorios
import { completelyDeleteDataDetails } from './recordatorioDetailsSlice'; // Details de recordatorios
import { completelyDeleteData } from './recordatorioSlice'; // Details de recordatorios

const PagesManager = () => {

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const { pages } = useContext(pagesContext);

    // Ref to store the previous state of pages
    const prevPagesRef = useRef(pages);

    useEffect(() => {
        const prevPages = prevPagesRef.current;
        const currentPages = pages;

        // Find which page was deleted by comparing currentPages with prevPages
        const deletedPage = Object.keys(prevPages).find(page => !(page in currentPages));

        if (deletedPage) {
            switch (deletedPage) {
                case 'Marcas':
                    dispatch(resetMarcas());
                    dispatch(completelyDeleteDataDetails({ objectName: 'RecordatoriosMarcasDetails' }));
                    dispatch(completelyDeleteData({ objectName: 'RecordatoriosMarcas' }));
                    break;
                case 'Acciones a terceros':
                    dispatch(resetAcciones());
                    dispatch(completelyDeleteDataDetails({ objectName: 'RecordatoriosAccionesDetails' }));
                    dispatch(completelyDeleteData({ objectName: 'RecordatoriosAcciones' }));
                    break;
                case 'Patentes':
                    dispatch(resetPatentes());
                    dispatch(completelyDeleteDataDetails({ objectName: 'RecordatoriosPatentesDetails' }));
                    dispatch(completelyDeleteData({ objectName: 'RecordatoriosPatentes' }));
                    break;
                case 'Inventores':
                    dispatch(resetInventores());
                    break;
                case 'Regulatorio':
                    dispatch(resetRegulatorios());
                    dispatch(completelyDeleteDataDetails({ objectName: 'RecordatoriosRegulatorioDetails' }));
                    dispatch(completelyDeleteData({ objectName: 'RecordatoriosRegulatorio' }));
                    break;
                case 'Infracciones':
                    dispatch(resetInfracciones());
                    dispatch(completelyDeleteDataDetails({ objectName: 'RecordatoriosInfraccionDetails' }));
                    dispatch(completelyDeleteData({ objectName: 'RecordatoriosInfraccion' }));
                    break;
                case 'Clientes':
                    dispatch(resetClientes());
                    dispatch(resetContactosC());
                    dispatch(resetContactosD());
                    break;
                case 'Gacetas':
                    dispatch(resetGacetas());
                    break;
                case 'Propietarios':
                    dispatch(resetPropietarios());
                    break;
                case 'Abogados':
                    dispatch(resetAbogados());
                    break;
                case 'Clases':
                    dispatch(resetClases());
                    break;
                case 'Estados':
                    dispatch(resetEstados());
                    break;
                case 'Gestión clientes':
                    dispatch(resetGestionCliente());
                    break;
                case 'Gestión general':
                    dispatch(resetGestionGeneral());
                    break;
                case 'Gestión infracciones':
                    dispatch(resetGestionInfraccion());
                    break;
                case 'Gestión marcas':
                    dispatch(resetGestionMarca());
                    break;
                case 'Gestión patentes':
                    dispatch(resetGestionPatente());
                    break;
                case 'Gestión regulatorio':
                    dispatch(resetGestionRegulatorio());
                    break;
                case 'Recordatorios':
                    dispatch(resetRecordatorios());
                    break;
                default:
                    break;
            }
        }

        prevPagesRef.current = pages;

    }, [pages, dispatch]);

    return null; 
};

export default PagesManager;
