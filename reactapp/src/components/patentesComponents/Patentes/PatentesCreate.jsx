import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../../context/patenteSlice'; //EDITABLE: MAIN

// Comentarios
import CommentsC from '../../miscComponents/Comentarios/CommentsC'
import { useComments } from '../../../services/useComments'; // Para la creación de documentos y correos

// Documentos
import DocumentPickerC from '../../miscComponents/Documents/DocumentPickerC';
import { useFiles } from '../../../services/useFiles'; // Para la creación de documentos y correos

// Servicios
import { usePatentes } from '../../../services/usePatentes'; // EDITABLE: MAIN
import { useTipoPatente } from '../../../services/useTipoPatente'; 
import { useAbogados } from '../../../services/useAbogados'; 
import { usePaises } from '../../../services/usePais'; 
import { useTipoReferencia } from '../../../services/useTipoReferencia'; 
import { useGacetas } from '../../../services/useGacetas'; 
import { useTipoPublicacion } from '../../../services/useTipoPublicacion'; 
import { useEstados } from '../../../services/useEstados'; 

// Auth
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
import { useMsal } from '@azure/msal-react';

function PatentesCreate({ onClose, onCreated }) { //EDITABLE

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
    const patenteCreateData = useSelector(state => state.patente.PatenteCreate); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const { createObject } = usePatentes(); // Servicio necesario para crear el objeto
    const { uploadFile } = useFiles(); // Servicio para subir archivos
    const { uploadComment } = useComments(); // Servicio para subir comentarios
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia
    const toast = useRef(null); // Referencia para el toast

    const { tiposPatentes, error: errorTP, isLoading: isLoadingTP, isValidating: isValidatingTP, refresh: refreshTP } = useTipoPatente(); // Para el dropdown de tipos de patentes
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // Para el dropdown de abogados
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    const { tiposReferencias, error: errorTR, isLoading: isLoadingTR, isValidating: isValidatingTR, refresh: refreshTR } = useTipoReferencia(); // Para el dropdown de tipos de referencias
    const { gacetas, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGacetas(); // Para el dropdown de gacetas
    const { tiposPublicaciones, error: errorTPu, isLoading: isLoadingTPu, isValidating: isValidatingTPu, refresh: refreshTPu } = useTipoPublicacion(); // Para el dropdown de tipos de publicaciones
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false); // Para los dropdowns
    const defaultNewPatente = {
        selectedTipoPatente: null,
        selectedCliente: null,
        contactosIds: [],
        selectedOficinaTramitante: null,
        selectedAbogado: null,
        abogadoInternacional: '',
        tituloEspanol: '',
        tituloIngles: '',
        resumen: '',
        selectedPais: null,
        referenciaInterna: '',
        pagoAnualidad: false,
        referencias: [],
        inventoresIds: [],
        solicitantesIds: [],
        pagoAnualidadDesde: '',
        pagoAnualidadHasta: '',
        caja: '',
        prioridadPatente: [],
        publicaciones: [],
        estados: [],
        registro: '',
        fechaRegistro: '',
        publicacion: '',
        fechaPublicacion: '',
        certificado: '',
        vencimiento: '',
        pctSolicitud: '',
        fechaPctSolicitud: '',
        pctPublicacion: '',
        fechaPctPublicacion: '',
        // .. Seguir agregando hasta completar
    }; 
    const defaultRequiredFields = {
        selectedTipoPatente: false,
        selectedCliente: false,
        selectedOficinaTramitante: false,
        selectedAbogado: false,
        tituloEspanol: false,
        tituloIngles: false,
        selectedPais: false,
        referenciaInterna: false,
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
    const [inventores, setInventores] = useState([]); // mapea los inventores que serán añadidos
    const [solicitantes, setSolicitantes] = useState([]); // mapea los solicitantes que serán añadidos
    const [currentPrioridad, setCurrentPrioridad] = useState({}); // contiene la prioridad que se está creando
    const [prioridades, setPrioridades] = useState([]); // mapea las prioridades que serán añadidas
    const [currentPublicacion, setCurrentPublicacion] = useState({}); // contiene la publicación que se está creando
    const [publicaciones, setPublicaciones] = useState([]); // mapea las publicaciones que serán añadidas
    const [estados, setEstados] = useState([]); // mapea los estados que serán añadidos
    const [selectedInventor, setSelectedInventor] = useState(null);
    const [selectedSolicitante, setSelectedSolicitante] = useState(null);
    const [selectedEstado, setSelectedEstado] = useState(null);

    // Lógica general
    const [newPatente, setNewPatente] = useState(defaultNewPatente);// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (patenteCreateData) { // EDITABLE

            // Comentarios
            setComentariosData(patenteCreateData.comentariosData || []);

            // Dropdowns
            setContactos(patenteCreateData.contactos || []);
            setCurrentReferencia(patenteCreateData.currentReferencia || {});
            setReferencias(patenteCreateData.referencias || []);
            setInventores(patenteCreateData.inventores || []);
            setSolicitantes(patenteCreateData.solicitantes || []);
            setCurrentPrioridad(patenteCreateData.currentPrioridad || {});
            setPrioridades(patenteCreateData.prioridades || []);
            setCurrentPublicacion(patenteCreateData.currentPublicacion || {});
            setPublicaciones(patenteCreateData.publicaciones || []);
            setEstados(patenteCreateData.estados || []);

            setSelectedInventor(patenteCreateData.selectedInventor || null);
            setSelectedSolicitante(patenteCreateData.selectedSolicitante || null);
            setSelectedEstado(patenteCreateData.selectedEstado || null);

            // Lógica general
            setNewPatente(patenteCreateData.newPatente || defaultNewPatente);
            setisAnyEmpty(patenteCreateData.isAnyEmpty || false);
            setRequiredFields(patenteCreateData.requiredFields || defaultRequiredFields);
            setActiveIndex(patenteCreateData.activeIndex || 0);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL

    const saveState = () => {
        dispatch(saveData({
            objectName: 'PatenteCreate',
            value: {
                comentariosData,
                contactos,
                currentReferencia,
                referencias,
                inventores,
                solicitantes,
                currentPrioridad,
                prioridades,
                currentPublicacion,
                publicaciones,
                estados,
                newPatente,
                isAnyEmpty,
                requiredFields,
                activeIndex,
                selectedInventor,
                selectedSolicitante,
                selectedEstado,
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
        inventores,
        solicitantes,
        currentPrioridad,
        prioridades,
        currentPublicacion,
        publicaciones,
        estados,
        newPatente,
        isAnyEmpty,
        requiredFields,
        activeIndex,
        selectedInventor,
        selectedSolicitante,
        selectedEstado]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'PatenteCreate' })); // EDITABLE
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
        /*setContactos([]);*/
        fetchContactosData(newPatente.selectedCliente);
    }, [newPatente.selectedCliente]) // Busca los contactos de acuerdo con el cliente elegido !!! REVISAR: Cuando se cambia de cliente debe borrar los contactos pero eso da un problema con la persistencia
    useEffect(() => {

        const contactosIds = contactos.map(contacto => contacto.contactoId);

        setNewPatente(prevPatente => ({
            ...prevPatente,
            contactosIds: contactosIds
        }));
    }, [contactos]); // Guarda los ids de los contactos elegidos en la propiedad de la patente

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
        setNewPatente(prevPatente => ({
            ...prevPatente,
            referencias: newReferencias
        }));
    }, [referencias]); // Guarda las referencias en la propiedad de la patente

    // Inventores
    const handleAddInventor = (e) => {
        e.preventDefault();
        if (selectedInventor && !inventores.some(inv => inv.inventorId === selectedInventor.inventorId)) {
            setInventores([...inventores, selectedInventor]);
            setSelectedInventor(null);
        }
    }; // Agrega un inventor a la lista
    const handleDeleteInventor = (e, object) => {
        e.preventDefault();
        const updatedInventores = inventores.filter((item) => item !== object);
        setInventores(updatedInventores);
    }; // Quita un inventor de la lista
    useEffect(() => {
        const inventoresIds = inventores.map(inv => inv.inventorId);
        setNewPatente(prevPatente => ({
            ...prevPatente,
            inventoresIds: inventoresIds
        }));
    }, [inventores]); // Guarda los ids de los inventores elegidos en la propiedad de la patente

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
        setNewPatente(prevPatente => ({
            ...prevPatente,
            solicitantesIds: solicitantesIds
        }));
    }, [solicitantes]); // Guarda los ids de los solicitantes elegidos en la propiedad de la patente

    // Prioridades
    const handleAddPrioridad = (e) => {
        e.preventDefault();
        const { selectedPais, numero, fecha } = currentPrioridad;

        if (!selectedPais || !numero || !fecha || numero?.trim() === '' || fecha?.trim() === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir una prioridad, todos los campos deben estar completos', // EDITABLE
                life: 3000,
            });
            return; // Exit the function if the condition is not met
        }

        if (!prioridades.some(prio => (prio.numero === numero) && (prio.fecha === fecha) && (prio.selectedPais.codigoPais === selectedPais.codigoPais))) {
            setPrioridades([...prioridades, currentPrioridad]);
            setCurrentPrioridad({});
        }
    }; // Agrega una prioridad a la lista
    const handleDeletePrioridad = (e, object) => {
        e.preventDefault();
        const updatedPrioridades = prioridades.filter((item) => item !== object);
        setPrioridades(updatedPrioridades);
    }; // Quita una referencia de la lista
    useEffect(() => {
        const newPrioridades = prioridades.map(prio => ({
            codigoPais: prio.selectedPais.codigoPais,
            numero: prio.numero,
            fecha: prio.fecha
        }));
        setNewPatente(prevPatente => ({
            ...prevPatente,
            prioridadPatente: newPrioridades
        }));
    }, [prioridades]); // Guarda las prioridades en la propiedad de la patente

    // Publicaciones
    const handleAddPublicacion = (e) => {
        e.preventDefault();
        const { selectedTipoPublicacion, selectedGaceta, pagina } = currentPublicacion;

        if (!selectedTipoPublicacion || !selectedGaceta || !pagina || pagina?.trim() === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir una publicación, todos los campos deben estar completos', // EDITABLE
                life: 3000,
            });
            return; // Exit the function if the condition is not met
        }

        if (!publicaciones.some(pub => (pub.selectedTipoPublicacion.tipoPublicacionId === selectedTipoPublicacion.tipoPublicacionId) && (pub.pagina === pagina) && (pub.selectedGaceta.numero === selectedGaceta.numero))) {
            setPublicaciones([...publicaciones, currentPublicacion]);
            setCurrentPublicacion({});
        }
    }; // Agrega una publicación a la lista
    const handleDeletePublicacion = (e, object) => {
        e.preventDefault();
        const updatedPublicaciones = publicaciones.filter((item) => item !== object);
        setPublicaciones(updatedPublicaciones);
    }; // Quita una publicación de la lista
    useEffect(() => {
        const newPublicaciones = publicaciones.map(pub => ({
            tipoPublicacionId: pub.selectedTipoPublicacion.tipoPublicacionId,
            numeroGaceta: pub.selectedGaceta.numero,
            pagina: pub.pagina
        }));
        setNewPatente(prevPatente => ({
            ...prevPatente,
            publicaciones: newPublicaciones
        }));
    }, [publicaciones]); // Guarda las publicaciones en la propiedad de la patente

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
        setNewPatente(prevPatente => ({
            ...prevPatente,
            estados: estadosIds
        }));
    }, [estados]); // Guarda los ids de los estados elegidos en la propiedad de la patente

    // ------------------ Dropdowns normales ---------------------------------------

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshTP(); // Tipos de patentes
        refreshP(); // Países
        refreshA(); // Abogados
        refreshTR(); // Tipos de referencias
        refreshG(); // Gacetas
        refreshTPu(); // Tipos de publicación
        refreshE();
    }; // Refresca los datos del los dropdowns: GENERAL

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingP, isValidatingA, isValidatingTP, isValidatingTR, isValidatingG, isValidatingTPu, isValidatingE ]); // Cambia el estado de refreshing: GENERAL

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

    // ------------------ FIN DROPDOWNS ---------------------------------------

    // ------------------ DOCUMENTOS ---------------------------------------
    useEffect(() => {

        const requiredEmpty = Object.keys(defaultRequiredFields).some(key => {
            return isEmptyValue(newPatente[key]);
        });

        setIsRequiredEmpty(requiredEmpty);
    }, [newPatente]); // Habilita o deshabilita la pestaña de documentos si falta un campo requerido: ESPECÍFICO

    // ------------------ FIN DOCUMENTOS ---------------------------------------

    const updateSelectedObject = (selectedObject, value) => {
        setNewPatente(prev => ({ ...prev, [selectedObject]: value })); // Editar
    }; // Maneja el cambio para un dropdown

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setNewPatente(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
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

    function datesInvalid(startDateParam, endDateParam) {
        if (!startDateParam || !endDateParam) return false;

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        return startDate > endDate;
    }

    const handleCreate = async (e) => {
        e.preventDefault();

        // VALIDACIONES DE FECHAS
        const dateValidationPairs = [
            { from: newPatente?.pagoAnualidadDesde, to: newPatente?.pagoAnualidadHasta, name: "Pago de anualidad" },
        ];

        for (let { from, to, name } of dateValidationPairs) {
            if (datesInvalid(from, to)) {
                toast.current.show({
                    severity: 'info',
                    summary: 'Alerta',
                    detail: `La fecha de inicio de "${name}" debe ser anterior a la fecha de fin`,
                    life: 3000,
                });
                return;
            }
        }


        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(newPatente);

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

        // Crea la patante nueva
        try {
            setIsLoading2(true);
            const finalNewPatente = {
                "tipoPatenteId": newPatente.selectedTipoPatente.tipoPatenteId,
                "clienteId": newPatente.selectedCliente.clienteId,
                "contactosIds": newPatente.contactosIds,
                "oficinaTramitanteId": newPatente.selectedOficinaTramitante.clienteId,
                "abogadoId": newPatente.selectedAbogado.abogadoId,
                "abogadoInternacional": newPatente.abogadoInternacional,
                "codigoPais": newPatente.selectedPais.codigoPais,
                "tituloEspanol": newPatente.tituloEspanol,
                "tituloIngles": newPatente.tituloIngles,
                "resumen": newPatente.resumen,
                "inventoresIds": newPatente.inventoresIds,
                "solicitantesIds": newPatente.solicitantesIds,
                "referenciaInterna": newPatente.referenciaInterna,
                "referencias": newPatente.referencias,
                "estados": newPatente.estados,
                "caja": newPatente.caja,
                "registro": newPatente.registro,
                "fechaRegistro": newPatente.fechaRegistro,
                "publicacion": newPatente.publicacion,
                "fechaPublicacion": newPatente.fechaPublicacion,
                "certificado": newPatente.certificado,
                "vencimiento": newPatente.vencimiento,
                "pctSolicitud": newPatente.pctSolicitud,
                "fechaPctSolicitud": newPatente.fechaPctSolicitud,
                "pctPublicacion": newPatente.pctPublicacion,
                "fechaPctPublicacion": newPatente.fechaPctPublicacion,
                "prioridadPatente": newPatente.prioridadPatente,
                "publicaciones": newPatente.publicaciones,
                "pagoAnualidad": newPatente.pagoAnualidad,
                "pagoAnualidadDesde": newPatente.pagoAnualidadDesde,
                "pagoAnualidadHasta": newPatente.pagoAnualidadHasta
            }

            const response = await createObject(finalNewPatente); 
            status = response.status;
            data = response.data;

            if (status === 201) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Proceso exitoso',
                    detail: `Patente creada con ID: ${data?.patenteId}`, // EDITABLE
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
                detail: 'Hubo un error al crear la patente', // EDITABLE
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
            // Proceed to create documents only if the client was successfully created
            if (status === 201 && data?.patenteId) {
                documentos.forEach(async documento => {
                    try {
                        await uploadFile(documento, data.patenteId, "patente", "documento");
                    } catch (uploadError) {
                        // Handle errors for document uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                correos.forEach(async correo => {
                    try {
                        await uploadFile(correo, data.patenteId, "patente", "correo");
                    } catch (uploadError) {
                        // Handle errors for correo uploads here
                        console.error(uploadError);
                        // Optionally show a toast or perform other error handling
                    }
                });

                if (comentariosData.commentsToUpload && comentariosData.commentsToUpload.length > 0) {
                    comentariosData.commentsToUpload.forEach(async comment => {
                        try {
                            await uploadComment(comment, data.patenteId, "patente");
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
        setisAnyEmpty(false);
        setNewPatente(defaultNewPatente); // EDITABLE
        setRequiredFields(defaultRequiredFields);
        setActiveIndex(0);

        // Objetos
        setContactos([]);
        setCurrentReferencia({});
        setReferencias([]);
        setInventores([]);
        setSolicitantes([]);
        setCurrentPrioridad({});
        setPrioridades([]);
        setCurrentPublicacion({});
        setPublicaciones([]);
        setEstados([]);
        setSelectedEstado(null);
        setSelectedSolicitante(null);
        setSelectedInventor(null);
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

    // Función para buscar la patente en OMPI
    const searchPatenteOMPI = (e) => {
        e.preventDefault();
        if (newPatente?.pctPublicacion) {
            const publicacionParts = newPatente?.pctPublicacion.split(' ');
            if (publicacionParts.length >= 2) {
                const docId = publicacionParts[1].replace('/', '');
                const formattedString = `${publicacionParts[0]}${docId}`;
                const url = `https://patentscope.wipo.int/search/es/detail.jsf?docId=${formattedString}&recNum=1&maxRec=&office=&prevFilter=&sortOption=&queryString=&tab=PCT+Biblio`;
                window.open(url, '_blank');
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Alerta',
                    detail: 'El formato de la publicación no es el correcto (Ej. WO 2015/193725 A3)', // EDITABLE
                    life: 3000,
                });
            }
        }
    };

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
                        <span>Crear nueva patente</span> 
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
                        <TabPanel header="Patente" leftIcon="pi pi-shield mr-2">
                            <form className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-info-circle"></i>
                                        <label>Información de la patente</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Título <small>(ES)</small> <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.tituloEspanol && 'form-group-empty'}`} type="text" name="tituloEspanol" value={newPatente.tituloEspanol || ''} onChange={handleInputChange} required maxLength="70" placeholder="Título de la patente en español" />
                                        </div>
                                        <div className="form-group">
                                            <label>Título <small>(EN)</small> <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <input className={`${requiredFields.tituloIngles && 'form-group-empty'}`} type="text" name="tituloIngles" value={newPatente.tituloIngles || ''} onChange={handleInputChange} required maxLength="70" placeholder="Título de la patente en inglés" />
                                        </div>
                                        <div className="form-group">
                                            <label>Tipo de patente <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <div>
                                                {
                                                    errorTP || !tiposPatentes ? (
                                                        <div className="dropdown-error">
                                                            <div className="dropdown-error-msg">
                                                                {isLoadingTP || (isRefreshing && isValidatingTP) ?
                                                                    <div className="small-spinner" /> :
                                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                                            </div>
                                                            <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Dropdown
                                                            className={`${requiredFields.selectedTipoPatente && 'form-group-empty'}`}
                                                            style={{ width: '100%' }}
                                                            value={newPatente.selectedTipoPatente}
                                                            onChange={(e) => updateSelectedObject('selectedTipoPatente', e.value)}
                                                            options={tiposPatentes}
                                                            optionLabel="nombre"
                                                            placeholder="Selecciona un tipo de patente"
                                                            filter
                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                            valueTemplate={selectedValueTemplate}
                                                            itemTemplate={optionTemplate}
                                                        />
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 'calc(31.8%)'}}>
                                            <div className="form-group">
                                                <label>Referencia interna <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input className={`${requiredFields.referenciaInterna && 'form-group-empty'}`} type="text" name="referenciaInterna" value={newPatente.referenciaInterna || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia interna" />
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
                                                                value={newPatente.selectedPais}
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
                                        <div className="form-group">
                                            <label>Resumen</label>
                                            <textarea style={{ height: '65px', maxHeight: '65px'}} type="text" name="resumen" value={newPatente.resumen || ''} onChange={handleInputChange} maxLength="1000" placeholder="Resumen de la patente" />
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
                                        <label>Anualidad</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group center-switch">
                                            <label>¿Pago de anualidad?</label>
                                            <label className="switch">
                                                <input type="checkbox" name="pagoAnualidad" checked={newPatente.pagoAnualidad} onChange={handleInputChange} />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de Inicio de Pago</label>
                                            <input type="date" name="pagoAnualidadDesde" value={newPatente.pagoAnualidadDesde || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>Fecha de Fin de Pago</label>
                                            <input type="date" name="pagoAnualidadHasta" value={newPatente.pagoAnualidadHasta || ''} onChange={handleInputChange} />
                                        </div>
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
                                            <DebounceDropdown className={`${requiredFields.selectedCliente && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedCliente', value)} selectedObject={newPatente.selectedCliente} filterBy="clienteId,nombre" />
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
                                                                <Button className="rounded-icon-btn" onClick={(e) => fetchContactosData(newPatente.selectedCliente, e)}>
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
                                        <div className="form-group" style={{ minWidth: 'calc(100% - 20px)'}}>
                                            <label>Oficina Tramitante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                            <DebounceDropdown className={`${requiredFields.selectedOficinaTramitante && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedOficinaTramitante', value)} selectedObject={newPatente.selectedOficinaTramitante} filterBy="clienteId,nombre" />
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
                                                            value={newPatente.selectedAbogado}
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
                                            <label>Responsable internacional</label>
                                            <input type="text" name="abogadoInternacional" value={newPatente.abogadoInternacional || ''} onChange={handleInputChange} maxLength="70" placeholder="Nombre completo del responsable" />
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </TabPanel>
                        <TabPanel header="Solicitud" leftIcon="pi pi-users mr-2">
                            <form className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-cog"></i>
                                        <label>Inventores</label>
                                    </div>
                                    <div className="form-body-group"> 
                                        <div className="form-group form-group-single">
                                            <label>Inventores</label>
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                <div style={{ width: '100%' }}>
                                                    <DebounceDropdown endpoint='Inventores' optionLabel='nombre' showClear={true} setter={setSelectedInventor} selectedObject={selectedInventor} filterBy="inventorId,nombre,apellido" />
                                                </div>
                                                <button className='rounded-icon-btn' onClick={handleAddInventor}>
                                                    <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Inventores agregados ({inventores.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventores.map((inv, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <td className="table-nombre-abogado"><strong>{inv.inventorId} - </strong>{inv.nombre} {inv.apellido}</td>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteInventor(e, inv)}>
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
                        <TabPanel header="Extra" leftIcon="pi pi-plus-circle mr-2">
                            <form className="form-body form-body--create">
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-inbox"></i>
                                        <label>Información de almacenamiento</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Caja</label>
                                            <input type="text" name="caja" value={newPatente.caja || ''} onChange={handleInputChange} maxLength="70" placeholder="Caja en donde se guarda la carpeta de la patente"/>
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-calendar"></i>
                                        <label>Prioridades</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Prioridades</label>
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
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
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={currentPrioridad.selectedPais}
                                                                onChange={(e) => setCurrentPrioridad({ ...currentPrioridad, selectedPais: e.value })}
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
                                                <input style={{ width: '30%' }} type="date" name="fecha" value={currentPrioridad.fecha || ''} onChange={(e) => setCurrentPrioridad({ ...currentPrioridad, fecha: e.target.value })} />
                                                <input style={{ width: '30%' }} type="text" name="numero" value={currentPrioridad.numero || ''} onChange={(e) => setCurrentPrioridad({ ...currentPrioridad, numero: e.target.value })} maxLength="70" placeholder="Número" />
                                                <button className='rounded-icon-btn' onClick={handleAddPrioridad}>
                                                    <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Prioridades Agregadas ({prioridades.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ maxHeight: '70px' }}>
                                                {prioridades.map((prio, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
                                                            <td className="table-nombre-abogado"><strong>País: </strong>{prio.selectedPais.nombre}</td>
                                                            <td className="table-nombre-abogado"><strong>Fecha: </strong>{prio.fecha}</td>
                                                            <td className="table-nombre-abogado"><strong>Número: </strong>{prio.numero}</td>
                                                        </div>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeletePrioridad(e, prio)}>
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
                                        <i className="pi pi-book"></i>
                                        <label>Publicaciones</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group">
                                            <label>Publicaciones</label>
                                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                <div style={{ width: '40%' }}>
                                                    {
                                                        errorTPu || !tiposPublicaciones ? (
                                                            <div className="dropdown-error">
                                                                <div className="dropdown-error-msg">
                                                                    {isLoadingTPu || (isRefreshing && isValidatingTPu) ?
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
                                                                value={currentPublicacion.selectedTipoPublicacion}
                                                                onChange={(e) => setCurrentPublicacion({ ...currentPublicacion, selectedTipoPublicacion: e.value })}
                                                                options={tiposPublicaciones}
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
                                                <div style={{ width: '40%' }}>
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
                                                                showClear
                                                                style={{ width: '100%' }}
                                                                value={currentPublicacion.selectedGaceta}
                                                                onChange={(e) => setCurrentPublicacion({ ...currentPublicacion, selectedGaceta: e.value })}
                                                                options={gacetas}
                                                                optionLabel="numero"
                                                                placeholder="Selecciona una gaceta"
                                                                filter
                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                valueTemplate={selectedValueTemplateG}
                                                                itemTemplate={optionTemplateG}
                                                            />
                                                        )
                                                    }
                                                </div>
                                                <input style={{ width: '20%' }} type="text" name="pagina" value={currentPublicacion.pagina || ''} onChange={(e) => setCurrentPublicacion({ ...currentPublicacion, pagina: e.target.value })} maxLength="10" placeholder="Página" />
                                                <button className='rounded-icon-btn' onClick={handleAddPublicacion}>
                                                    <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                </button>
                                            </div>
                                        </div>
                                        <table className="table-list">
                                            <thead>
                                                <tr className="table-head">
                                                    <th>Publicaciones Agregadas ({publicaciones.length})</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ maxHeight: '70px' }}>
                                                {publicaciones.map((pub, index) => (
                                                    <tr className="table-row" key={index}>
                                                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
                                                            <td className="table-nombre-abogado"><strong>Tipo: </strong>{pub.selectedTipoPublicacion.nombre}</td>
                                                            <td className="table-nombre-abogado"><strong>Gaceta N°: </strong>{pub.selectedGaceta.numero}</td>
                                                            <td className="table-nombre-abogado"><strong>Página: </strong>{pub.pagina}</td>
                                                        </div>
                                                        <td className="table-delete-button">
                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeletePublicacion(e, pub)}>
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
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-file-edit"></i>
                                        <label>Solicitud de registro</label>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label>Solicitud</label>
                                            <input type="text" name="publicacion" value={newPatente.publicacion || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de solicitud" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de solicitud</label>
                                            <input type="date" name="fechaPublicacion" value={newPatente.fechaPublicacion || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Registro</label>
                                            <input type="text" name="registro" value={newPatente.registro || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de registro" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de registro</label>
                                            <input type="date" name="fechaRegistro" value={newPatente.fechaRegistro || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Certificado</label>
                                            <input type="text" name="certificado" value={newPatente.certificado || ''} onChange={handleInputChange} maxLength="70" placeholder="Certificado" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de vencimiento</label>
                                            <input type="date" name="vencimiento" value={newPatente.vencimiento || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>
                                <section>
                                    <div className="form-group-label">
                                        <i className="pi pi-file-edit"></i>
                                        <label>PCT</label>
                                        <button onClick={(e) => searchPatenteOMPI(e)} disabled={newPatente?.pctPublicacion ? false : true} className="rounded-icon-btn" style={{ minHeight: '16px', height: '16px', color: 'white', minWidth: '70px', padding: '5px', gap: '4px' }}>
                                            <small>Buscar</small>
                                            <i className="pi pi-external-link"></i>
                                        </button>
                                    </div>
                                    <div className="form-body-group">
                                        <div className="form-group form-group-double">
                                            <label>Solicitud</label>
                                            <input type="text" name="pctSolicitud" value={newPatente.pctSolicitud || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de solicitud" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de solicitud</label>
                                            <input type="date" name="fechaPctSolicitud" value={newPatente.fechaPctSolicitud || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Publicación</label>
                                            <input type="text" name="pctPublicacion" value={newPatente.pctPublicacion || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de publicación" />
                                        </div>
                                        <div className="form-group form-group-double">
                                            <label>Fecha de publicación</label>
                                            <input type="date" name="fechaPctPublicacion" value={newPatente.fechaPctPublicacion || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </section>
                            </form>
                        </TabPanel>
                        <TabPanel header="Comentarios" leftIcon="pi pi-comments mr-2">
                            <CommentsC onCommentsChange={handleComentariosCallback} persistedCommentsData={comentariosData} resetStates={resetComments} setResetStates={setResetComments}/>
                        </TabPanel>
                        {/*<TabPanel header="Eventos" leftIcon="pi pi-calendar mr-2">*/}

                        {/*</TabPanel>*/}
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
                        <button style={errorA || errorP || errorTP && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorA || errorP || errorTP} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default PatentesCreate;