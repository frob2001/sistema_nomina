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
import { saveData, deleteData, setIsEditing } from '../../../context/regulatorioSlice'; // EDITABLE
import { deleteData as deleteRecordatoriosData } from '../../../context/recordatorioSlice'; // Para eliminar la data persistida cuando se cambie de referencia
import { deleteDataDetails as deleteRecordatoriosDataDetails } from '../../../context/recordatorioDetailsSlice'; // Para eliminar la data persistida cuando se cambie de referencia

// Comentarios
import CommentsD from '../../miscComponents/Comentarios/CommentsD' 

// Components
import DocumentViewer from '../../miscComponents/Documents/DocumentViewer';
import RecordatorioHandler from '../../miscComponents/Recordatorios/RecordatorioHandler';

// Services
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Regulatorio`;

import { useRegulatorio } from '../../../services/useRegulatorio'; // EDITABLE: MAIN

import { usePaises } from '../../../services/usePais';
import { useAbogados } from '../../../services/useAbogados';
import { useEstados } from '../../../services/useEstados';
import { useGrupos } from '../../../services/useGrupos';
import { useTipoReferencia } from '../../../services/useTipoReferencia'; 

// Auth
import { useMsal } from '@azure/msal-react';

function RegulatoriosDetails(props) { // EDITABLE

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
    const regulatorioDataDetails = useSelector(state => state.regulatorio.RegulatorioDetails); // EDITABLE: guarda los datos de persistencia
    const isEditing = useSelector(state => state.regulatorio.isEditing); // EDITABLE: guarda si se está editando o no

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null); // GENERAL
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    
    const { data: regulatorioData, error, isLoading, mutate: refresh } = useSWR(`${API_BASE_URL}/${props.regulatorioId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteObject, updateObject } = useRegulatorio(); // Para editar y eliminar un objeto: EDITABLE
    const prevRegulatorioIdRef = useRef(props.regulatorioId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // EDITABLE
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { grupos, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGrupos(); // Para el dropdown de grupos
    const { tiposReferencias, error: errorTR, isLoading: isLoadingTR, isValidating: isValidatingTR, refresh: refreshTR } = useTipoReferencia(); // Para el dropdown de tipos de referencias

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false); // Loader para la eliminación o edición
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        selectedGrupo: false,
        selectedCliente: false,
        selectedOficinaTramitante: false,
        selectedAbogado: false,
        selectedPais: false,
        titulo: false,
        referenciaInterna: false,
        registro: false,
        fabricantes: false,
        selectedEstado: false,
        // .. Seguir agregando hasta completar
    }; 

    // --------------- Estados para comentarios (requieren persistencia) --------------------------------------------

    const [currentComentario, setCurrentComentario] = useState({}); // Para el comentario que se está creando

    // --------------- Estados que requieren persistencia --------------------------------------------

    // Dropdowns (selecciones múltiples)
    const [contactos, setContactos] = useState([]); // mapea los contactos que serán añadidos
    const [currentReferencia, setCurrentReferencia] = useState({}); // contiene la referencia que se está creando
    const [referencias, setReferencias] = useState([]); // mapea las referencias que serán añadidas
    const [selectedSolicitante, setSelectedSolicitante] = useState(null);
    const [solicitantes, setSolicitantes] = useState([]); // mapea los solicitantes que serán añadidos
    const [currentFabricante, setCurrentFabricante] = useState({}); // contiene el fabricante que se está creando
    const [fabricantes, setFabricantes] = useState([]); // mapea los fabricantes que serán añadidos

    // Lógica general
    const [regulatorio, setRegulatorio] = useState({});// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (regulatorioDataDetails) {

            // Comentarios
            setCurrentComentario(regulatorioDataDetails.currentComentario || {});

            // Dropdowns
            setContactos(regulatorioDataDetails.contactos || []);
            setCurrentReferencia(regulatorioDataDetails.currentReferencia || {});
            setReferencias(regulatorioDataDetails.referencias || []);
            setSelectedSolicitante(regulatorioDataDetails.selectedSolicitante || null);
            setSolicitantes(regulatorioDataDetails.solicitantes || []);
            setCurrentFabricante(regulatorioDataDetails.currentFabricante || {});
            setFabricantes(regulatorioDataDetails.fabricantes || []);

            // Lógica general
            setRegulatorio(regulatorioDataDetails.regulatorio || {});
            setisAnyEmpty(regulatorioDataDetails.isAnyEmpty || false);
            setRequiredFields(regulatorioDataDetails.requiredFields || defaultRequiredFields);
            setActiveIndex(regulatorioDataDetails.activeIndex || 0);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({
            objectName: 'RegulatorioDetails', value:
            {
                currentComentario,
                contactos,
                currentReferencia,
                referencias,
                selectedSolicitante,
                solicitantes,
                currentFabricante,
                fabricantes,
                regulatorio,
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
        contactos,
        currentReferencia,
        referencias,
        selectedSolicitante,
        solicitantes,
        currentFabricante,
        fabricantes,
        regulatorio,
        isAnyEmpty,
        requiredFields,
        activeIndex,
        isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'RegulatorioDetails' }));
        dispatch(deleteRecordatoriosData({ objectName: 'RecordatoriosRegulatorio' }));
        dispatch(deleteRecordatoriosDataDetails({ objectName: 'RecordatoriosRegulatorioDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------


    // ------------ Dropdowns de selección múltiple -----------------------------

    // Contactos
    const [contactosOptions, setContactosOptions] = useState([]);
    const [selectedContacto, setSelectedContacto] = useState(null);
    const [contactosLoading, setContactosLoading] = useState(false);

    const handleAddContacto = (e) => {
        e.preventDefault();
        if (selectedContacto && !contactos.some(contacto => contacto.contactoId === selectedContacto.contactoId)) {
            setContactos([...contactos, selectedContacto]);
            setSelectedContacto(null);
        }
    }; // Agrega un contacto a la lista
    const handleDeleteContacto = (e, object) => {
        e.preventDefault();
        const updatedContactos = contactos.filter((item) => item !== object);
        setContactos(updatedContactos);
    }; // Quita un contacto de la lista
    const fetchContactosData = async (cliente, event) => {
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        if (cliente) {
            try {
                setContactosLoading(true);
                const API_BASE_URL = `${apiEndpoint}/ContactosCliente/Cliente/${cliente.clienteId}`;
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
                    setContactosOptions(fetchedData);
                } else {
                    setContactosOptions([]);
                }
            } catch (error) {
                setContactosOptions([]);
            } finally {
                setContactosLoading(false);
            }
        }
    }; // Fetcher que trae los contactos para las opciones
    useEffect(() => {
        fetchContactosData(regulatorio?.selectedCliente);
    }, [regulatorio?.selectedCliente]) // Busca los contactos de acuerdo con el cliente elegido !!! REVISAR: Cuando se cambia de cliente debe borrar los contactos pero eso da un problema con la persistencia
    useEffect(() => {

        const contactosIds = contactos?.map(contacto => contacto.contactoId);

        setRegulatorio(prevRegulatorio => ({
            ...prevRegulatorio,
            contactosIds: contactosIds
        }));
    }, [contactos]); // Guarda los ids de los contactos elegidos en la propiedad de la patente

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
        setRegulatorio(prevRegulatorio => ({
            ...prevRegulatorio,
            referencias: newReferencias
        }));
    }, [referencias]); // Guarda las referencias en la propiedad de la patente

    // Solicitantes
    const handleAddSolicitante = (e) => {
        e.preventDefault();
        if (selectedSolicitante && !solicitantes.some(sol => sol.propietarioId === selectedSolicitante.propietarioId)) {
            setSolicitantes([...solicitantes, selectedSolicitante]);
            setSelectedSolicitante(null);
        }
    }; // Agrega un solicitante a la lista
    const handleDeleteSolicitante = (e, object) => {
        e.preventDefault();
        const updatedSolicitantes = solicitantes.filter((item) => item !== object);
        setSolicitantes(updatedSolicitantes);
    }; // Quita un inventor de la lista
    useEffect(() => {
        const solicitantesIds = solicitantes?.map(sol => sol.propietarioId);
        setRegulatorio(prevRegulatorio => ({
            ...prevRegulatorio,
            solicitantesIds: solicitantesIds
        }));
    }, [solicitantes]); // Guarda los ids de los solicitantes elegidos en la propiedad de la patente

    // Fabricantes
    const handleAddFabricante = (e) => {
        e.preventDefault();
        const { selectedPais, nombre, ciudad } = currentFabricante;

        if (!selectedPais || !nombre || !ciudad || nombre?.trim() === '' || ciudad?.trim() === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir un fabricante, todos los campos deben estar completos', // EDITABLE
                life: 3000,
            });
            return; // Exit the function if the condition is not met
        }

        if (!fabricantes.some(fab => (fab.nombre === nombre) && (fab.ciudad === ciudad) && (fab.selectedPais.codigoPais === selectedPais.codigoPais))) {
            const currentFabricanteTreated = {
                codigoPais: selectedPais.codigoPais,
                nombre: nombre,
                ciudad: ciudad,
            }
            setFabricantes([...fabricantes, currentFabricanteTreated]);
            setCurrentFabricante({});
        }
    }; // Agrega un fabricante a la lista
    const handleDeleteFabricante = (e, object) => {
        e.preventDefault();
        const updatedFabricantes = fabricantes.filter((item) => item !== object);
        setFabricantes(updatedFabricantes);
    }; // Quita un fabricante de la lista
    useEffect(() => {
        const newFabricantes = fabricantes?.map(fab => ({
            codigoPais: fab.codigoPais,
            nombre: fab.nombre,
            ciudad: fab.ciudad
        }));
        setRegulatorio(prevRegulatorio => ({
            ...prevRegulatorio,
            fabricantes: newFabricantes
        }));
    }, [fabricantes]); // Guarda los fabricantes en la propiedad de la patente

    // ------------------ Dropdowns normales ---------------------------------------

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshP(); // Países
        refreshA(); // Abogados
        refreshTR(); // Tipos de referencias
        refreshG(); // Gacetas
        refreshE();
    }; // Refresca los datos del los dropdowns: GENERAL

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA, isValidatingE, isValidatingG, isValidatingTR]); // Cambia el estado de refreshing: GENERAL

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

    // ------------------ FIN DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (props.regulatorioId !== prevRegulatorioIdRef.current) {
            if (regulatorioData) {
                setRegulatorio({
                    ...regulatorioData,
                    selectedGrupo: regulatorioData.grupo,
                    selectedCliente: regulatorioData.cliente,
                    selectedOficinaTramitante: regulatorioData.oficinaTramitante,
                    selectedAbogado: abogados?.find(abogado => abogado.abogadoId === regulatorioData.abogado.abogadoId),
                    selectedPais: regulatorioData.pais,
                    selectedEstado: estadosOptions?.find(estado => estado.codigo === regulatorioData.estado.codigo),
                }); // EDITABLE

                // Dropdowns
                setContactos(regulatorioData.contactos);
                setCurrentReferencia({});
                setReferencias(regulatorioData.referencias);
                setSolicitantes(regulatorioData.solicitantes);
                setSelectedSolicitante(null);
                setCurrentFabricante({});
                setFabricantes(regulatorioData.fabricantes);

                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);

                dispatch(deleteRecordatoriosData({ objectName: 'RecordatoriosRegulatorio' }));  // Eliminar recordatorios si es que cambia la referencia.
                dispatch(deleteRecordatoriosDataDetails({ objectName: 'RecordatoriosRegulatorioDetails' }));  // Eliminar recordatorios si es que cambia la referencia.

                prevRegulatorioIdRef.current = props.regulatorioId;
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
                    if (regulatorioData) {
                        setRegulatorio({
                            ...regulatorioData,
                            selectedGrupo: regulatorioData.grupo,
                            selectedCliente: regulatorioData.cliente,
                            selectedOficinaTramitante: regulatorioData.oficinaTramitante,
                            selectedAbogado: abogados?.find(abogado => abogado.abogadoId === regulatorioData.abogado.abogadoId),
                            selectedPais: regulatorioData.pais,
                            selectedEstado: estadosOptions?.find(estado => estado.codigo === regulatorioData.estado.codigo),
                        }); // EDITABLE

                        // Dropdowns
                        setContactos(regulatorioData.contactos);
                        setCurrentReferencia({});
                        setReferencias(regulatorioData.referencias);
                        setSolicitantes(regulatorioData.solicitantes);
                        setSelectedSolicitante(null);
                        setCurrentFabricante({});
                        setFabricantes(regulatorioData.fabricantes);

                        setisAnyEmpty(false);
                        setRequiredFields(defaultRequiredFields);
                    }
                }
            }
        }
    }, [regulatorioData, isEditing, props.regulatorioId]); // useEffect para escuchar cambios en estadoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO

    const updateSelectedObject = (selectedObject, value) => {
        setRegulatorio(prev => ({ ...prev, [selectedObject]: value })); // Editar
    }; // Maneja el cambio para un dropdown

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setRegulatorio(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
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
            const response = await deleteObject(props.regulatorioId); // EDITABLE
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

    const validateRequiredFields = (objetoEnCreacion) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(objetoEnCreacion[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(regulatorio);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const finalRegulatorio = {
                "grupoId": regulatorio.selectedGrupo.grupoId,
                "clienteId": regulatorio.selectedCliente.clienteId,
                "contactosIds": regulatorio.contactosIds ? regulatorio.contactosIds : regulatorio.contactos.map(contacto => contacto.contactoId),
                "oficinaTramitanteId": regulatorio.selectedOficinaTramitante.clienteId,
                "abogado": regulatorio.selectedAbogado.abogadoId,
                "codigoPais": regulatorio.selectedPais.codigoPais,
                "titulo": regulatorio.titulo,
                "solicitantesIds": regulatorio.solicitantesIds ? regulatorio.solicitantesIds : regulatorio.solicitantes.map(sol => sol.propietarioId),
                "referenciaInterna": regulatorio.referenciaInterna,
                "referencias": regulatorio.referencias.map(ref => ({
                    tipoReferenciaId: ref.tipoReferenciaId,
                    referencia: ref.referencia
                })),
                "registro": regulatorio.registro,
                "fechaRegistro": regulatorio.fechaRegistro,
                "fechaVencimiento": regulatorio.fechaVencimiento,
                "estadoId": regulatorio.selectedEstado.codigo,
                "fabricantes": regulatorio.fabricantes.map(fab => ({
                    codigoPais: fab.codigoPais,
                    nombre: fab.nombre,
                    ciudad: fab.ciudad,
                }))
            }

            const response = await updateObject(props.regulatorioId, finalRegulatorio);

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

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea, table" bounds="parent">
                <div className="form-container wider-form">
                    {(isLoading || isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <>
                        <section className="form-header">
                            <span>{`Registro: ${regulatorio?.regulatorioId || ''} - ${regulatorio?.titulo || ''}`}</span>
                            <div className="form-header-buttons">
                                <Button className="form-header-btn" onClick={handleCancel}>
                                    <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                </Button>
                            </div>
                        </section>

                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} scrollable>
                            <TabPanel header="Registro" leftIcon="pi pi-book mr-2">
                                <form className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-info-circle"></i>
                                            <label>Información del registro</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-single">
                                                <label> Título <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.titulo && 'form-group-empty'}`} type="text" name="titulo" value={regulatorio?.titulo || ''} onChange={handleInputChange} required maxLength="200" placeholder="Título del registro" />
                                            </div>
                                            <div className="form-group">
                                                <label> Grupo <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <div>
                                                    {
                                                        errorG || !grupos ? (
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
                                                                className={`${requiredFields.selectedGrupo && 'form-group-empty'}`}
                                                                style={{ width: '100%' }}
                                                                value={regulatorio?.selectedGrupo}
                                                                onChange={(e) => updateSelectedObject('selectedGrupo', e.value)}
                                                                options={grupos}
                                                                optionLabel="nombre"
                                                                placeholder="Selecciona un grupo"
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
                                                <input readOnly={!isEditing} className={`${requiredFields.referenciaInterna && 'form-group-empty'}`} type="text" name="referenciaInterna" value={regulatorio?.referenciaInterna || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia interna" />
                                            </div>
                                            <div className="form-group">
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
                                                                disabled={!isEditing}
                                                                className={`${requiredFields.selectedPais && 'form-group-empty'}`}
                                                                style={{ width: '100%' }}
                                                                value={regulatorio?.selectedPais}
                                                                onChange={(e) => updateSelectedObject('selectedPais', e.value)}
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
                                                <tbody style={{ maxHeight: '65px' }}>
                                                    {referencias?.map((ref, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <td style={{ width: '100%', display: 'grid', gridTemplateColumns: '50% 50%' }}>
                                                                <div className="table-nombre-abogado"><strong>Tipo: </strong>{ref.tipoReferencia}</div>
                                                                <div className="table-nombre-abogado"><strong>Referencia: </strong>{ref.referencia}</div>
                                                            </td>
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
                                </form>
                            </TabPanel>
                            <TabPanel header="Responsables" leftIcon="pi pi-sitemap mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-briefcase"></i>
                                            <label>Información del cliente</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Cliente <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <DebounceDropdown disabled={!isEditing} className={`${requiredFields.selectedCliente && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedCliente', value)} selectedObject={regulatorio?.selectedCliente} filterBy="clienteId,nombre" />
                                            </div>
                                            <div className="form-group">
                                                <label>Contactos</label>
                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                    <div style={{ width: '100%' }}>
                                                        {
                                                            contactosOptions.length === 0 ? (
                                                                <div className="dropdown-error">
                                                                    <div className="dropdown-error-msg">
                                                                        {contactosLoading ?
                                                                            <div className="small-spinner" /> :
                                                                            <span>No hay contactos que mostrar</span>}
                                                                    </div>
                                                                    <button style={{color: 'white', minHeight: '24px', height:'24px', minWidth:'24px', width: '24px'}} className="rounded-icon-btn" onClick={(event) => fetchContactosData(regulatorio?.selectedCliente, event)}>
                                                                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <Dropdown
                                                                    disabled={!isEditing}
                                                                    style={{ width: '100%' }}
                                                                    value={selectedContacto}
                                                                    onChange={(e) => setSelectedContacto(e.value)}
                                                                    options={contactosOptions}
                                                                    optionLabel="nombre"
                                                                    placeholder="Selecciona un contacto"
                                                                    filter
                                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                                    valueTemplate={selectedValueTemplateA}
                                                                    itemTemplate={optionTemplateA}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddContacto}>
                                                        <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Contactos Agregados ({contactos?.length})</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {contactos?.map((contacto, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <td className="table-nombre-abogado">{contacto.nombre} {contacto.apellido} {contacto.email && `(${contacto.email})`}</td>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteContacto(e, contacto)}>
                                                                    <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-users"></i>
                                            <label>Responsables</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group" style={{ minWidth: 'calc(100% - 20px)' }}>
                                                <label>Oficina Tramitante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <DebounceDropdown disabled={!isEditing} className={`${requiredFields.selectedOficinaTramitante && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedOficinaTramitante', value)} selectedObject={regulatorio?.selectedOficinaTramitante} filterBy="clienteId,nombre" />
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
                                                                value={regulatorio.selectedAbogado}
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
                                </div>
                            </TabPanel>
                            <TabPanel header="Solicitud" leftIcon="pi pi-users mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-wrench"></i>
                                            <label>Fabricantes</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Fabricante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                    <input readOnly={!isEditing} className={`${requiredFields.fabricantes && 'form-group-empty'}`} style={{ width: '30%' }} type="text" name="nombre" value={currentFabricante.nombre || ''} onChange={(e) => setCurrentFabricante({ ...currentFabricante, nombre: e.target.value })} maxLength="100" placeholder="Nombre completo" />
                                                    <div style={{ width: '40%' }}>
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
                                                                    className={`${requiredFields.fabricantes && 'form-group-empty'}`}
                                                                    showClear
                                                                    style={{ width: '100%' }}
                                                                    value={currentFabricante.selectedPais}
                                                                    onChange={(e) => setCurrentFabricante({ ...currentFabricante, selectedPais: e.value })}
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
                                                    <input readOnly={!isEditing} className={`${requiredFields.fabricantes && 'form-group-empty'}`} style={{ width: '30%' }} type="text" name="ciudad" value={currentFabricante.ciudad || ''} onChange={(e) => setCurrentFabricante({ ...currentFabricante, ciudad: e.target.value })} maxLength="70" placeholder="Ciudad" />

                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddFabricante}>
                                                        <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Fabricantes Agregados ({fabricantes?.length})</th>
                                                    </tr>
                                                </thead>
                                                <tbody style={{ maxHeight: '70px' }}>
                                                    {fabricantes?.map((fab, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <td style={{ width: '100%', display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
                                                                <div className="table-nombre-abogado"><strong>Nombre: </strong>{fab.nombre}</div>
                                                                <div className="table-nombre-abogado"><strong>País: </strong>{paises && paises?.find(pais => pais.codigoPais === fab.codigoPais).nombre}</div>
                                                                <div className="table-nombre-abogado"><strong>Ciudad: </strong>{fab.ciudad}</div>
                                                            </td>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteFabricante(e, fab)}>
                                                                    <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-briefcase"></i>
                                            <label>Solicitantes</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-single">
                                                <label>Propietarios</label>
                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                    <div style={{ width: '100%' }}>
                                                        <DebounceDropdown disabled={!isEditing} endpoint='Propietarios' optionLabel='nombre' showClear={true} setter={setSelectedSolicitante} selectedObject={selectedSolicitante} filterBy="propietarioId,nombre" />
                                                    </div>
                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddSolicitante}>
                                                        <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Propietarios agregados ({solicitantes?.length})</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {solicitantes?.map((sol, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <td className="table-nombre-abogado"><strong>{sol.propietarioId} - </strong>{sol.nombre}</td>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteSolicitante(e, sol)}>
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
                            <TabPanel header="Expediente" leftIcon="pi pi-file-edit mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-tag"></i>
                                            <label>Estado</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-single">
                                                <label>Estado <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                                className={`${requiredFields.selectedEstado && 'form-group-empty'}`}
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={regulatorio?.selectedEstado}
                                                                onChange={(e) => updateSelectedObject('selectedEstado', e.value)}
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
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-file-edit"></i>
                                            <label>Solicitud de registro</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-double">
                                                <label>Registro <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.registro && 'form-group-empty'}`} type="text" name="registro" value={regulatorio?.registro || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de registro" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de registro</label>
                                                <input readOnly={!isEditing} type="date" name="fechaRegistro" value={regulatorio.fechaRegistro ? regulatorio.fechaRegistro.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de vencimiento</label>
                                                <input readOnly={!isEditing} type="date" name="fechaVencimiento" value={regulatorio.fechaVencimiento ? regulatorio.fechaVencimiento.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </TabPanel>
                            <TabPanel header="Comentarios" leftIcon="pi pi-comments mr-2">
                                <CommentsD onCommentChange={setCurrentComentario} persistedComment={currentComentario} tablaConexion="regulatorio" idConexion={props.regulatorioId} />
                            </TabPanel>
                            <TabPanel header="Recordatorios" leftIcon="pi pi-bell mr-2">
                                <RecordatorioHandler tablaConexion="regulatorio" idConexion={props.regulatorioId} nombrePadre="RecordatoriosRegulatorio" isClosingRef={isClosingRef} />
                            </TabPanel>
                            <TabPanel header="Documentos" leftIcon="pi pi-paperclip mr-2">
                                <div className="form-info-msg" style={{ paddingBottom: '0' }}>
                                    <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                    <span>Por favor, permanezca en la pestaña para conservar cualquier cambio y archivo seleccionado</span>
                                </div>
                                <section className="form-body form-body--create">
                                    <DocumentViewer type="documentos" tablaConexion="regulatorio" idConexion={props.regulatorioId} />
                                    <DocumentViewer type="correos" tablaConexion="regulatorio" idConexion={props.regulatorioId} />
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

export default RegulatoriosDetails;