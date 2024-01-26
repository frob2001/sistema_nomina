import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/accionSlice'; //EDITABLE: MAIN

// Comentarios
import CommentsC from '../../miscComponents/Comentarios/CommentsC'
import { useComments } from '../../../services/useComments'; // Para la creación de documentos y correos

// Documentos
import DocumentPickerC from '../../miscComponents/Documents/DocumentPickerC';
import { useFiles } from '../../../services/useFiles'; // Para la creación de documentos y correos

// Servicios
import { useAcciones } from '../../../services/useAcciones'; // EDITABLE: MAIN

import { useTipoAccion } from '../../../services/useTipoAccion'; 
import { useAbogados } from '../../../services/useAbogados'; 
import { usePaises } from '../../../services/usePais'; 
import { useEstados } from '../../../services/useEstados';
import { useTipoReferencia } from '../../../services/useTipoReferencia'; 
import { useGacetas } from '../../../services/useGacetas'; 
import { useClases } from '../../../services/useClases'; 

// Auth
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
import { useMsal } from '@azure/msal-react';

function AccionesCreate({ onClose, onCreated }) { //EDITABLE

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

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const accionCreateData = useSelector(state => state.accion.AccionCreate); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject } = useAcciones(); // Servicio necesario para crear el objeto
    const { uploadFile } = useFiles(); // Servicio para subir archivos
    const { uploadComment } = useComments(); // Servicio para subir comentarios
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia
    const toast = useRef(null); // Referencia para el toast

    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // Para el dropdown de abogados
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    const { tiposReferencias, error: errorTR, isLoading: isLoadingTR, isValidating: isValidatingTR, refresh: refreshTR } = useTipoReferencia(); // Para el dropdown de tipos de referencias
    const { gacetas, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGacetas(); // Para el dropdown de gacetas
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { tiposAcciones, error: errorTA, isLoading: isLoadingTA, isValidating: isValidatingTA, refresh: refreshTA } = useTipoAccion();
    const { clases, error: errorC, isLoading: isLoadingC, isValidating: isValidatingC, refresh: refreshC } = useClases(); // Para el dropdown de clases

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isClienteChangeUserInitiated, setIsClienteChangeUserInitiated] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewAccion = {
        selectedTipoAccion: null,
        selectedOficinaTramitante: null,
        selectedAbogado: null,
        estados: [],
        marcaBase: [], // arreglo de marcas base

        MOdenominacion: '',
        MOselectedClase: null,
        MOselectedPais: null,
        MOsolicitud: '',
        MOfechaSolicitud: '',
        MOregistro: '',
        MOfechaRegistro: '',
        MOpropietario: '',
        MOagente: '',
        MOselectedGaceta: null,
        MOfechaGaceta: '',

        referencias: [],
        referenciaInterna: '',
        selectedCliente: null,
    }; 
    const defaultRequiredFields = {
        selectedTipoAccion: false,
        selectedOficinaTramitante: false,
        selectedAbogado: false,
        marcaBase: false,

        MOdenominacion: false,
        MOselectedClase: false,
        MOselectedPais: false,
        MOsolicitud: false,
        MOfechaSolicitud: false,
        MOregistro: false,
        MOfechaRegistro: false,
        MOpropietario: false,
        MOagente: false,
        MOselectedGaceta: false, 
        MOfechaGaceta: false,

        referenciaInterna: false,
        selectedCliente: false,
    }; 

    // --------------- Estados para documentos (sin persistencia) --------------------------------------------

    const [documentos, setDocumentos] = useState([]); // Para los documentos que se subirán
    const [correos, setCorreos] = useState([]); // Para los correos que se subirán
    const [isRequiredEmpty, setIsRequiredEmpty] = useState(true);

    const handleDocumentosCallback = (newFiles) => {
        setDocumentos(newFiles);
    }; // Callback para actualizar documentos

    const handleCorreosCallback = (newFiles) => {
        setCorreos(newFiles);
    }; // Callback para actualizar correos

    // --------------- Estados para comentarios (requieren persistencia) --------------------------------------------

    const [comentariosData, setComentariosData] = useState([]); // Para los comentarios que se subirán
    const [resetComments, setResetComments] = useState(false); // Para borrar los comentarios una vez se hayan creado

    const handleComentariosCallback = (newComments) => {
        setComentariosData(newComments);
    }; // Callback para actualizar comentarios

    // --------------- Estados que requieren persistencia --------------------------------------------

    // Dropdowns (selecciones múltiples)
    const [currentReferencia, setCurrentReferencia] = useState({}); // contiene la referencia que se está creando
    const [referencias, setReferencias] = useState([]); // mapea las referencias que serán añadidas
   
    const [currentMarcaBase, setCurrentMarcaBase] = useState({}); // contiene la marca base 
    const [marcasBase, setMarcasBase] = useState([]); // mapea las marcas base

    const [selectedEstado, setSelectedEstado] = useState(null);
    const [estados, setEstados] = useState([]); // mapea los estados que serán añadidos
    

    // Lógica general
    const [newAccion, setNewAccion] = useState(defaultNewAccion);// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (accionCreateData) { // EDITABLE

            setIsClienteChangeUserInitiated(false);
            // Comentarios
            setComentariosData(accionCreateData.comentariosData || []);

            // Dropdowns
            setCurrentReferencia(accionCreateData.currentReferencia || {});
            setReferencias(accionCreateData.referencias || []);
            setCurrentMarcaBase(accionCreateData.currentMarcaBase || {});
            setMarcasBase(accionCreateData.marcasBase || []);
            setSelectedEstado(accionCreateData.selectedEstado || null);
            setEstados(accionCreateData.estados || []);

            // Lógica general
            setNewAccion(accionCreateData.newAccion || defaultNewAccion);
            setisAnyEmpty(accionCreateData.isAnyEmpty || false);
            setRequiredFields(accionCreateData.requiredFields || defaultRequiredFields);
            setActiveIndex(accionCreateData.activeIndex || 0);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL

    const saveState = () => {
        dispatch(saveData({
            objectName: 'AccionCreate',
            value: {
                comentariosData,
                currentReferencia,
                referencias,
                currentMarcaBase,
                marcasBase,
                selectedEstado,
                estados,
                newAccion,
                isAnyEmpty,
                requiredFields,
                activeIndex,
            }
        }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO

    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [comentariosData,
        currentReferencia,
        referencias,
        currentMarcaBase,
        marcasBase,
        selectedEstado,
        estados,
        newAccion,
        isAnyEmpty,
        requiredFields,
        activeIndex]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'AccionCreate' })); // EDITABLE
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
        if (newAccion.selectedCliente && newAccion.selectedCliente !== undefined) {
            fetchMarcasData(newAccion.selectedCliente);
        }
    }, [newAccion.selectedCliente]) 

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
    }, [newAccion.selectedCliente, isClienteChangeUserInitiated]);

    // Referencias
    const handleAddReferencia= (e) => {
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

        if (!referencias.some(ref => (ref.referencia === referencia) && (ref.selectedTipoReferencia.tipoReferenciaId === selectedTipoReferencia.tipoReferenciaId))) {
            setReferencias([...referencias, currentReferencia]);
            setCurrentReferencia({});
        }
    }; // Agrega una referencia a la lista
    const handleDeleteReferencia = (e, object) => {
        e.preventDefault();
        const updatedReferencias = referencias.filter((item) => item !== object);
        setReferencias(updatedReferencias);
    }; // Quita una referencia de la lista
    useEffect(() => {
        const newReferencias = referencias.map(ref => ({
            tipoReferenciaId: ref.selectedTipoReferencia.tipoReferenciaId,
            referencia: ref.referencia
        })); 
        setNewAccion(prevAccion => ({
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
        const estadosIds = estados.map(est => est.codigo);
        setNewAccion(prevAccion => ({
            ...prevAccion,
            estados: estadosIds
        }));
    }, [estados]); // Guarda los ids de los estados elegidos en la propiedad de la accion

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
            mb.selectedMarca.marcaId === selectedMarca.marcaId &&
            mb.selectedPais.codigoPais === selectedPais.codigoPais &&
            (mb.selectedClase?.codigo ?? null) === (selectedClase?.codigo ?? null) &&
            (mb.selectedPropietario?.propietarioId ?? null) === (selectedPropietario?.propietarioId ?? null)
        );

        if (!isDuplicate) {
            setMarcasBase([...marcasBase, currentMarcaBase]);
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
            marcaId: mb.selectedMarca.marcaId,
            clase: mb.selectedClase?.codigo ?? null, // Provide a fallback value
            codigoPais: mb.selectedPais.codigoPais,
            propietario: mb.selectedPropietario?.propietarioId ?? null // Provide a fallback value
        }));
        setNewAccion(prevAccion => ({
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
    }, [isValidatingP, isValidatingA, isValidatingE, isValidatingC, isValidatingG, isValidatingTA, isValidatingTR ]); // Cambia el estado de refreshing: GENERAL

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
                <span style={{color: option.color}}><strong>{option.codigo}</strong> - {option.descripcionEspanol}/{option.descripcionIngles}</span>
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

    // ------------------ DOCUMENTOS ---------------------------------------

    useEffect(() => {

        const requiredEmpty = Object.keys(defaultRequiredFields).some(key => {
            return isEmptyValue(newAccion[key]);
        });

        setIsRequiredEmpty(requiredEmpty);
    }, [newAccion]); // Habilita o deshabilita la pestaña de documentos si falta un campo requerido: ESPECÍFICO

    // ------------------ FIN DOCUMENTOS ---------------------------------------

    const updateSelectedObject = (selectedObject, value) => {
        setNewAccion(prev => ({ ...prev, [selectedObject]: value })); // Editar
    }; // Maneja el cambio para un dropdown

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setNewAccion(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
    }; // Maneja el cambio para un tag de input

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

    const validateRequiredFields = (objetoEnCreacion) => {
        const updatedRequiredFields = { ...defaultRequiredFields };
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(objetoEnCreacion[key]);
        }); // Iterate over the required field keys
        setRequiredFields(updatedRequiredFields);
        return Object.values(updatedRequiredFields).some(value => value); // Return true if any of the required fields is empty
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto


    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newAccion);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Validación de todos los documentos válidos
        const allDocumentsValid = documentos.every(doc => {
            return doc.titulo.trim() !== '' && doc.descripcion.trim() !== '';
        });

        if (!allDocumentsValid) {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Por favor, llena todos los campos de título y descripción para todos los documentos.', // EDITABLE
                life: 3000,
            });
            return;
        }

        // Validación de todos los correos válidos
        const allCorreosValid = correos.every(correo => {
            return correo.titulo.trim() !== '' && correo.descripcion.trim() !== '';
        });

        if (!allCorreosValid) {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Por favor, llena todos los campos de título y descripción para todos los correos.', // EDITABLE
                life: 3000,
            });
            return;
        }

        let status;
        let data;

        // Crea la acción a terceros nueva
        try {
            setIsLoading2(true);
            const finalNewAccion = {
                "tipoAccionId": newAccion.selectedTipoAccion.tipoAccionId,
                "oficinaTramitante": newAccion.selectedOficinaTramitante.clienteId,
                "abogadoId": newAccion.selectedAbogado.abogadoId,
                "estados": newAccion.estados,
                "marcaBase": newAccion.marcaBase,
                "marcaOpuesta": {
                    "denominacion": newAccion.MOdenominacion,
                    "clase": newAccion.MOselectedClase?.codigo ?? null,
                    "codigoPais": newAccion.MOselectedPais?.codigoPais ?? null,
                    "solicitud": newAccion.MOsolicitud,
                    "fechaSolicitud": newAccion.MOfechaSolicitud,
                    "registro": newAccion.MOregistro,
                    "fechaRegistro": newAccion.MOfechaRegistro,
                    "propietario": newAccion.MOpropietario,
                    "agente": newAccion.MOagente,
                    "gaceta": newAccion.MOselectedGaceta?.numero ?? null,
                    "fecha": newAccion.MOfechaGaceta
                },
                "referencias": newAccion.referencias,
                "referenciaInterna": newAccion.referenciaInterna,
                "clienteId": newAccion.selectedCliente.clienteId
            }

            const response = await createObject(finalNewAccion); 
            status = response.status;
            data = response.data;

            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Acción creada con ID: ${data?.accionTerceroId}`, // EDITABLE
                    sticky: true,
                });
                resetStates();
                onCreated();
            } else {
                throw new Error(`Error en la creación: código de estado ${status}`);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al crear la acción', // EDITABLE
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
            // Proceed to create documents only if the client was successfully created
            if (status === 201 && data?.accionTerceroId) {
                documentos.forEach(async documento => {
                    try {
                        await uploadFile(documento, data.accionTerceroId, "acciontercero", "documento");
                    } catch (uploadError) {
                        // Handle errors for document uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                correos.forEach(async correo => {
                    try {
                        await uploadFile(correo, data.accionTerceroId, "acciontercero", "correo");
                    } catch (uploadError) {
                        // Handle errors for correo uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                if (comentariosData.commentsToUpload && comentariosData.commentsToUpload.length > 0) {
                    comentariosData.commentsToUpload.forEach(async comment => {
                        try {
                            await uploadComment(comment, data.accionTerceroId, "acciontercero");
                        } catch (uploadError) {
                            // Handle errors for document uploads here
                            console.error(uploadError);
                            // Optionally show a toast or perform other error handling
                        } finally {
                            setResetComments(true);
                            setComentariosData([]);
                        }
                    });
                }
            }
            setActiveIndex(0);
        }
    }; // Maneja la creación del objeto: ESPECIFICO

    const resetStates = () => {
        // Lógica general
        setNewAccion(defaultNewAccion);
        setisAnyEmpty(false);
        setRequiredFields(defaultRequiredFields);
        setActiveIndex(0);

        // Dropdowns
        setCurrentReferencia({});
        setReferencias([]);
        setCurrentMarcaBase({});
        setMarcasBase([]);
        setSelectedEstado(null);
        setEstados([]);
    } // Resetea los estados del componente: ESPECIFICO

    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates(); // Limpia la data de este componente
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    const handleMinimize = () => {
        isClosingRef.current = false; 
        onClose();
    }; // Maneja el minimizar del formulario (Datos persisten): GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea, table" bounds="parent">
                <div className="form-container wider-form">
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>Crear nueva acción a terceros</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleMinimize}>
                                <i className="pi pi-minus" style={{ fontSize: '0.6rem', color:'var(--secondary-blue)',fontWeight: '800' }}></i>
                            </Button>
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
                                                            className={`${requiredFields.selectedTipoAccion && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newAccion.selectedTipoAccion}
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
                                            <input className={`${requiredFields.referenciaInterna && 'form-group-empty'}`} type="text" name="referenciaInterna" value={newAccion.referenciaInterna || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia interna" />
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
                                            <DebounceDropdown onValueChange={() => setIsClienteChangeUserInitiated(true)} className={`${requiredFields.selectedCliente && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedCliente', value)} selectedObject={newAccion.selectedCliente} filterBy="clienteId,nombre" />
                                        </div>
                                        <div className="form-group" style={{ minWidth: 'calc(100% - 20px)' }}>
                                            <label>Oficina Tramitante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <DebounceDropdown className={`${requiredFields.selectedOficinaTramitante && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedOficinaTramitante', value)} selectedObject={newAccion.selectedOficinaTramitante} filterBy="clienteId,nombre" />
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
                                                            className={`${requiredFields.selectedAbogado && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newAccion.selectedAbogado}
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
                                                <input style={{ width: '60%' }} type="text" name="referencia" value={currentReferencia.referencia || ''} onChange={(e) => setCurrentReferencia({ ...currentReferencia, referencia: e.target.value })} maxLength="70" placeholder="Referencia" />
                                                <button className='rounded-icon-btn' onClick={handleAddReferencia}>
                                                    <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Referencias Agregadas ({referencias.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{maxHeight: '100px'}}>
                                                {referencias.map((ref, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <div style={{width: '100%', display: 'grid', gridTemplateColumns: '50% 50%'}}>
                                                            <td className="table-nombre-abogado"><strong>Tipo: </strong>{ref.selectedTipoReferencia.nombre}</td>
                                                            <td className="table-nombre-abogado"><strong>Referencia: </strong>{ref.referencia}</td>
                                                        </div>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteReferencia(e, ref)}>
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
                                                            <Button className="rounded-icon-btn" onClick={(e) => fetchMarcasData(newAccion.selectedCliente, e)}>
                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Dropdown
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
                                                            <Button className="rounded-icon-btn" onClick={(e) => fetchPaisesData(currentMarcaBase?.selectedMarca, e)}>
                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Dropdown
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
                                        <button className={`form-accept-btn logo-btn ${requiredFields.marcaBase && 'form-group-empty'}`} style={{margin: '3px auto 0px auto'}} onClick={handleAddMarcaBase}>
                                            <i className="pi pi-plus-circle"></i>
                                            <span>Agregar</span>
                                        </button>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Marcas Agregadas ({marcasBase.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ maxHeight: '280px' }}>
                                                {marcasBase.map((mb, index) => (
                                                    <tr className="comment-container" key={index}>
                                                        <td className="comment-title-container" style={{paddingLeft: '10px' }}>
                                                            <p><strong style={{ fontSize: '14px' }}>{mb.selectedMarca.signo}</strong></p>
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteMarcaBase(e, mb)}>
                                                                    <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                            </button>
                                                        </td>
                                                        <td className="comment-comment-container" style={{ margin: '0', padding: '10px 0px' }}>
                                                            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '30% 35% 35%' }}>
                                                                <div className="table-nombre-abogado"><strong>Clase: </strong>{mb.selectedClase?.codigo ?? 'no seleccionó'}</div>
                                                                <div className="table-nombre-abogado"><strong>Propietario: </strong>{mb.selectedPropietario ? `${mb.selectedPropietario.propietarioId} ${mb.selectedPropietario.nombre}` : 'no seleccionó'}</div>
                                                                <div className="table-nombre-abogado"><strong>País: </strong>{mb.selectedPais?.nombre ?? 'no seleccionó'}</div>
                                                                <div className="table-nombre-abogado"><strong>Solicitud: </strong>{mb.selectedMarca.solicitud ?? 'La marca no tiene solicitud'}</div>
                                                                <div className="table-nombre-abogado"><strong>Registro: </strong>{mb.selectedMarca.registro ?? 'La marca no tiene registro'}</div>
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
                                            <input className={`${requiredFields.MOdenominacion && 'form-group-empty'}`} type="text" name="MOdenominacion" value={newAccion.MOdenominacion || ''} onChange={handleInputChange} maxLength="70" placeholder="Denominación" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Clase <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                            className={`${requiredFields.MOselectedClase && 'form-group-empty'}`}
                                                            showClear
                                                            style={{ width: '100%' }}
                                                            value={newAccion.MOselectedClase}
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
                                            <label>País <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                            className={`${requiredFields.MOselectedPais && 'form-group-empty'}`}
                                                            showClear
                                                            style={{ width: '100%' }}
                                                            value={newAccion.MOselectedPais}
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
                                            <label>Solicitud <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.MOsolicitud && 'form-group-empty'}`} type="text" name="MOsolicitud" value={newAccion.MOsolicitud || ''} onChange={handleInputChange} maxLength="70" placeholder="Solicitud" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de solicitud <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.MOfechaSolicitud && 'form-group-empty'}`} type="date" name="MOfechaSolicitud" value={newAccion.MOfechaSolicitud || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.MOregistro && 'form-group-empty'}`} type="text" name="MOregistro" value={newAccion.MOregistro || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de registro" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.MOfechaRegistro && 'form-group-empty'}`} type="date" name="MOfechaRegistro" value={newAccion.MOfechaRegistro || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Propietario <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.MOpropietario && 'form-group-empty'}`} type="text" name="MOpropietario" value={newAccion.MOpropietario || ''} onChange={handleInputChange} maxLength="70" placeholder="Propietario" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Agente <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.MOagente && 'form-group-empty'}`} type="text" name="MOagente" value={newAccion.MOagente || ''} onChange={handleInputChange} maxLength="70" placeholder="Agente" />
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-book"></i>
                                        <label>Gaceta </label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label>Gaceta <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                            className={`${requiredFields.MOselectedGaceta && 'form-group-empty'}`}
                                                            showClear
                                                            style={{ width: '100%' }}
                                                            value={newAccion.MOselectedGaceta}
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
                                            <label>Fecha de gaceta <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.MOfechaGaceta && 'form-group-empty'}`} type="date" name="MOfechaGaceta" value={newAccion.MOfechaGaceta || ''} onChange={handleInputChange} />
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
                                                <button className='rounded-icon-btn' onClick={handleAddEstado}>
                                                    <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Estados agregados ({estados.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ maxHeight: '120px' }}>
                                                {estados.map((est, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <td className="table-nombre-abogado" style={{color: est.color}}><strong>{est.codigo} - </strong>{est.descripcionEspanol}/{est.descripcionIngles}</td>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteEstado(e, est)}>
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
                        <TabPanel header="Comentarios" leftIcon="pi pi-comments mr-2">
                            <CommentsC onCommentsChange={handleComentariosCallback} persistedCommentsData={comentariosData} resetStates={resetComments} setResetStates={setResetComments}/>
                        </TabPanel>
                        <TabPanel header="Documentos" leftIcon="pi pi-paperclip mr-2" disabled={isRequiredEmpty} className={`${isRequiredEmpty && 'disabled-tab-panel'}`}>
                            <div className="form-info-msg" style={{ paddingBottom: '0' }}>
                                <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                <span>Por favor, permanezca en la pestaña para conservar los archivos seleccionados</span>
                            </div>
                            <section className="form-body form-body--create">
                                <DocumentPickerC type="documentos" onFilesChange={handleDocumentosCallback} />
                                <DocumentPickerC type="correos" onFilesChange={handleCorreosCallback} />
                            </section>
                        </TabPanel>
                    </TabView>
                    <div className="center-hr">
                        <hr />
                    </div>
                    <section className="form-footer">
                        <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
                        {isAnyEmpty &&
                            <div className="empty-fields-msg">
                                <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                <span>Por favor, llena todos los datos <strong>requeridos</strong></span>
                            </div>
                        }
                        <button style={errorTA || errorA && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorTA || errorA} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default AccionesCreate;