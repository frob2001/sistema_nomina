import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/regulatorioSlice'; //EDITABLE: MAIN

// Comentarios
import CommentsC from '../../miscComponents/Comentarios/CommentsC'
import { useComments } from '../../../services/useComments'; // Para la creación de documentos y correos

// Documentos
import DocumentPickerC from '../../miscComponents/Documents/DocumentPickerC';
import { useFiles } from '../../../services/useFiles'; // Para la creación de documentos y correos

// Servicios
import { useRegulatorio } from '../../../services/useRegulatorio'; // EDITABLE: MAIN

import { usePaises } from '../../../services/usePais';
import { useAbogados } from '../../../services/useAbogados';
import { useEstados } from '../../../services/useEstados';
import { useGrupos } from '../../../services/useGrupos';
import { useTipoReferencia } from '../../../services/useTipoReferencia'; 

// Auth
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
import { useMsal } from '@azure/msal-react';

function RegulatoriosCreate({ onClose, onCreated }) { //EDITABLE

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
    const regulatorioCreateData = useSelector(state => state.regulatorio.RegulatorioCreate); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject } = useRegulatorio(); // Servicio necesario para crear el objeto
    const { uploadFile } = useFiles(); // Servicio para subir archivos
    const { uploadComment } = useComments(); // Servicio para subir comentarios
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia
    const toast = useRef(null); // Referencia para el toast

    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // EDITABLE
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // EDITABLE
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { grupos, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGrupos(); // Para el dropdown de grupos
    const { tiposReferencias, error: errorTR, isLoading: isLoadingTR, isValidating: isValidatingTR, refresh: refreshTR } = useTipoReferencia(); // Para el dropdown de tipos de referencias
    
    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewRegulatorio = {
        selectedGrupo: null,
        selectedCliente: null,
        contactosIds: [],
        selectedOficinaTramitante: null,
        selectedAbogado: null,
        selectedPais: null,
        titulo: '',
        solicitantesIds: [],
        referenciaInterna: '',
        referencias: [],
        registro: '',
        fechaRegistro: '',
        fechaVencimiento: '',
        selectedEstado: null,
        fabricantes: []
        // .. Seguir agregando hasta completar
    }; 
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
    const [contactos, setContactos] = useState([]); // mapea los contactos que serán añadidos
    const [currentReferencia, setCurrentReferencia] = useState({}); // contiene la referencia que se está creando
    const [referencias, setReferencias] = useState([]); // mapea las referencias que serán añadidas
    const [selectedSolicitante, setSelectedSolicitante] = useState(null);
    const [solicitantes, setSolicitantes] = useState([]); // mapea los solicitantes que serán añadidos
    const [currentFabricante, setCurrentFabricante] = useState({}); // contiene el fabricante que se está creando
    const [fabricantes, setFabricantes] = useState([]); // mapea los fabricantes que serán añadidos

    // Lógica general
    const [newRegulatorio, setNewRegulatorio] = useState(defaultNewRegulatorio);// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (regulatorioCreateData) { // EDITABLE

            // Comentarios
            setComentariosData(regulatorioCreateData.comentariosData || []);

            // Dropdowns
            setContactos(regulatorioCreateData.contactos || []);
            setCurrentReferencia(regulatorioCreateData.currentReferencia || {});
            setReferencias(regulatorioCreateData.referencias || []);
            setSelectedSolicitante(regulatorioCreateData.selectedSolicitante || null);
            setSolicitantes(regulatorioCreateData.solicitantes || []);
            setCurrentFabricante(regulatorioCreateData.currentFabricante || {});
            setFabricantes(regulatorioCreateData.fabricantes || []);

            // Lógica general
            setNewRegulatorio(regulatorioCreateData.newRegulatorio || defaultNewRegulatorio);
            setisAnyEmpty(regulatorioCreateData.isAnyEmpty || false);
            setRequiredFields(regulatorioCreateData.requiredFields || defaultRequiredFields);
            setActiveIndex(regulatorioCreateData.activeIndex || 0);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL

    const saveState = () => {
        dispatch(saveData({
            objectName: 'RegulatorioCreate',
            value: {
                comentariosData,
                contactos,
                currentReferencia,
                referencias,
                selectedSolicitante,
                solicitantes,
                currentFabricante,
                fabricantes,
                newRegulatorio,
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
        contactos,
        currentReferencia,
        referencias,
        selectedSolicitante,
        solicitantes,
        currentFabricante,
        fabricantes,
        newRegulatorio,
        isAnyEmpty,
        requiredFields,
        activeIndex,]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'RegulatorioCreate' })); // EDITABLE
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
    const fetchContactosData = async (cliente, e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
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
        fetchContactosData(newRegulatorio.selectedCliente);
    }, [newRegulatorio.selectedCliente]) // Busca los contactos de acuerdo con el cliente elegido !!! REVISAR: Cuando se cambia de cliente debe borrar los contactos pero eso da un problema con la persistencia
    useEffect(() => {

        const contactosIds = contactos.map(contacto => contacto.contactoId);

        setNewRegulatorio(prevRegulatorio => ({
            ...prevRegulatorio,
            contactosIds: contactosIds
        }));
    }, [contactos]); // Guarda los ids de los contactos elegidos en la propiedad del regulatorio

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
        setNewRegulatorio(prevRegulatorio => ({
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
        const solicitantesIds = solicitantes.map(sol => sol.propietarioId);
        setNewRegulatorio(prevRegulatorio => ({
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
            setFabricantes([...fabricantes, currentFabricante]);
            setCurrentFabricante({});
        }
    }; // Agrega un fabricante a la lista
    const handleDeleteFabricante = (e, object) => {
        e.preventDefault();
        const updatedFabricantes = fabricantes.filter((item) => item !== object);
        setFabricantes(updatedFabricantes);
    }; // Quita una referencia de la lista
    useEffect(() => {
        const newFabricantes = fabricantes.map(fab => ({
            codigoPais: fab.selectedPais.codigoPais,
            nombre: fab.nombre,
            ciudad: fab.ciudad
        }));
        setNewRegulatorio(prevRegulatorio => ({
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

    // ------------------ FIN DROPDOWNS ---------------------------------------

    // ------------------ DOCUMENTOS ---------------------------------------
    useEffect(() => {

        const requiredEmpty = Object.keys(defaultRequiredFields).some(key => {
            return isEmptyValue(newRegulatorio[key]);
        });

        setIsRequiredEmpty(requiredEmpty);
    }, [newRegulatorio]); // Habilita o deshabilita la pestaña de documentos si falta un campo requerido: ESPECÍFICO

    // ------------------ FIN DOCUMENTOS ---------------------------------------

    const updateSelectedObject = (selectedObject, value) => {
        setNewRegulatorio(prev => ({ ...prev, [selectedObject]: value })); // Editar
    }; // Maneja el cambio para un dropdown

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setNewRegulatorio(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
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
        const anyFieldEmpty = validateRequiredFields(newRegulatorio);

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

        // Crea el regulatorio nuevo
        try {
            setIsLoading2(true);
            const finalNewRegulatorio = {
                "grupoId": newRegulatorio.selectedGrupo.grupoId,
                "clienteId": newRegulatorio.selectedCliente.clienteId,
                "contactosIds": newRegulatorio.contactosIds,
                "oficinaTramitanteId": newRegulatorio.selectedOficinaTramitante.clienteId,
                "abogado": newRegulatorio.selectedAbogado.abogadoId,
                "codigoPais": newRegulatorio.selectedPais.codigoPais,
                "titulo": newRegulatorio.titulo,
                "solicitantesIds": newRegulatorio.solicitantesIds,
                "referenciaInterna": newRegulatorio.referenciaInterna,
                "referencias": newRegulatorio.referencias,
                "registro": newRegulatorio.registro,
                "fechaRegistro": newRegulatorio.fechaRegistro,
                "fechaVencimiento": newRegulatorio.fechaVencimiento,
                "estadoId": newRegulatorio.selectedEstado.codigo, 
                "fabricantes": newRegulatorio.fabricantes
            }

            const response = await createObject(finalNewRegulatorio); 
            status = response.status;
            data = response.data;

            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Registro creado con ID: ${data?.regulatorioId}`, // EDITABLE
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
                detail: 'Hubo un error al crear el registro', // EDITABLE
                life: 3000,
            });
            console.log(error);
        } finally {
            setIsLoading2(false);
            // Proceed to create documents only if the client was successfully created
            if (status === 201 && data?.regulatorioId) {
                documentos.forEach(async documento => {
                    try {
                        await uploadFile(documento, data.regulatorioId, "regulatorio", "documento");
                    } catch (uploadError) {
                        // Handle errors for document uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                correos.forEach(async correo => {
                    try {
                        await uploadFile(correo, data.regulatorioId, "regulatorio", "correo");
                    } catch (uploadError) {
                        // Handle errors for correo uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                if (comentariosData.commentsToUpload && comentariosData.commentsToUpload.length > 0) {
                    comentariosData.commentsToUpload.forEach(async comment => {
                        try {
                            await uploadComment(comment, data.regulatorioId, "regulatorio");
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
        // Dropdowns
        setContactos([]);
        setCurrentReferencia({});
        setReferencias([]);
        setSelectedSolicitante(null);
        setSolicitantes([]);
        setCurrentFabricante({});
        setFabricantes([]);

        // Lógica general
        setNewRegulatorio(defaultNewRegulatorio);
        setisAnyEmpty(false);
        setRequiredFields(defaultRequiredFields);
        setActiveIndex(0);
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
                        <span>Crear nuevo registro</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleMinimize}>
                                <i className="pi pi-minus" style={{ fontSize: '0.6rem', color:'var(--secondary-blue)',fontWeight: '800' }}></i>
                            </Button>
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
               
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
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
                                            <input className={`${requiredFields.titulo && 'form-group-empty'}`} type="text" name="titulo" value={newRegulatorio.titulo || ''} onChange={handleInputChange} required maxLength="200" placeholder="Título del registro" />
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
                                                            className={`${requiredFields.selectedGrupo && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newRegulatorio.selectedGrupo}
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
                                            <input className={`${requiredFields.referenciaInterna && 'form-group-empty'}`} type="text" name="referenciaInterna" value={newRegulatorio.referenciaInterna || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia interna" />
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
                                                            className={`${requiredFields.selectedPais && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newRegulatorio.selectedPais}
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
                                            <tbody style={{maxHeight: '65px'}}>
                                                {referencias.map((ref, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <td style={{width: '100%', display: 'grid', gridTemplateColumns: '50% 50%'}}>
                                                            <div className="table-nombre-abogado"><strong>Tipo: </strong>{ref.selectedTipoReferencia.nombre}</div>
                                                            <div className="table-nombre-abogado"><strong>Referencia: </strong>{ref.referencia}</div>
                                                        </td>
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
                            </form>
                        </TabPanel>
                        <TabPanel header="Responsables" leftIcon="pi pi-sitemap mr-2">
                            <form className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-briefcase"></i>
                                        <label>Información del cliente</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Cliente <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <DebounceDropdown className={`${requiredFields.selectedCliente && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedCliente', value)} selectedObject={newRegulatorio.selectedCliente} filterBy="clienteId,nombre" />
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
                                                                <Button className="rounded-icon-btn" onClick={(e) => fetchContactosData(newRegulatorio.selectedCliente, e)}>
                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown
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
                                                <button className='rounded-icon-btn' onClick={handleAddContacto}>
                                                    <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Contactos Agregados ({contactos.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contactos.map((contacto, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <td className="table-nombre-abogado">{contacto.nombre} {contacto.apellido} {contacto.email && `(${contacto.email})`}</td>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteContacto(e, contacto)}>
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
                                        <div className="form-group">
                                            <label>Oficina Tramitante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <DebounceDropdown className={`${requiredFields.selectedOficinaTramitante && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedOficinaTramitante', value)} selectedObject={newRegulatorio.selectedOficinaTramitante} filterBy="clienteId,nombre" />
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
                                                            value={newRegulatorio.selectedAbogado}
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
                            </form>
                        </TabPanel>
                        <TabPanel header="Solicitud" leftIcon="pi pi-users mr-2">
                            <form className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-wrench"></i>
                                        <label>Fabricantes</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Fabricante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                <input className={`${requiredFields.fabricantes && 'form-group-empty'}`} style={{ width: '30%' }} type="text" name="nombre" value={currentFabricante.nombre || ''} onChange={(e) => setCurrentFabricante({ ...currentFabricante, nombre: e.target.value })} maxLength="100" placeholder="Nombre completo" />
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
                                                <input className={`${requiredFields.fabricantes && 'form-group-empty'}`} style={{ width: '30%' }} type="text" name="ciudad" value={currentFabricante.ciudad || ''} onChange={(e) => setCurrentFabricante({ ...currentFabricante, ciudad: e.target.value })} maxLength="70" placeholder="Ciudad" />
                                                
                                                <button className='rounded-icon-btn' onClick={handleAddFabricante}>
                                                    <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Fabricantes Agregados ({fabricantes.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ maxHeight: '70px' }}>
                                                {fabricantes.map((fab, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <td style={{ width: '100%', display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
                                                            <div className="table-nombre-abogado"><strong>Nombre: </strong>{fab.nombre}</div>
                                                            <div className="table-nombre-abogado"><strong>País: </strong>{fab.selectedPais.nombre}</div>
                                                            <div className="table-nombre-abogado"><strong>Ciudad: </strong>{fab.ciudad}</div>
                                                        </td>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteFabricante(e, fab)}>
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
                                                    <DebounceDropdown endpoint='Propietarios' optionLabel='nombre' showClear={true} setter={setSelectedSolicitante} selectedObject={selectedSolicitante} filterBy="propietarioId,nombre" />
                                                </div>
                                                <button className='rounded-icon-btn' onClick={handleAddSolicitante}>
                                                    <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Propietarios agregados ({solicitantes.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {solicitantes.map((sol, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <td className="table-nombre-abogado"><strong>{sol.propietarioId} - </strong>{sol.nombre}</td>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteSolicitante(e, sol)}>
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
                        <TabPanel header="Expediente" leftIcon="pi pi-file-edit mr-2">
                            <form className="form-body form-body--create">
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
                                                            className={`${requiredFields.selectedEstado && 'form-group-empty'}`}
                                                            showClear
                                                            style={{ width: '100%' }}
                                                            value={newRegulatorio.selectedEstado}
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
                                            <input className={`${requiredFields.registro && 'form-group-empty'}`} type="text" name="registro" value={newRegulatorio.registro || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de registro" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de registro</label>
                                            <input type="date" name="fechaRegistro" value={newRegulatorio.fechaRegistro || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de vencimiento</label>
                                            <input type="date" name="fechaVencimiento" value={newRegulatorio.fechaVencimiento || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>
                            </form>
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
                        <button style={errorG || errorA || errorP && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorG || errorA || errorP} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default RegulatoriosCreate;