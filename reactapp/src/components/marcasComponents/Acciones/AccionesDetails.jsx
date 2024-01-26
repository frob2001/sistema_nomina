import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsEditing } from '../../../context/accionSlice'; // EDITABLE
import { deleteData as deleteRecordatoriosData } from '../../../context/recordatorioSlice'; // Para eliminar la data persistida cuando se cambie de referencia
import { deleteDataDetails as deleteRecordatoriosDataDetails } from '../../../context/recordatorioDetailsSlice'; // Para eliminar la data persistida cuando se cambie de referencia

// Comentarios
import CommentsD from '../../miscComponents/Comentarios/CommentsD' 

// Components
import DocumentViewer from '../../miscComponents/Documents/DocumentViewer';
import RecordatorioHandler from '../../miscComponents/Recordatorios/RecordatorioHandler';
import EventosHandler from '../../miscComponents/Eventos/EventosHandler';

// Services
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/AccionTerceros`;

import { useAcciones } from '../../../services/useAcciones'; // EDITABLE: MAIN

import { useTipoAccion } from '../../../services/useTipoAccion';
import { useAbogados } from '../../../services/useAbogados';
import { usePaises } from '../../../services/usePais';
import { useEstados } from '../../../services/useEstados';
import { useTipoReferencia } from '../../../services/useTipoReferencia';
import { useGacetas } from '../../../services/useGacetas';
import { useClases } from '../../../services/useClases'; 

// Auth
import { useMsal } from '@azure/msal-react';

function AccionesDetails(props) { // EDITABLE

    // --------------- Auth and request setup -------------------------------------------------------

    const { instance, accounts } = useMsal();
    const getAccessToken = async () => {
        try {
            const accessTokenRequest = {
                scopes: ["api://corralrosales.com/kattion/tasks.write", "api://corralrosales.com/kattion/tasks.read"], // Para leer y escribir tareas
                account: accounts[0],
            };
            const response = await instance.acquireTokenSilent(accessTokenRequest);
            return response.accessToken;
        } catch (e) {
            console.error(e);
            return null;
        }
    };
    const fetcher = async (url) => {
        const accessToken = await getAccessToken();
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Recurso no encontrado");
            }
            throw new Error("Hubo un problema con el servidor, intenta de nuevo");
        }

        return res.json();
    };

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const accionDataDetails = useSelector(state => state.accion.AccionDetails); // EDITABLE: guarda los datos de persistencia
    const isEditing = useSelector(state => state.accion.isEditing); // EDITABLE: guarda si se está editando o no

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null); // GENERAL
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    
    const { data: accionData, error, isLoading, mutate: refresh } = useSWR(`${API_BASE_URL}/${props.accionId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteObject, updateObject } = useAcciones(); // Para editar y eliminar un objeto: EDITABLE
    const prevAccionIdRef = useRef(props.accionId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // Para el dropdown de abogados
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    const { tiposReferencias, error: errorTR, isLoading: isLoadingTR, isValidating: isValidatingTR, refresh: refreshTR } = useTipoReferencia(); // Para el dropdown de tipos de referencias
    const { gacetas, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGacetas(); // Para el dropdown de gacetas
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { tiposAcciones, error: errorTA, isLoading: isLoadingTA, isValidating: isValidatingTA, refresh: refreshTA } = useTipoAccion();
    const { clases, error: errorC, isLoading: isLoadingC, isValidating: isValidatingC, refresh: refreshC } = useClases(); // Para el dropdown de clases

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isClienteChangeUserInitiated, setIsClienteChangeUserInitiated] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false); // Loader para la eliminación o edición
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        selectedTipoAccion: false,
        selectedOficinaTramitante: false,
        selectedAbogado: false,
        marcaBase: false,
        MOdenominacion: false,
        referenciaInterna: false,
        selectedCliente: false,
    };  // EDITABLE: solo los campos requeridos

    // --------------- Estados para comentarios (requieren persistencia) --------------------------------------------

    const [currentComentario, setCurrentComentario] = useState({}); // Para el comentario que se está creando

    // --------------- Estados que requieren persistencia --------------------------------------------

    // Dropdowns (selecciones múltiples)
    const [currentReferencia, setCurrentReferencia] = useState({}); // contiene la referencia que se está creando
    const [referencias, setReferencias] = useState([]); // mapea las referencias que serán añadidas
   
    const [currentMarcaBase, setCurrentMarcaBase] = useState({}); // contiene la marca base 
    const [marcasBase, setMarcasBase] = useState([]); // mapea las marcas base

    const [selectedEstado, setSelectedEstado] = useState(null);
    const [estados, setEstados] = useState([]); // mapea los estados que serán añadidos

    // Lógica general
    const [accion, setAccion] = useState({});// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (accionDataDetails) {

            setIsClienteChangeUserInitiated(false);
            // Comentarios
            setCurrentComentario(accionDataDetails.currentComentario || {});

            // Dropdowns
            setCurrentReferencia(accionDataDetails.currentReferencia || {});
            setReferencias(accionDataDetails.referencias || []);
            setCurrentMarcaBase(accionDataDetails.currentMarcaBase || {});
            setMarcasBase(accionDataDetails.marcasBase || []);
            setSelectedEstado(accionDataDetails.selectedEstado || null);
            setEstados(accionDataDetails.estados || []);

            // Lógica general
            setAccion(accionDataDetails.accion || {});
            setisAnyEmpty(accionDataDetails.isAnyEmpty || false);
            setRequiredFields(accionDataDetails.requiredFields || defaultRequiredFields);
            setActiveIndex(accionDataDetails.activeIndex || 0);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({
            objectName: 'AccionDetails', value:
            {
                currentComentario,
                currentReferencia,
                referencias,
                currentMarcaBase,
                marcasBase,
                selectedEstado,
                estados,
                accion,
                isAnyEmpty,
                requiredFields,
                activeIndex,
            }
        }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [currentComentario,
        currentReferencia,
        referencias,
        currentMarcaBase,
        marcasBase,
        selectedEstado,
        estados,
        accion,
        isAnyEmpty,
        requiredFields,
        activeIndex]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'AccionDetails' }));
        dispatch(deleteRecordatoriosData({ objectName: 'RecordatoriosAcciones' }));
        dispatch(deleteRecordatoriosDataDetails({ objectName: 'RecordatoriosAccionesDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------


    // ------------ Dropdowns de selección múltiple -----------------------------

    // Clases options para Marca Base
    const [clasesOptions, setClasesOptions] = useState([]);
    const [clasesLoading, setClasesLoading] = useState(false);

    const fetchClasesData = async (marca, e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (marca && marca.marcaId) {
            try {
                setClasesLoading(true);
                const API_BASE_URL = `${apiEndpoint}/Clases/Marca/${marca.marcaId}`;
                const accessToken = await getAccessToken();
                const res = await fetch(API_BASE_URL, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Recurso no encontrado");
                    }
                    throw new Error("Hubo un problema con el servidor, intenta de nuevo");
                }

                const fetchedData = await res.json();

                if (fetchedData.length > 0) {
                    setClasesOptions(fetchedData);
                } else {
                    setClasesOptions([]);
                }
            } catch (error) {
                setClasesOptions([]);
            } finally {
                setClasesLoading(false);
            }
        }
    }; // Fetcher que trae las clases para las opciones

    // Paises options para Marca Base
    const [paisesOptions, setPaisesOptions] = useState([]);
    const [paisesLoading, setPaisesLoading] = useState(false);

    const fetchPaisesData = async (marca, e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (marca && marca.marcaId) {
            try {
                setPaisesLoading(true);
                const API_BASE_URL = `${apiEndpoint}/Pais/Marca/${marca.marcaId}`;
                const accessToken = await getAccessToken();
                const res = await fetch(API_BASE_URL, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Recurso no encontrado");
                    }
                    throw new Error("Hubo un problema con el servidor, intenta de nuevo");
                }

                const fetchedData = await res.json();

                if (fetchedData.length > 0) {
                    setPaisesOptions(fetchedData);
                } else {
                    setPaisesOptions([]);
                }
            } catch (error) {
                setPaisesOptions([]);
            } finally {
                setPaisesLoading(false);
            }
        }
    }; // Fetcher que trae los países para las opciones

    useEffect(() => {
        if (currentMarcaBase.selectedMarca && currentMarcaBase.selectedMarca !== undefined) {
            fetchClasesData(currentMarcaBase.selectedMarca);
            fetchPaisesData(currentMarcaBase.selectedMarca);
            fetchPropietariosData(currentMarcaBase.selectedMarca);
        }
    }, [currentMarcaBase.selectedMarca]) 


    // Marcas options para Marca Base
    const [marcasOptions, setMarcasOptions] = useState([]);
    const [marcasLoading, setMarcasLoading] = useState(false);

    const fetchMarcasData = async (cliente, e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (cliente && cliente.clienteId) {
            try {
                setMarcasLoading(true);
                const API_BASE_URL = `${apiEndpoint}/Marcas/Buscar?clienteId=${cliente.clienteId}`;
                const accessToken = await getAccessToken();
                const res = await fetch(API_BASE_URL, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Recurso no encontrado");
                    }
                    throw new Error("Hubo un problema con el servidor, intenta de nuevo");
                }

                const fetchedData = await res.json();

                if (fetchedData.length > 0) {
                    setMarcasOptions(fetchedData);
                } else {
                    setMarcasOptions([]);
                }
            } catch (error) {
                setMarcasOptions([]);
            } finally {
                setMarcasLoading(false);
            }
        }
    }; // Fetcher que trae las marcas para las opciones
    useEffect(() => {
        if (accion?.selectedCliente && accion?.selectedCliente !== undefined) {
            fetchMarcasData(accion.selectedCliente);
        }
    }, [accion?.selectedCliente]) 

    // Propietarios options para Marca Base
    const [propietariosOptions, setPropietariosOptions] = useState([]);
    const [propietariosLoading, setPropietariosLoading] = useState(false);

    const fetchPropietariosData = async (marca, e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (marca && marca.marcaId) {
            try {
                setPropietariosLoading(true);
                const API_BASE_URL = `${apiEndpoint}/Propietarios/Marca/${marca.marcaId}`;
                const accessToken = await getAccessToken();
                const res = await fetch(API_BASE_URL, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error("Recurso no encontrado");
                    }
                    throw new Error("Hubo un problema con el servidor, intenta de nuevo");
                }

                const fetchedData = await res.json();

                if (fetchedData.length > 0) {
                    setPropietariosOptions(fetchedData);
                } else {
                    setPropietariosOptions([]);
                }
            } catch (error) {
                setPropietariosOptions([]);
            } finally {
                setPropietariosLoading(false);
            }
        }
    }; // Fetcher que trae las marcas para las opciones

    // Resetear estados si es que el usuario cambia de cliente
    useEffect(() => {
        if (isClienteChangeUserInitiated) {
            setPropietariosOptions([]);
            setPaisesOptions([]);
            setClasesOptions([]);
            setCurrentMarcaBase({});
            setMarcasBase([]);
            setIsClienteChangeUserInitiated(false); // reset the flag
        }
    }, [accion?.selectedCliente, isClienteChangeUserInitiated]);

    // Referencias
    const handleAddReferencia = (e) => {
        e.preventDefault();
        const { selectedTipoReferencia, referencia } = currentReferencia;

        if (!selectedTipoReferencia || !referencia || referencia?.trim() === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir una referencia, el tipo y la referencia deben estar completos', // EDITABLE
                life: 3000,
            });
            return; // Exit the function if the condition is not met
        }

        if (!referencias.some(ref => (ref.referencia === referencia) && (ref.tipoReferenciaId === selectedTipoReferencia.tipoReferenciaId))) {
            const currentReferenciaTreated = {
                tipoReferenciaId: selectedTipoReferencia.tipoReferenciaId,
                tipoReferencia: selectedTipoReferencia.nombre,
                referencia: referencia,
            }
            setReferencias([...referencias, currentReferenciaTreated]);
            setCurrentReferencia({});
        }
    }; // Agrega una referencia a la lista
    const handleDeleteReferencia = (e, object) => {
        e.preventDefault();
        const updatedReferencias = referencias.filter((item) => item !== object);
        setReferencias(updatedReferencias);
    }; // Quita una referencia de la lista
    useEffect(() => {
        const newReferencias = referencias?.map(ref => ({
            tipoReferenciaId: ref.tipoReferenciaId,
            referencia: ref.referencia
        }));
        setAccion(prevAccion => ({
            ...prevAccion,
            referencias: newReferencias
        }));
    }, [referencias]); // Guarda las referencias en la propiedad de la acción

    // Estados
    const handleAddEstado = (e) => {
        e.preventDefault();
        if (selectedEstado && !estados.some(est => est.codigo === selectedEstado.codigo)) {
            setEstados([...estados, selectedEstado]);
            setSelectedEstado(null);
        }
    }; // Agrega un estado a la lista
    const handleDeleteEstado = (e, object) => {
        e.preventDefault();
        const updatedEstados = estados.filter((item) => item !== object);
        setEstados(updatedEstados);
    }; // Quita un estado de la lista
    useEffect(() => {
        const estadosIds = estados?.map(est => est.codigo);
        setAccion(prevAccion => ({
            ...prevAccion,
            estadosIds: estadosIds
        }));
    }, [estados]); // Guarda los ids de los estados elegidos en la propiedad de la acción

    // Marcas Base
    const handleAddMarcaBase = (e) => {
        e.preventDefault();
        const { selectedMarca, selectedClase, selectedPais, selectedPropietario } = currentMarcaBase;

        if (!selectedMarca || !selectedPais) {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir una marca base, todos los campos obligatorios deben estar completos', // EDITABLE
                life: 3000,
            });
            return; // Exit the function if the condition is not met
        }

        const isDuplicate = marcasBase.some(mb =>
            mb.marcaId === selectedMarca.marcaId &&
            mb.codigoPais.codigoPais === selectedPais.codigoPais &&
            (mb.clase ?? null) === (selectedClase?.codigo ?? null) &&
            (mb.propietarioDD?.propietarioId ?? null) === (selectedPropietario?.propietarioId ?? null)
        );

        if (!isDuplicate) {
            const marcaBaseTreated = {
                marcaId: selectedMarca.marcaId,
                signo: selectedMarca.signo,
                solicitud: selectedMarca.solicitud ?? null,
                registro: selectedMarca.registro ?? null,
                clase: selectedClase?.codigo ?? null,
                codigoPais: selectedPais, 
                propietarioDD: selectedPropietario ? {
                    propietarioId: selectedPropietario?.propietarioId ?? null,
                    nombre: selectedPropietario?.nombre ?? null,
                } : null
            }
            setMarcasBase([...marcasBase, marcaBaseTreated]);
            setCurrentMarcaBase({});
        } else {
            toast.current.show({
                severity: 'info',
                summary: 'Información',
                detail: 'Una marca base idéntica ya existe en la lista', // EDITABLE
                life: 3000,
            });
        }
    }; // Agrega una marca base a la lista
    const handleDeleteMarcaBase = (e, object) => {
        e.preventDefault();
        const updatedMB = marcasBase.filter((item) => item !== object);
        setMarcasBase(updatedMB);
    }; // Quita una marca base de la lista
    useEffect(() => {
        const newMarcasBase = marcasBase.map(mb => ({
            marcaId: mb.marcaId,
            clase: mb.clase ?? null, // Provide a fallback value
            codigoPais: mb.codigoPais?.codigoPais,
            propietario: mb.propietarioDD?.propietarioId ?? null // Provide a fallback value
        }));
        setAccion(prevAccion => ({
            ...prevAccion,
            marcaBase: newMarcasBase
        }));
    }, [marcasBase]); // Guarda las marcas base en la propiedad de la acción



    // ------------------ Dropdowns normales ---------------------------------------

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP();
        refreshA();
        refreshE();
        refreshC();
        refreshG();
        refreshTA();
        refreshTR();
    }; // Refresca los datos de los DROPDOWNs

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA, isValidatingE, isValidatingC, isValidatingG, isValidatingTA, isValidatingTR]); // Cambia el estado de refreshing: GENERAL

    const optionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    const optionTemplateA = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre} {option.apellido}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateA = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre} {option.apellido}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    const optionTemplateG = (option) => {
        return (
            <div className="dropdown-item-container">
                <span><strong>Gaceta N°</strong> {option.numero}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateG = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>Gaceta N°</strong> {option.numero}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    const optionTemplateE = (option) => {
        return (
            <div className="dropdown-item-container">
                <span style={{ color: option.color }}><strong>{option.codigo}</strong> - {option.descripcionEspanol}/{option.descripcionIngles}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateE = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span style={{ color: option.color }}><strong>{option.codigo}</strong> - {option.descripcionEspanol}/{option.descripcionIngles}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    const optionTemplateC = (option) => {
        return (
            <div className="dropdown-item-container">
                <span><strong>Clase N° {option.codigo}</strong> {`${option.descripcionEspanol?.substring(0, 20)}...`} </span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateC = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>Clase N° {option.codigo}</strong> {`${option.descripcionEspanol?.substring(0, 20)}...`}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    const optionTemplateM = (option) => {
        return (
            <div className="dropdown-item-container">
                <span><strong>{option.marcaId}</strong> - {option.signo}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateM = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>{option.marcaId}</strong> - {option.signo}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    const optionTemplatePr = (option) => {
        return (
            <div className="dropdown-item-container">
                <span><strong>{option.propietarioId}</strong> - {option.nombre}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplatePr = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>{option.propietarioId}</strong> - {option.nombre}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    // ------------------ FIN DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (props.accionId !== prevAccionIdRef.current) {
            if (accionData) {
                setAccion({
                    ...accionData,
                    selectedTipoAccion: accionData.tipoAccion,
                    selectedOficinaTramitante: accionData.oficinaTramitante,
                    selectedCliente: accionData.cliente,
                    selectedAbogado: abogados?.find(abogado => abogado.abogadoId === accionData.abogado.abogadoId),

                    MOdenominacion: accionData.marcaOpuesta.denominacion,
                    MOselectedClase: accionData.marcaOpuesta.clase ? clases?.find(clase => clase.codigo === accionData.marcaOpuesta.clase) : null,
                    MOselectedPais: accionData.marcaOpuesta.codigoPais?.codigoPais ?? null,
                    MOsolicitud: accionData.marcaOpuesta.solicitud,
                    MOfechaSolicitud: accionData.marcaOpuesta.fechaSolicitud,
                    MOregistro: accionData.marcaOpuesta.registro,
                    MOfechaRegistro: accionData.marcaOpuesta.fechaRegistro,
                    MOpropietario: accionData.marcaOpuesta.propietario,
                    MOagente: accionData.marcaOpuesta.agente,
                    MOselectedGaceta: accionData.marcaOpuesta.gaceta ? gacetas?.find(gaceta => gaceta.numero === accionData.marcaOpuesta.gaceta) : null,
                    MOfechaGaceta: accionData.marcaOpuesta.fecha,
                }); // EDITABLE

                // Dropdowns
                setCurrentReferencia({});
                setReferencias(accionData.referencias);
                setEstados(accionData.estados);
                setMarcasBase(accionData.marcasBase);

                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);

                // Estados de los dropdowns
                setSelectedEstado(null);

                dispatch(deleteRecordatoriosData({ objectName: 'RecordatoriosAcciones' }));  // Eliminar recordatorios si es que cambia la referencia.
                dispatch(deleteRecordatoriosDataDetails({ objectName: 'RecordatoriosAccionesDetails' }));  // Eliminar recordatorios si es que cambia la referencia.

                prevAccionIdRef.current = props.accionId;
            }
        } else {
            if (!isEditing) {
                if (error) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Hubo un error al contactar con el servidor',
                        life: 3000,
                    });
                } else {
                    if (accionData) {
                        setAccion({
                            ...accionData,
                            selectedTipoAccion: accionData.tipoAccion,
                            selectedOficinaTramitante: accionData.oficinaTramitante,
                            selectedCliente: accionData.cliente,
                            selectedAbogado: abogados?.find(abogado => abogado.abogadoId === accionData.abogado.abogadoId),

                            MOdenominacion: accionData.marcaOpuesta.denominacion,
                            MOselectedClase: accionData.marcaOpuesta.clase ? clases?.find(clase => clase.codigo === accionData.marcaOpuesta.clase) : null,
                            MOselectedPais: accionData.marcaOpuesta.codigoPais?.codigoPais ?? null,
                            MOsolicitud: accionData.marcaOpuesta.solicitud,
                            MOfechaSolicitud: accionData.marcaOpuesta.fechaSolicitud,
                            MOregistro: accionData.marcaOpuesta.registro,
                            MOfechaRegistro: accionData.marcaOpuesta.fechaRegistro,
                            MOpropietario: accionData.marcaOpuesta.propietario,
                            MOagente: accionData.marcaOpuesta.agente,
                            MOselectedGaceta: accionData.marcaOpuesta.gaceta ? gacetas?.find(gaceta => gaceta.numero === accionData.marcaOpuesta.gaceta) : null,
                            MOfechaGaceta: accionData.marcaOpuesta.fecha,
                        }); // EDITABLE

                        // Dropdowns
                        setCurrentReferencia({});
                        setReferencias(accionData.referencias);
                        setEstados(accionData.estados);
                        setMarcasBase(accionData.marcasBase);

                        setisAnyEmpty(false);
                        setRequiredFields(defaultRequiredFields);

                        // Estados de los dropdowns
                        setSelectedEstado(null);
                    }
                }
            }
        }
    }, [accionData, isEditing, props.accionId]); // useEffect para escuchar cambios en estadoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO

    const updateSelectedObject = (selectedObject, value) => {
        setAccion(prev => ({ ...prev, [selectedObject]: value })); // Editar
    }; // Maneja el cambio para un dropdown

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setAccion(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
    }; // Maneja el cambio para un tag de input

    const confirmDeletion = (event) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Esta acción es irreversible',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: handleDelete
        });
    }; // Maneja la confirmación para eliminar o no: GENERAL

    const handleDelete = async (e) => {
        try {
            setIsLoading2(true);
            const response = await deleteObject(props.accionId); // EDITABLE
            if (response === 204) {
                deletePersistedStates();
                dispatch(setIsEditing(false));
                props.onDeleted()
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al eliminar el registro',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la eliminación del objeto: ESPECIFICO

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

    const validateRequiredFields = (accion) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(accion[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(accion);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const finalAccion = {
                "tipoAccionId": accion.selectedTipoAccion.tipoAccionId,
                "oficinaTramitante": accion.selectedOficinaTramitante.clienteId,
                "abogadoId": accion.selectedAbogado.abogadoId,
                "estados": accion.estadosIds ? accion.estadosIds : accion.estados.map(est => est.codigo), 
                "marcaBase": accion.marcaBase,
                "marcaOpuesta": {
                    "denominacion": accion.MOdenominacion,
                    "clase": accion.MOselectedClase?.codigo ?? null,
                    "codigoPais": accion.MOselectedPais ? accion.MOselectedPais?.codigoPais : null,
                    "solicitud": accion.MOsolicitud,
                    "fechaSolicitud": accion.MOfechaSolicitud,
                    "registro": accion.MOregistro,
                    "fechaRegistro": accion.MOfechaRegistro,
                    "propietario": accion.MOpropietario,
                    "agente": accion.MOagente,
                    "gaceta": accion.MOselectedGaceta ? accion.MOselectedGaceta.numero : null ,
                    "fecha": accion.MOfechaGaceta
                },
                "referencias": accion.referencias.map(ref => ({
                    tipoReferenciaId: ref.tipoReferenciaId,
                    referencia: ref.referencia
                })),
                "referenciaInterna": accion.referenciaInterna,
                "clienteId": accion.selectedCliente.clienteId,
            }

            const response = await updateObject(props.accionId, finalAccion);

            if (response === 204) {
                dispatch(setIsEditing(false));
                deletePersistedStates();
                props.onEdited();
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'error',
                detail: 'hubo un error al editar el registro',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la edición del objeto: ESPECIFICO (Hay que tener ciudado con el ID)
    const handleCancel = () => {
        isClosingRef.current = true;
        dispatch(setIsEditing(false));
        deletePersistedStates();

        props.onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    // ----------------------------------- Controlar el draggable cuando se muestren eventos ------------------------------------------------------------

    const [isDraggableDisabled, setIsDraggableDisabled] = useState(false);

    const handleDialogVisibilityChange = (isVisible) => {
        setIsDraggableDisabled(isVisible);
    };

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea, table" bounds="parent" disabled={isDraggableDisabled}>
                <div className="form-container wider-form">
                    {(isLoading || isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <>
                        <section className="form-header">
                            <span>{`Acción a terceros: ${accion?.accionTerceroId || ''} - Objeto: ${accion?.marcaOpuesta?.denominacion || ''}`}</span>
                            <div className="form-header-buttons">
                                <Button className="form-header-btn" onClick={handleCancel}>
                                    <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                </Button>
                            </div>
                        </section>

                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} scrollable>
                            <TabPanel header="Acción a terceros" leftIcon="pi pi-inbox mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-info-circle"></i>
                                            <label>Información de la acción</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Tipo de acción a terceros <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <div>
                                                    {
                                                        errorTA || !tiposAcciones ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {isLoadingTA || (isRefreshing && isValidatingTA) ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                className={`${requiredFields.selectedTipoAccion && 'form-group-empty'}`}
                                                                style={{ width: '100%' }}
                                                                value={accion?.selectedTipoAccion}
                                                                onChange={(e) => updateSelectedObject('selectedTipoAccion', e.value)}
                                                                options={tiposAcciones}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona un tipo de acción"
                                                                filter
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplate}
                                                                itemTemplate={optionTemplate}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Referencia interna <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.referenciaInterna && 'form-group-empty'}`} type="text" name="referenciaInterna" value={accion?.referenciaInterna || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia interna" />
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-users"></i>
                                            <label>Involucrados</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Cliente <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <DebounceDropdown disabled={!isEditing} onValueChange={() => setIsClienteChangeUserInitiated(true)} className={`${requiredFields.selectedCliente && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedCliente', value)} selectedObject={accion?.selectedCliente} filterBy="clienteId,nombre" />
                                            </div>
                                            <div className="form-group" style={{ minWidth: 'calc(100% - 20px)' }}>
                                                <label>Oficina Tramitante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <DebounceDropdown disabled={!isEditing} className={`${requiredFields.selectedOficinaTramitante && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedOficinaTramitante', value)} selectedObject={accion?.selectedOficinaTramitante} filterBy="clienteId,nombre" />
                                            </div>
                                            <div className="form-group">
                                                <label>Responsable <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <div>
                                                    {
                                                        errorA || !abogados ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {isLoadingA || (isRefreshing && isValidatingA) ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                className={`${requiredFields.selectedAbogado && 'form-group-empty'}`}
                                                                style={{ width: '100%' }}
                                                                value={accion?.selectedAbogado}
                                                                onChange={(e) => updateSelectedObject('selectedAbogado', e.value)}
                                                                options={abogados}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona un abogado"
                                                                filter
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplateA}
                                                                itemTemplate={optionTemplateA}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-tags"></i>
                                            <label>Referencias</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Otras referencias</label>
                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                    <div style={{ width: '40%' }}>
                                                        {
                                                            errorTR || !tiposReferencias ? (
                                                                <div className="dropdown-error">
                                                                    <div className="dropdown-error-msg">
                                                                        {isLoadingTR || (isRefreshing && isValidatingTR) ?
                                                                            <div className="small-spinner" /> :
                                                                            <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                    </div>
                                                                    <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Dropdown
                                                                    disabled={!isEditing}
                                                                    showClear
                                                                    style={{ width: '100%' }}
                                                                    value={currentReferencia.selectedTipoReferencia}
                                                                    onChange={(e) => setCurrentReferencia({ ...currentReferencia, selectedTipoReferencia: e.value })}
                                                                    options={tiposReferencias}
                                                                    optionLabel="nombre"
                                                                    placeholder="Selecciona un tipo"
                                                                    filter
                                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                                    valueTemplate={selectedValueTemplate}
                                                                    itemTemplate={optionTemplate}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                    <input readOnly={!isEditing} style={{ width: '60%' }} type="text" name="referencia" value={currentReferencia.referencia || ''} onChange={(e) => setCurrentReferencia({ ...currentReferencia, referencia: e.target.value })} maxLength="70" placeholder="Referencia" />
                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddReferencia}>
                                                        <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Referencias Agregadas ({referencias?.length})</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ maxHeight: '100px' }}>
                                                    {referencias?.map((ref, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '50% 50%' }}>
                                                                <td className="table-nombre-abogado"><strong>Tipo: </strong>{ref.tipoReferencia}</td>
                                                                <td className="table-nombre-abogado"><strong>Referencia: </strong>{ref.referencia}</td>
                                                            </div>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteReferencia(e, ref)}>
                                                                    <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                </div>
                            </TabPanel>
                            <TabPanel header="Marcas base" leftIcon="pi pi-verified mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-verified"></i>
                                            <label>Marcas Base</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-double">
                                                <label>Marca <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <div style={{ width: '100%' }}>
                                                    {
                                                        marcasOptions.length === 0 ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {marcasLoading ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>No hay marcas que mostrar</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={(e) => fetchMarcasData(accion?.selectedCliente, e)}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                className={`${requiredFields.marcaBase && 'form-group-empty'}`}
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={currentMarcaBase.selectedMarca}
                                                                onChange={(e) => setCurrentMarcaBase({ ...currentMarcaBase, selectedMarca: e.value })}
                                                                options={marcasOptions}
                                                                optionLabel="signo"
                                                                placeholder="Selecciona una marca"
                                                                filter
                                                                filterBy="signo,marcaId"
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplateM}
                                                                itemTemplate={optionTemplateM}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Clase</label>
                                                <div style={{ width: '100%' }}>
                                                    {
                                                        clasesOptions.length === 0 ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {clasesLoading ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>No hay clases que mostrar</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={(e) => fetchClasesData(currentMarcaBase?.selectedMarca, e)}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={currentMarcaBase.selectedClase}
                                                                onChange={(e) => setCurrentMarcaBase({ ...currentMarcaBase, selectedClase: e.value })}
                                                                options={clasesOptions}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona una clase"
                                                                filter
                                                                filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplateC}
                                                                itemTemplate={optionTemplateC}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>País <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <div style={{ width: '100%' }}>
                                                    {
                                                        paisesOptions.length === 0 ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {paisesLoading ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>No hay países que mostrar</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={(e) => fetchClasesData(currentMarcaBase?.selectedMarca, e)}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                className={`${requiredFields.marcaBase && 'form-group-empty'}`}
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={currentMarcaBase.selectedPais}
                                                                onChange={(e) => setCurrentMarcaBase({ ...currentMarcaBase, selectedPais: e.value })}
                                                                options={paisesOptions}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona un país"
                                                                filter
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplate}
                                                                itemTemplate={optionTemplate}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Propietario</label>
                                                <div style={{ width: '100%' }}>
                                                    {
                                                        propietariosOptions.length === 0 ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {propietariosLoading ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>No hay propietarios que mostrar</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={(e) => fetchPropietariosData(currentMarcaBase?.selectedMarca, e)}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={currentMarcaBase.selectedPropietario}
                                                                onChange={(e) => setCurrentMarcaBase({ ...currentMarcaBase, selectedPropietario: e.value })}
                                                                options={propietariosOptions}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona un propietario"
                                                                filter
                                                                filterBy="propietarioId,nombre"
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplatePr}
                                                                itemTemplate={optionTemplatePr}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <button disabled={!isEditing} className={`form-accept-btn logo-btn ${requiredFields.marcaBase && 'form-group-empty'}`} style={{ margin: '3px auto 0px auto' }} onClick={handleAddMarcaBase}>
                                                <i className="pi pi-plus-circle"></i>
                                                <span>Agregar</span>
                                            </button>
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Marcas Agregadas ({marcasBase?.length})</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ maxHeight: '280px' }}>
                                                    {marcasBase?.map((mb, index) => (
                                                        <tr className="comment-container" key={index}>
                                                            <td className="comment-title-container" style={{ paddingLeft: '10px' }}>
                                                                <p><strong style={{ fontSize: '14px' }}>{mb.signo}</strong></p>
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteMarcaBase(e, mb)}>
                                                                    <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </td>
                                                            <td className="comment-comment-container" style={{ margin: '0', padding: '10px 0px' }}>
                                                                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '30% 35% 35%' }}>
                                                                    <div className="table-nombre-abogado"><strong>Clase: </strong>{mb.clase ?? 'no seleccionó'}</div>
                                                                    <div className="table-nombre-abogado"><strong>Propietario: </strong>{mb.propietarioDD && mb.propietarioDD.propietarioId && mb.propietarioDD.nombre ? `${mb.propietarioDD.propietarioId} ${mb.propietarioDD.nombre}` : 'no seleccionó'}</div>
                                                                    <div className="table-nombre-abogado"><strong>País: </strong>{mb.codigoPais?.nombre ?? 'no seleccionó'}</div>
                                                                    <div className="table-nombre-abogado"><strong>Solicitud: </strong>{mb.solicitud ?? 'La marca no tiene solicitud'}</div>
                                                                    <div className="table-nombre-abogado"><strong>Registro: </strong>{mb.registro ?? 'La marca no tiene registro'}</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                </div>
                            </TabPanel>
                            <TabPanel header="Marca opuesta" leftIcon="pi pi-sync mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-verified"></i>
                                            <label>Marca Opuesta</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-single">
                                                <label>Denominación <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.MOdenominacion && 'form-group-empty'}`} type="text" name="MOdenominacion" value={accion?.MOdenominacion || ''} onChange={handleInputChange} maxLength="70" placeholder="Denominación" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Clase</label>
                                                <div>
                                                    {
                                                        errorC || !clases ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {isLoadingC || (isRefreshing && isValidatingC) ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={accion?.MOselectedClase}
                                                                onChange={(e) => updateSelectedObject('MOselectedClase', e.value)}
                                                                options={clases}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona una clase"
                                                                filter
                                                                filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplateC}
                                                                itemTemplate={optionTemplateC}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>País</label>
                                                <div>
                                                    {
                                                        errorP || !paises ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {isLoadingP || (isRefreshing && isValidatingP) ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={accion?.MOselectedPais}
                                                                onChange={(e) => updateSelectedObject('MOselectedPais', e.value)}
                                                                options={paises}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona un país"
                                                                filter
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplate}
                                                                itemTemplate={optionTemplate}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Solicitud</label>
                                                <input readOnly={!isEditing} type="text" name="MOsolicitud" value={accion?.MOsolicitud || ''} onChange={handleInputChange} maxLength="70" placeholder="Solicitud" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de solicitud</label>
                                                <input readOnly={!isEditing} type="date" name="MOfechaSolicitud" value={accion?.MOfechaSolicitud ? accion.MOfechaSolicitud.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Registro</label>
                                                <input readOnly={!isEditing} type="text" name="MOregistro" value={accion?.MOregistro || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de registro" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de registro</label>
                                                <input readOnly={!isEditing} type="date" name="MOfechaRegistro" value={accion?.MOfechaRegistro ? accion.MOfechaRegistro.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Propietario</label>
                                                <input readOnly={!isEditing} type="text" name="MOpropietario" value={accion?.MOpropietario || ''} onChange={handleInputChange} maxLength="70" placeholder="Propietario" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Agente</label>
                                                <input readOnly={!isEditing} type="text" name="MOagente" value={accion?.MOagente || ''} onChange={handleInputChange} maxLength="70" placeholder="Agente" />
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-book"></i>
                                            <label>Gaceta</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-double">
                                                <label>Gaceta</label>
                                                <div>
                                                    {
                                                        errorG || !gacetas ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {isLoadingG || (isRefreshing && isValidatingG) ?
                                                                        <div className="small-spinner" /> :
                                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                </div>
                                                                <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
                                                                disabled={!isEditing}
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={accion?.MOselectedGaceta}
                                                                onChange={(e) => updateSelectedObject('MOselectedGaceta', e.value)}
                                                                options={gacetas}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona una gaceta"
                                                                filter
                                                                filterBy="numero"
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplateG}
                                                                itemTemplate={optionTemplateG}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de gaceta</label>
                                                <input readOnly={!isEditing} type="date" name="MOfechaGaceta" value={accion?.MOfechaGaceta ? accion.MOfechaGaceta.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </TabPanel>
                            <TabPanel header="Expediente" leftIcon="pi pi-file-edit mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-tag"></i>
                                            <label>Estados</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-single">
                                                <label>Estados</label>
                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                    <div style={{ width: '100%' }}>
                                                        {
                                                            errorE || !estadosOptions ? (
                                                                <div className="dropdown-error">
                                                                    <div className="dropdown-error-msg">
                                                                        {isLoadingE || (isRefreshing && isValidatingE) ?
                                                                            <div className="small-spinner" /> :
                                                                            <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                    </div>
                                                                    <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Dropdown
                                                                    disabled={!isEditing}
                                                                    showClear
                                                                    style={{ width: '100%', maxWidth: '588px' }}
                                                                    value={selectedEstado}
                                                                    onChange={(e) => setSelectedEstado(e.value)}
                                                                    options={estadosOptions}
                                                                    optionLabel="nombre"
                                                                    placeholder="Selecciona un estado"
                                                                    filter
                                                                    filterBy="codigo,descripcionEspanol,descripcionIngles"
                                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                                    valueTemplate={selectedValueTemplateE}
                                                                    itemTemplate={optionTemplateE}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddEstado}>
                                                        <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Estados agregados ({estados?.length})</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ maxHeight: '120px' }}>
                                                    {estados?.map((est, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <td className="table-nombre-abogado" style={{ color: est.color }}><strong>{est.codigo} - </strong>{est.descripcionEspanol}/{est.descripcionIngles}</td>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteEstado(e, est)}>
                                                                    <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                </div>
                            </TabPanel>
                            <TabPanel header="Eventos" leftIcon="pi pi-calendar mr-2">
                                <EventosHandler tablaConexion="acciontercero" idConexion={props.accionId} nombreRegistro={`Objeto: ${accion?.MOdenominacion}`} onDialogVisibilityChange={handleDialogVisibilityChange} isClosingRef={isClosingRef} />
                            </TabPanel>
                            <TabPanel header="Comentarios" leftIcon="pi pi-comments mr-2">
                                <CommentsD onCommentChange={setCurrentComentario} persistedComment={currentComentario} tablaConexion="acciontercero" idConexion={props.accionId} />
                            </TabPanel>
                            <TabPanel header="Recordatorios" leftIcon="pi pi-bell mr-2">
                                <RecordatorioHandler tablaConexion="acciontercero" idConexion={props.accionId} nombrePadre="RecordatoriosAcciones" isClosingRef={isClosingRef} />
                            </TabPanel>
                            <TabPanel header="Documentos" leftIcon="pi pi-paperclip mr-2">
                                <div className="form-info-msg" style={{ paddingBottom: '0' }}>
                                    <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                    <span>Por favor, permanezca en la pestaña para conservar cualquier cambio y archivo seleccionado</span>
                                </div>
                                <section className="form-body form-body--create">
                                    <DocumentViewer type="documentos" tablaConexion="acciontercero" idConexion={props.accionId} />
                                    <DocumentViewer type="correos" tablaConexion="acciontercero" idConexion={props.accionId} />
                                </section>
                            </TabPanel>
                        </TabView>
                        <div className="center-hr">
                            <hr />
                        </div>
                        <section className="form-footer">
                            <div className="form-UD-btns">
                                <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
                                <ToggleButton onLabel="Leer" offLabel="Editar" onIcon="pi pi-eye" offIcon="pi pi-pencil"
                                    checked={isEditing} onChange={(e) => dispatch(setIsEditing(e.value))} />
                            </div>
                            {(isAnyEmpty && isEditing) &&
                                <div className="empty-fields-msg">
                                    <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                    <span>Por favor, llena todos los datos <strong>requeridos</strong></span>
                                </div>
                            }
                            {isEditing &&
                                <div className="form-UD-btns">
                                    <button onClick={confirmDeletion} className="form-delete-btn">Eliminar</button>
                                    <button onClick={handleEdit} className="form-accept-btn">Editar</button>
                                </div>
                            }
                        </section>
                    </>
                </div>
            </Draggable>
            <Toast ref={toast} />
            <ConfirmPopup />
        </>
    );
}

export default AccionesDetails;