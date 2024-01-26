import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { OverlayPanel } from 'primereact/overlaypanel';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/infraccionSlice'; //EDITABLE: MAIN

// Comentarios
import CommentsC from '../../miscComponents/Comentarios/CommentsC'
import { useComments } from '../../../services/useComments'; // Para la creación de documentos y correos

// Documentos
import DocumentPickerC from '../../miscComponents/Documents/DocumentPickerC';
import { useFiles } from '../../../services/useFiles'; // Para la creación de documentos y correos

// Servicios
import { useInfracciones } from '../../../services/useInfracciones'; // EDITABLE: MAIN

import { useTipoInfraccion } from '../../../services/useTipoInfraccion';
import { usePaises } from '../../../services/usePais';
import { useClases } from '../../../services/useClases';
import { useTipoReferencia } from '../../../services/useTipoReferencia';
import { useAbogados } from '../../../services/useAbogados';
import { useEstados } from '../../../services/useEstados';

import { useCasos } from '../../../services/useCasos'; // EDITABLE: MAIN

// Auth
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
import { useMsal } from '@azure/msal-react';

function InfraccionesCreate({ onClose, onCreated }) { //EDITABLE

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
    const infraccionCreateData = useSelector(state => state.infraccion.InfraccionCreate); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject } = useInfracciones(); // Servicio necesario para crear el objeto
    const { createObject: createCaso } = useCasos(); // Servicio necesario para crear un nuevo caso
    const { uploadFile } = useFiles(); // Servicio para subir archivos
    const { uploadComment } = useComments(); // Servicio para subir comentarios
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia
    const opCrearCaso = useRef(null);
    const toast = useRef(null); // Referencia para el toast

    const { tiposInfracciones, error: errorTI, isLoading: isLoadingTI, isValidating: isValidatingTI, refresh: refreshTI } = useTipoInfraccion(); // Para el dropdown de tipos de patentes
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // Para el dropdown de abogados
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    const { tiposReferencias, error: errorTR, isLoading: isLoadingTR, isValidating: isValidatingTR, refresh: refreshTR } = useTipoReferencia(); // Para el dropdown de tipos de referencias
    const { clases, error: errorC, isLoading: isLoadingC, isValidating: isValidatingC, refresh: refreshC } = useClases(); // EDITABLE
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewInfraccion = {
        selectedTipoInfraccion: null,
        selectedOficinaTramitante: null,
        selectedAbogado: null,
        selectedCaso: null,
        selectedMarca: null,
        selectedClaseMarca: null,
        selectedClaseInfractor: null,
        selectedPaisMarca: null,
        selectedPaisInfractor: null,
        referenciaInterna: '',
        estados: [],
        infractor: '',
        selectedAutoridad: null,
        numeroProceso: '',
        numeroProcesoJudicial: '',
        codigoDai: '',
        referencias: [],
        fechaRegistro: ''
        // .. Seguir agregando hasta completar
    }; 
    const defaultRequiredFields = {
        selectedTipoInfraccion: false,
        selectedOficinaTramitante: false,
        selectedAbogado: false,
        selectedCaso: null,
        selectedMarca: false,
        selectedClaseMarca: false,
        selectedClaseInfractor: false,
        selectedPaisMarca: false,
        selectedPaisInfractor: false,
        referenciaInterna: false,
        infractor: false,
        selectedAutoridad: false,
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
    const [currentReferencia, setCurrentReferencia] = useState({}); // contiene la referencia que se está creando
    const [referencias, setReferencias] = useState([]); // mapea las referencias que serán añadidas

    const [selectedEstado, setSelectedEstado] = useState(null);
    const [estados, setEstados] = useState([]); // mapea los estados que serán añadidos

    const [newCaso, setNewCaso] = useState(null); // Guarda el nuevo caso que se crea

    // Lógica general
    const [newInfraccion, setNewInfraccion] = useState(defaultNewInfraccion);// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (infraccionCreateData) { // EDITABLE

            // Comentarios
            setComentariosData(infraccionCreateData.comentariosData || []);

            // Dropdowns
            setCurrentReferencia(infraccionCreateData.currentReferencia || {});
            setReferencias(infraccionCreateData.referencias || []);
            setSelectedEstado(infraccionCreateData.selectedEstado || null);
            setEstados(infraccionCreateData.estados || []);

            setNewCaso(infraccionCreateData.newCaso || null);

            // Lógica general
            setNewInfraccion(infraccionCreateData.newInfraccion || defaultNewInfraccion);
            setisAnyEmpty(infraccionCreateData.isAnyEmpty || false);
            setRequiredFields(infraccionCreateData.requiredFields || defaultRequiredFields);
            setActiveIndex(infraccionCreateData.activeIndex || 0);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL

    const saveState = () => {
        dispatch(saveData({
            objectName: 'InfraccionCreate',
            value: {
                comentariosData,
                currentReferencia,
                referencias,
                selectedEstado,
                estados,
                newInfraccion,
                isAnyEmpty,
                requiredFields,
                activeIndex,
                newCaso
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
        selectedEstado,
        estados,
        newInfraccion,
        isAnyEmpty,
        requiredFields,
        activeIndex,
        newCaso]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'InfraccionCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    // ------------ Dropdowns de selección múltiple -----------------------------

    // Clases options para Marca 
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

    // Paises options para Marca
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
        if (newInfraccion.selectedMarca && newInfraccion.selectedMarca !== undefined) {
            fetchClasesData(newInfraccion.selectedMarca);
            fetchPaisesData(newInfraccion.selectedMarca);
        }
    }, [newInfraccion.selectedMarca]) 

    // Infracciones relacionadas para un caso
    const [infraccionesRelacionadas, setInfraccionesRelacionadas] = useState([]);

    const fetchInfraccionesRelacionadas = async (caso, e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (caso && caso.casoInfraccionId) {
            try {
                const API_BASE_URL = `${apiEndpoint}/Caso/${caso.casoInfraccionId}`;
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
                    setInfraccionesRelacionadas(fetchedData);
                } else {
                    setInfraccionesRelacionadas([]);
                }
            } catch (error) {
                setInfraccionesRelacionadas([]);
            } 
        }
    }; // Fetcher que trae las referencias internas de infracciones relacionadas a un caso

    useEffect(() => {
        if (newInfraccion.selectedCaso && newInfraccion.selectedCaso !== undefined) {
            fetchInfraccionesRelacionadas(newInfraccion.selectedCaso);
        }
    }, [newInfraccion.selectedCaso]) 

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
        setNewInfraccion(prevInfraccion => ({
            ...prevInfraccion,
            referencias: newReferencias
        }));
    }, [referencias]); // Guarda las referencias en la propiedad de la patente

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
        setNewInfraccion(prevInfraccion => ({
            ...prevInfraccion,
            estados: estadosIds
        }));
    }, [estados]); // Guarda los ids de los estados elegidos en la propiedad de la accion



    // ------------------ Dropdowns normales ---------------------------------------

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshTI(); 
        refreshP(); 
        refreshTR(); 
        refreshC(); 
        refreshA(); 
        refreshE();
    }; // Refresca los datos del los dropdowns: GENERAL

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingTI, isValidatingP, isValidatingTR, isValidatingC, isValidatingA, isValidatingE ]); // Cambia el estado de refreshing: GENERAL

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

    // ------------------ FIN DROPDOWNS ---------------------------------------

    // ------------------ DOCUMENTOS ---------------------------------------
    useEffect(() => {

        const requiredEmpty = Object.keys(defaultRequiredFields).some(key => {
            return isEmptyValue(newInfraccion[key]);
        });

        setIsRequiredEmpty(requiredEmpty);
    }, [newInfraccion]); // Habilita o deshabilita la pestaña de documentos si falta un campo requerido: ESPECÍFICO

    // ------------------ FIN DOCUMENTOS ---------------------------------------

    const updateSelectedObject = (selectedObject, value) => {
        setNewInfraccion(prev => ({ ...prev, [selectedObject]: value })); // Editar
    }; // Maneja el cambio para un dropdown

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setNewInfraccion(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
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
        const anyFieldEmpty = validateRequiredFields(newInfraccion);

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

        // Crea la infraccion nueva
        try {
            setIsLoading2(true);
            const finalNewInfraccion = {
                "tipoInfraccionId": newInfraccion.selectedTipoInfraccion.tipoInfraccionId,
                "oficinaTramitanteId": newInfraccion.selectedOficinaTramitante.clienteId,
                "abogadoId": newInfraccion.selectedAbogado.abogadoId, 
                "casoInfraccionId": newInfraccion.selectedCaso.casoInfraccionId,
                "marcaId": newInfraccion.selectedMarca.marcaId,
                "claseMarca": newInfraccion.selectedClaseMarca.codigo,
                "claseInfractor": newInfraccion.selectedClaseInfractor.codigo,
                "codigoPaisMarca": newInfraccion.selectedPaisMarca.codigoPais,
                "codigoPaisInfractor": newInfraccion.selectedPaisInfractor.codigoPais,
                "referenciaInterna": newInfraccion.referenciaInterna,
                "estados": newInfraccion.estados,
                "infractor": newInfraccion.infractor,
                "autoridadId": newInfraccion.selectedAutoridad.autoridadId,
                "numeroProceso": newInfraccion.numeroProceso,
                "numeroProcesoJudicial": newInfraccion.numeroProcesoJudicial,
                "codigoDai": newInfraccion.codigoDai,
                "referencias": newInfraccion.referencias,
                "fechaRegistro": newInfraccion.fechaRegistro,
            }

            const response = await createObject(finalNewInfraccion); 
            status = response.status;
            data = response.data;

            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: 'Infracción creada con éxito', // EDITABLE
                    life: 3000,
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
                detail: 'Hubo un error al crear la infracción', // EDITABLE
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
            // Proceed to create documents only if the client was successfully created
            if (status === 201 && data?.infraccionId) {
                documentos.forEach(async documento => {
                    try {
                        await uploadFile(documento, data.infraccionId, "infraccion", "documento");
                    } catch (uploadError) {
                        // Handle errors for document uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                correos.forEach(async correo => {
                    try {
                        await uploadFile(correo, data.infraccionId, "infraccion", "correo");
                    } catch (uploadError) {
                        // Handle errors for correo uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                if (comentariosData.commentsToUpload && comentariosData.commentsToUpload.length > 0) {
                    comentariosData.commentsToUpload.forEach(async comment => {
                        try {
                            await uploadComment(comment, data.infraccionId, "infraccion");
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
        setCurrentReferencia({});
        setReferencias([]);
        setSelectedEstado(null);
        setEstados([]);
        setNewCaso(null);

        // Lógica general
        setNewInfraccion(defaultNewInfraccion);
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

    // -------------------------------------- Manejar un nuevo Caso -------------------------------------------

    const [isCreatingCaso, setIsCreatingCaso] = useState(false);

    const handleAddCaso = async (e) => {
        e.preventDefault();

        let status;
        let data;

        if (newCaso) {
            try {
                setIsCreatingCaso(true);
                const casoToCreate = {
                    numeroCasoInfraccion: newCaso
                }
                const response = await createCaso(casoToCreate);
                status = response.status;
                data = response.data;

                if (status === 208) {
                    toast.current.show({
                        severity: 'warn',
                        summary: 'Alerta',
                        detail: 'El caso que intentas crear, ya existe. Puedes buscarlo entre las opciones',
                        life: 3000,
                    });
                    setNewCaso(null);
                    opCrearCaso.current.toggle(false);
                } else if (status === 201) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Proceso exitoso',
                        detail: 'Caso creado con éxito', 
                        life: 3000,
                    });
                    setNewCaso(null);
                    opCrearCaso.current.toggle(false);
                } else {
                    throw new Error(`Error en la creación: código de estado ${status}`);
                }
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un error al crear el caso', 
                    life: 3000,
                });
            } finally {
                setIsCreatingCaso(false);
                if (data && data?.casoInfraccionId && status === 201) {
                    const nuevoCaso = {
                        casoInfraccionId: data.casoInfraccionId,
                        numeroCasoInfraccion: data.numeroCasoInfraccion
                    };
                    updateSelectedObject('selectedCaso', nuevoCaso);
                }
            }
        }
    }

    // -----------------------------------------------------------------------------------------------

    useEffect(() => {
        console.log(newInfraccion);
    },[newInfraccion])

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
                        <span>Crear nueva infracción</span> 
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
                        <TabPanel header="Infraccion" leftIcon="pi pi-exclamation-triangle mr-2">
                            <div className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-info-circle"></i>
                                        <label>Información de la infracción</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Tipo de infracción <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    errorTI || !tiposInfracciones ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTI || (isRefreshing && isValidatingTI) ?
                                                                    <div className="small-spinner" /> :
                                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                                            </div>
                                                            <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Dropdown
                                                            className={`${requiredFields.selectedTipoInfraccion && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newInfraccion.selectedTipoInfraccion}
                                                            onChange={(e) => updateSelectedObject('selectedTipoInfraccion', e.value)}
                                                            options={tiposInfracciones}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de infracción"
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
                                            <input className={`${requiredFields.referenciaInterna && 'form-group-empty'}`} type="text" name="referenciaInterna" value={newInfraccion.referenciaInterna || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia interna" />
                                        </div>
                                        <div className="form-group">
                                            <label>Código DAI</label>
                                            <input type="text" name="codigoDai" value={newInfraccion.codigoDai || ''} onChange={handleInputChange} maxLength="70" placeholder="DAI" />
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
                                            <tbody style={{maxHeight: '150px'}}>
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
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-credit-card"></i>
                                        <label>Proceso</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Número de proceso</label>
                                            <input type="text" name="numeroProceso" value={newInfraccion.numeroProceso || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de proceso" />
                                        </div>
                                        <div className="form-group">
                                            <label>Número de proceso judicial</label>
                                            <input type="text" name="numeroProcesoJudicial" value={newInfraccion.numeroProcesoJudicial || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de proceso judicial" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de registro</label>
                                            <input type="date" name="fechaRegistro" value={newInfraccion.fechaRegistro || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </TabPanel>
                        <TabPanel header="Responsables" leftIcon="pi pi-sitemap mr-2">
                            <div className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-users"></i>
                                        <label>Responsables</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group" style={{ minWidth: 'calc(100% - 20px)'}}>
                                            <label>Oficina Tramitante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <DebounceDropdown className={`${requiredFields.selectedOficinaTramitante && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedOficinaTramitante', value)} selectedObject={newInfraccion.selectedOficinaTramitante} filterBy="clienteId,nombre" />
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
                                                            value={newInfraccion.selectedAbogado}
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
                                        <div className="form-group">
                                            <label>Autoridad <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <DebounceDropdown className={`${requiredFields.selectedAutoridad && 'form-group-empty'}`} endpoint='Autoridades' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedAutoridad', value)} selectedObject={newInfraccion.selectedAutoridad} filterBy="autoridadId,nombre" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </TabPanel>
                        <TabPanel header="Involucrados" leftIcon="pi pi-users mr-2">
                            <div className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-verified"></i>
                                        <label>Marca</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group" style={{ minWidth: 'calc(100% - 20px)' }}>
                                            <label>Marca <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <DebounceDropdown className={`${requiredFields.selectedMarca && 'form-group-empty'}`} endpoint='Marcas' optionLabel='nombre' showClear={false} setter={(value) => { updateSelectedObject('selectedMarca', value); updateSelectedObject('selectedClaseMarca', null); updateSelectedObject('selectedPaisMarca', null) }} selectedObject={newInfraccion.selectedMarca} filterBy="marcaId,signo" />
                                        </div>
                                        <div className="form-group">
                                            <label>País <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    paisesOptions.length === 0 ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {paisesLoading ?
                                                                    <div className="small-spinner" /> :
                                                                    <span>No hay países que mostrar</span>}
                                                            </div>
                                                            <Button className="rounded-icon-btn" onClick={(e) => fetchPaisesData(newInfraccion?.selectedMarca, e)}>
                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Dropdown
                                                            className={`${requiredFields.selectedPaisMarca && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newInfraccion.selectedPaisMarca}
                                                            onChange={(e) => updateSelectedObject('selectedPaisMarca', e.value)}
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
                                        <div className="form-group">
                                            <label>Clase <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    clasesOptions.length === 0 ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {clasesLoading ?
                                                                    <div className="small-spinner" /> :
                                                                    <span>No hay clases que mostrar</span>}
                                                            </div>
                                                            <Button className="rounded-icon-btn" onClick={(e) => fetchClasesData(newInfraccion?.selectedMarca, e)}>
                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Dropdown
                                                            className={`${requiredFields.selectedClaseMarca && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newInfraccion.selectedClaseMarca}
                                                            onChange={(e) => updateSelectedObject('selectedClaseMarca', e.value)}
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
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-exclamation-triangle"></i>
                                        <label>Infractor</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-single">
                                            <label>Infractor <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.infractor && 'form-group-empty'}`} type="text" name="infractor" value={newInfraccion.infractor || ''} onChange={handleInputChange} maxLength="70" placeholder="Denominación del infractor" />
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
                                                            className={`${requiredFields.selectedPaisInfractor && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newInfraccion.selectedPaisInfractor}
                                                            onChange={(e) => updateSelectedObject('selectedPaisInfractor', e.value)}
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
                                        <div className="form-group">
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
                                                            className={`${requiredFields.selectedClaseInfractor && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newInfraccion.selectedClaseInfractor}
                                                            onChange={(e) => updateSelectedObject('selectedClaseInfractor', e.value)}
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
                                            <tbody style={{ maxHeight: '75px' }}>
                                                {estados.map((est, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <td className="table-nombre-abogado" style={{ color: est.color }}><strong>{est.codigo} - </strong>{est.descripcionEspanol}/{est.descripcionIngles}</td>
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
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-folder-open"></i>
                                        <label>Caso</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-single">
                                            <label>Caso <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                                                <div style={{ width: '82%'}}>
                                                    <DebounceDropdown className={`${requiredFields.selectedCaso && 'form-group-empty'}`} endpoint='Caso' optionLabel='numeroCasoInfraccion' showClear={false} setter={(value) => updateSelectedObject('selectedCaso', value)} selectedObject={newInfraccion.selectedCaso} filterBy="numeroCasoInfraccion" />
                                                </div>
                                                <button className="form-accept-btn logo-btn" onClick={(e) => opCrearCaso.current.toggle(e)} style={{ width: 'fit-content', gap: '5px' }}>
                                                    <i className="pi pi-folder-open"></i>
                                                    <span>Nuevo caso</span>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Infracciones relacionadas ({infraccionesRelacionadas.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ maxHeight: '75px' }}>
                                                {infraccionesRelacionadas.map((inf, index) => (
                                                    <tr className="table-row" key={index} style={{ padding: '5px' }}>
                                                        <td className="table-nombre-abogado">{inf.referenciaInterna}</td>
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
                        <button style={errorTI || errorA || errorP || errorC && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorTI || errorA || errorP || errorC} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
            <OverlayPanel ref={opCrearCaso} showCloseIcon className="overlay-logos" >
                <div className="form-group overlay-form">
                    {(isCreatingCaso) &&
                        <div className="spinner-container" style={{top:'0',left:'0'}}>
                            <div className="spinner" />
                        </div>
                    }
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h4 style={{ fontFamily: 'var(--poppins)', fontSize: '14px', color: 'var(--neutral-gray)' }}>Ingresa el nuevo caso que deseas crear</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                            <label>Caso</label>
                            <input placeholder="Nombre o número del caso" type="text" name="nuevoCaso" value={newCaso || ''} onChange={(e) => setNewCaso(e.target.value)} maxLength="70" />
                        </div>
                        <button className='form-accept-btn logo-btn' style={{ backgroundColor: (!newCaso || newCaso.trim() === '') && 'var(--neutral-gray)', marginLeft: 'auto' }} disabled={!newCaso || newCaso.trim() === ''} onClick={handleAddCaso}>
                            <i className="pi pi-plus-circle"></i>
                            <span>Agregar</span>
                        </button>
                    </div>
                </div>
            </OverlayPanel>
        </>
    );
}

export default InfraccionesCreate;