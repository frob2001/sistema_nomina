import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { FileUpload } from 'primereact/fileupload';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dialog } from 'primereact/dialog';
import DebounceDropdown from '../../miscComponents/Dropdown/DebounceDropdown';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsMarcaFetched } from '../../../context/marcaSlice'; // EDITABLE

// Comentarios
import CommentsC from '../../miscComponents/Comentarios/CommentsC'
import { useComments } from '../../../services/useComments'; // Para la creación de documentos y correos

// Documentos
import DocumentPickerC from '../../miscComponents/Documents/DocumentPickerC';
import { useFiles } from '../../../services/useFiles'; // Para la creación de documentos y correos

// Logo
import { useLogos } from '../../../services/useLogos'; // Para la creación del logo

// Services
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Marcas`;
import { useMarcas } from '../../../services/useMarcas'; // EDITABLE: MAIN
// -- Para dropdowns
import { useTipoSistemaMarca } from '../../../services/useTipoSistemaMarca';
import { useTipoSignoMarca } from '../../../services/useTipoSignoMarca';
import { useTipoMarca } from '../../../services/useTipoMarca';
import { useAbogados } from '../../../services/useAbogados';
import { usePaises } from '../../../services/usePais';
import { useTipoReferencia } from '../../../services/useTipoReferencia';
import { useGacetas } from '../../../services/useGacetas';
import { useTipoPublicacion } from '../../../services/useTipoPublicacion';
import { useEstados } from '../../../services/useEstados';
import { useClases } from '../../../services/useClases'; 

// Auth
import { useMsal } from '@azure/msal-react';

function MarcasDuplicate({ onClose, onCreated, onDuplicated }) { // EDITABLE

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
    const marcaDuplicateData = useSelector(state => state.marca.MarcaDuplicate); // EDITABLE: guarda los datos de persistencia
    const isMarcaFetched = useSelector(state => state.marca.isMarcaFetched);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null); // GENERAL
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const fileUploadRef = useRef(null);
    const opLogo = useRef(null);
    const opClasesCreate = useRef(null);

    const { createObject } = useMarcas(); // Servicio necesario para crear el objeto
    const { uploadFile } = useFiles(); // Servicio para subir archivos
    const { uploadLogo } = useLogos(); // Servicio para subir el logo
    const { uploadComment } = useComments(); // Servicio para subir comentarios

    const { tiposSistemaMarcas, error: errorTSis, isLoading: isLoadingTSis, isValidating: isValidatingTSis, refresh: refreshTSis } = useTipoSistemaMarca(); // Para el dropdown de tipos de sistema
    const { tiposSignoMarcas, error: errorTSig, isLoading: isLoadingTSig, isValidating: isValidatingTSig, refresh: refreshTSig } = useTipoSignoMarca(); // Para el dropdown de tipo de signo
    const { tiposMarcas, error: errorTM, isLoading: isLoadingTM, isValidating: isValidatingTM, refresh: refreshTM } = useTipoMarca(); // Para el dropdown de tipo de marca
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // Para el dropdown de abogados
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    const { tiposReferencias, error: errorTR, isLoading: isLoadingTR, isValidating: isValidatingTR, refresh: refreshTR } = useTipoReferencia(); // Para el dropdown de tipos de referencias
    const { gacetas, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGacetas(); // Para el dropdown de gacetas
    const { tiposPublicaciones, error: errorTPu, isLoading: isLoadingTPu, isValidating: isValidatingTPu, refresh: refreshTPu } = useTipoPublicacion(); // Para el dropdown de tipos de publicaciones
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados
    const { clases, error: errorC, isLoading: isLoadingC, isValidating: isValidatingC, refresh: refreshC } = useClases(); // Para el dropdown de clases

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false); // Loader para la eliminación o edición
    const [isRefreshing, setIsRefreshing] = useState(false);
    const defaultRequiredFields = {
        selectedTipoSistema: false,
        selectedCliente: false,
        selectedOficinaTramitante: false,
        selectedAbogado: false,
        signo: false,
        selectedTipoSigno: false,
        selectedTipoMarca: false,
        referenciaInterna: false,
        paises: false,
    };   // EDITABLE: solo los campos requeridos

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
    const [solicitantes, setSolicitantes] = useState([]); // mapea los solicitantes que serán añadidos
    const [currentPrioridad, setCurrentPrioridad] = useState({}); // contiene la prioridad que se está creando
    const [prioridades, setPrioridades] = useState([]); // mapea las prioridades que serán añadidas
    const [currentPublicacion, setCurrentPublicacion] = useState({}); // contiene la publicación que se está creando
    const [publicaciones, setPublicaciones] = useState([]); // mapea las publicaciones que serán añadidas
    const [estados, setEstados] = useState([]); // mapea los estados que serán añadidos
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [selectedSolicitante, setSelectedSolicitante] = useState(null);
    const [selectedPais, setSelectedPais] = useState(null);
    const [selectedPaises, setSelectedPaises] = useState([]);
    const [selectedLogoURL, setSelectedLogoURL] = useState(null);
    const [expandLogo, setExpandLogo] = useState(false); // Expandir el dialogo para ver mejor el logo 
    const [currentClase, setCurrentClase] = useState({}); // contiene la clase que está siendo creada
    const [selectedClases, setSelectedClases] = useState([]); // contiene las clases que serán añadidas

    const [selectedMarcaToCopy, setSelectedMarcaToCopy] = useState(null); // Marca que servirá de base para copiar

    // Lógica general
    const [marca, setMarca] = useState({});// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (marcaDuplicateData) {

            // Comentarios
            setComentariosData(marcaDuplicateData.comentariosData || []);

            // Dropdowns
            setContactos(marcaDuplicateData.contactos || []);
            setCurrentReferencia(marcaDuplicateData.currentReferencia || {});
            setReferencias(marcaDuplicateData.referencias || []);
            setSolicitantes(marcaDuplicateData.solicitantes || []);
            setCurrentPrioridad(marcaDuplicateData.currentPrioridad || {});
            setPrioridades(marcaDuplicateData.prioridades || []);
            setCurrentPublicacion(marcaDuplicateData.currentPublicacion || {});
            setPublicaciones(marcaDuplicateData.publicaciones || []);
            setEstados(marcaDuplicateData.estados || []);
            setSelectedEstado(marcaDuplicateData.selectedEstado || null);
            setSelectedSolicitante(marcaDuplicateData.selectedSolicitante || null);
            setSelectedPais(marcaDuplicateData.selectedPais || null);
            setSelectedPaises(marcaDuplicateData.selectedPaises || []);
            setSelectedLogoURL(marcaDuplicateData.selectedLogoURL || null);
            setExpandLogo(marcaDuplicateData.expandLogo || false);
            setCurrentClase(marcaDuplicateData.currentClase || {});
            setSelectedClases(marcaDuplicateData.selectedClases || []);

            // Lógica general
            setMarca(marcaDuplicateData.marca || {});
            setisAnyEmpty(marcaDuplicateData.isAnyEmpty || false);
            setRequiredFields(marcaDuplicateData.requiredFields || defaultRequiredFields);
            setActiveIndex(marcaDuplicateData.activeIndex || 0);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({
            objectName: 'MarcaDuplicate', value:
            {
                comentariosData,
                contactos,
                currentReferencia,
                referencias,
                solicitantes,
                currentPrioridad,
                prioridades,
                currentPublicacion,
                publicaciones,
                estados,
                selectedEstado,
                selectedSolicitante,
                selectedPais,
                marca,
                isAnyEmpty,
                requiredFields,
                activeIndex,
                selectedPaises,
                selectedLogoURL,
                expandLogo,
                currentClase,
                selectedClases,
                selectedMarcaToCopy
            }
        }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
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
        solicitantes,
        currentPrioridad,
        prioridades,
        currentPublicacion,
        publicaciones,
        estados,
        selectedEstado,
        selectedSolicitante,
        selectedPais,
        marca,
        isAnyEmpty,
        requiredFields,
        activeIndex,
        selectedPaises,
        selectedLogoURL,
        expandLogo,
        currentClase,
        selectedClases,
        selectedMarcaToCopy]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'MarcaDuplicate' }));
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
        fetchContactosData(marca.selectedCliente);
    }, [marca.selectedCliente]) // Busca los contactos de acuerdo con el cliente elegido !!! REVISAR: Cuando se cambia de cliente debe borrar los contactos pero eso da un problema con la persistencia
    useEffect(() => {

        const contactosIds = contactos?.map(contacto => contacto.contactoId);

        setMarca(prevMarca => ({
            ...prevMarca,
            contactosIds: contactosIds
        }));
    }, [contactos]); // Guarda los ids de los contactos elegidos en la propiedad de la marca

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
        setMarca(prevMarca => ({
            ...prevMarca,
            referencias: newReferencias
        }));
    }, [referencias]); // Guarda las referencias en la propiedad de la marca

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
        setMarca(prevMarca => ({
            ...prevMarca,
            solicitantesIds: solicitantesIds
        }));
    }, [solicitantes]); // Guarda los ids de los solicitantes elegidos en la propiedad de la marca

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

        if (!prioridades.some(prio => (prio.numero === numero) && (prio.fecha === fecha) && (prio.codigoPais === selectedPais.codigoPais))) {
            const currentPrioridadTreated = {
                codigoPais: selectedPais.codigoPais,
                numero: numero,
                fecha: fecha,
            }
            setPrioridades([...prioridades, currentPrioridadTreated]);
            setCurrentPrioridad({});
        }
    }; // Agrega una prioridad a la lista
    const handleDeletePrioridad = (e, object) => {
        e.preventDefault();
        const updatedPrioridades = prioridades.filter((item) => item !== object);
        setPrioridades(updatedPrioridades);
    }; // Quita una referencia de la lista
    useEffect(() => {
        const newPrioridades = prioridades?.map(prio => ({
            codigoPais: prio.codigoPais,
            numero: prio.numero,
            fecha: prio.fecha
        }));
        setMarca(prevMarca => ({
            ...prevMarca,
            prioridadMarca: newPrioridades
        }));
    }, [prioridades]); // Guarda las prioridades en la propiedad de la marca

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

        if (!publicaciones.some(pub => (pub.tipoPublicacionId === selectedTipoPublicacion.tipoPublicacionId) && (pub.pagina === pagina) && (pub.numeroGaceta === selectedGaceta.numero))) {
            const currentPublicacionTreated = {
                tipoPublicacionId: selectedTipoPublicacion.tipoPublicacionId,
                numeroGaceta: selectedGaceta.numero,
                pagina: pagina,
            }
            setPublicaciones([...publicaciones, currentPublicacionTreated]);
            setCurrentPublicacion({});
        }
    }; // Agrega una publicación a la lista
    const handleDeletePublicacion = (e, object) => {
        e.preventDefault();
        const updatedPublicaciones = publicaciones.filter((item) => item !== object);
        setPublicaciones(updatedPublicaciones);
    }; // Quita una publicación de la lista
    useEffect(() => {
        const newPublicaciones = publicaciones?.map(pub => ({
            tipoPublicacionId: pub.tipoPublicacionId,
            numeroGaceta: pub.numeroGaceta,
            pagina: pub.pagina
        }));
        setMarca(prevMarca => ({
            ...prevMarca,
            publicaciones: newPublicaciones
        }));
    }, [publicaciones]); // Guarda las publicaciones en la propiedad de la marca

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
        setMarca(prevMarca => ({
            ...prevMarca,
            estadosIds: estadosIds
        }));
    }, [estados]); // Guarda los ids de los estados elegidos en la propiedad de la marca

    // Paises 
    const handleAddPais = (e) => {
        e.preventDefault();
        if (selectedPais && !selectedPaises.some(pais => pais.codigoPais === selectedPais.codigoPais)) {
            setSelectedPaises([...selectedPaises, selectedPais]);
            setSelectedPais(null);
        }
    }; // Agrega un país a la lista
    const handleDeletePais = (e, object) => {
        e.preventDefault();
        const updatedPaises = selectedPaises.filter((item) => item !== object);
        setSelectedPaises(updatedPaises);
    }; // Quita un país de la lista
    useEffect(() => {
        const paisesIds = selectedPaises.map(pais => ({ codigoPais: pais.codigoPais }));
        setMarca(prevMarca => ({
            ...prevMarca,
            paises: paisesIds
        }));
    }, [selectedPaises]); // Guarda los ids de los paises elegidos en la propiedad de la marca

    // Clases
    const handleAddClase = (e) => {
        e.preventDefault();
        const { selectedClase, coberturaEspanol, coberturaIngles } = currentClase;

        if (!selectedClase || !coberturaEspanol || !coberturaIngles || coberturaEspanol?.trim() === '' || coberturaIngles?.trim() === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir una clase, todos los campos deben estar completos', // EDITABLE
                life: 3000,
            });
            return; // Exit the function if the condition is not met
        }

        if (!selectedClases.some(clase => (clase.codigoClase === selectedClase.codigo))) {
            const currentClaseTreated = {
                codigoClase: selectedClase.codigo,
                coberturaEspanol: coberturaEspanol,
                coberturaIngles: coberturaIngles,
            }
            setSelectedClases([...selectedClases, currentClaseTreated]);
            setCurrentClase({});
            opClasesCreate.current.toggle(false);
        }
    }; // Agrega una clase a la lista
    const handleDeleteClase = (e, object) => {
        e.preventDefault();
        const updatedClases = selectedClases.filter((item) => item !== object);
        setSelectedClases(updatedClases);
    }; // Quita una clase de la lista
    useEffect(() => {
        setMarca(prevMarca => ({
            ...prevMarca,
            clases: selectedClases
        }));
    }, [selectedClases]); // Guarda las clases en la propiedad de la marca
    useEffect(() => {
        if (currentClase.selectedClase) {
            setCurrentClase({
                ...currentClase,
                coberturaEspanol: currentClase.selectedClase.descripcionEspanol,
                coberturaIngles: currentClase.selectedClase.descripcionIngles,
            })
        }
    }, [currentClase.selectedClase]) // Coloca las descripciones de la clase en las coberturas

    // ------------------ Dropdowns normales ---------------------------------------

    const refreshData = (e) => {
        e.preventDefault();
        setIsRefreshing(true);
        refreshTSis(); // Tipos sistemas
        refreshTSig(); // Tipos signos
        refreshTM(); // Tipo marcas
        refreshP(); // Países
        refreshA(); // Abogados
        refreshTR(); // Tipos de referencias
        refreshG(); // Gacetas
        refreshTPu(); // Tipos de publicación
        refreshE(); // Estados
        refreshC(); // Clases
    }; // Refresca los datos del los dropdowns: GENERAL

    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingTSis, isValidatingTSig, isValidatingTM, isValidatingP, isValidatingA, isValidatingTR, isValidatingG, isValidatingTPu, isValidatingE, isValidatingC]); // Cambia el estado de refreshing: GENERAL

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
                <span><strong>Clase N° {option.codigo}</strong> {`${option.descripcionEspanol?.substring(0, 60)}...`} </span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown

    const selectedValueTemplateC = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span><strong>Clase N° {option.codigo}</strong> {`${option.descripcionEspanol?.substring(0, 60)}...`}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown

    // ------------------ FIN DROPDOWNS ---------------------------------------

    // ------------------ DOCUMENTOS ---------------------------------------
    useEffect(() => {

        const requiredEmpty = Object.keys(defaultRequiredFields).some(key => {
            return isEmptyValue(marca[key]);
        });

        setIsRequiredEmpty(requiredEmpty);
    }, [marca]); // Habilita o deshabilita la pestaña de documentos si falta un campo requerido: ESPECÍFICO

    // ------------------ FIN DOCUMENTOS ---------------------------------------

    const updateSelectedObject = (selectedObject, value) => {
        setMarca(prev => ({ ...prev, [selectedObject]: value })); // Editar
    }; // Maneja el cambio para un dropdown

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setMarca(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
    }; // Maneja el cambio para un tag de input

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

    const validateRequiredFields = (object) => {
        const updatedRequiredFields = { ...defaultRequiredFields };
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(object[key]);
        });
        setRequiredFields(updatedRequiredFields);
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    const handleCreate = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(marca);

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
        // Intentar el request usando el servicio  PENDIENTE!!!!
        try {
            setIsLoading2(true);
            const finalMarca = {
                "tipoSistemaMarcaId": marca.selectedTipoSistema.tipoSistemaMarcaId,
                "clienteId": marca.selectedCliente.clienteId,
                "contactosIds": marca.contactosIds ? marca.contactosIds : marca.contactos.map(contacto => contacto.contactoId),
                "oficinaTramitanteId": marca.selectedOficinaTramitante.clienteId,
                "abogadoId": marca.selectedAbogado.abogadoId,
                "abogadoInternacional": marca.abogadoInternacional,
                "paises": marca.paises.map(pais => pais.codigoPais),
                "signo": marca.signo,
                "tipoSignoMarcaId": marca.selectedTipoSigno.tipoSignoMarcaId,
                "tipoMarcaId": marca.selectedTipoMarca.tipoMarcaId,
                "clases": marca.clases,
                "solicitantesIds": marca.solicitantesIds ? marca.solicitantesIds : marca.solicitantes.map(sol => sol.propietarioId),
                "referenciaInterna": marca.referenciaInterna,
                "referencias": marca.referencias.map(ref => ({
                    tipoReferenciaId: ref.tipoReferenciaId,
                    referencia: ref.referencia
                })),
                "estados": marca.estadosIds ? marca.estadosIds : marca.estados.map(est => est.codigo),
                "primerUso": marca.primerUso,
                "pruebaUso": marca.pruebaUso,
                "caja": marca.caja,
                "comparacion": marca.comparacion,
                "solicitud": marca.solicitud,
                "fechaSolicitud": marca.fechaSolicitud,
                "registro": marca.registro,
                "fechaRegistro": marca.fechaRegistro,
                "certificado": marca.certificado,
                "fechaCertificado": marca.fechaCertificado,
                "vencimiento": marca.vencimiento,
                "tieneFigura": selectedLogoURL ? true : false,
                "prioridadMarca": marca.prioridadMarca.map(prio => ({
                    codigoPais: prio.codigoPais,
                    numero: prio.numero,
                    fecha: prio.fecha,
                })),
                "publicaciones": marca.publicaciones.map(pub => ({
                    tipoPublicacionId: pub.tipoPublicacionId,
                    numeroGaceta: pub.numeroGaceta,
                    pagina: pub.pagina,
                }))
            }

            const response = await createObject(finalMarca);
            status = response.status;
            data = response.data;

            if (status === 201) {
                deletePersistedStates();
                onDuplicated(data.marcaId);
                onClose();
            } else {
                throw new Error(`Error en la creación: código de estado ${status}`);
            }

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al crear la marca', // EDITABLE
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
            try {
                if (status === 201 && data?.marcaId) {
                    documentos.forEach(async documento => {
                        try {
                            await uploadFile(documento, data.marcaId, "marca", "documento");
                        } catch (uploadError) {
                            // Handle errors for document uploads here
                            console.error(uploadError);
                            // Optionally show a toast or perform other error handling
                        }
                    });

                    correos.forEach(async correo => {
                        try {
                            await uploadFile(correo, data.marcaId, "marca", "correo");
                        } catch (uploadError) {
                            // Handle errors for correo uploads here
                            console.error(uploadError);
                            // Optionally show a toast or perform other error handling
                        }
                    });

                    if (comentariosData.commentsToUpload && comentariosData.commentsToUpload.length > 0) {
                        comentariosData.commentsToUpload.forEach(async comment => {
                            try {
                                await uploadComment(comment, data.marcaId, "marca");
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

                    if (selectedLogoURL) {
                        try {
                            await uploadLogo(selectedLogoURL, data.marcaId);
                        } catch (uploadError) {
                            // Handle errors for document uploads here
                            console.error(uploadError);
                            // Optionally show a toast or perform other error handling
                        } finally {
                            setSelectedLogoURL(null);
                        }
                    }
                }
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un error al subir los documentos', // EDITABLE
                    life: 3000,
                });
            } finally {
                
            }
        }
    }; // Maneja la edición del objeto: ESPECIFICO (Hay que tener ciudado con el ID)

    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates(); // Limpia la data de este componente
        onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL


    /* ------------------------ Lógica para la carga del logo -------------------------------- */

    const onTemplateError = (e) => {
        // Check if the error is due to file size
        if (e.files[0].size > 2097152) { // 2MB in bytes
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'El archivo es demasiado grande. El tamaño máximo es de 2MB.' });
        } else {
            // Handle other errors
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Ha ocurrido un error al cargar el archivo.' });
        }
    }

    const onTemplateSelect = (e) => {
        // Original files list
        const originalFiles = e.files;

        // Filter out any 'files' that are actually folders (they have an empty 'type')
        const validFiles = originalFiles.filter(file => file.type !== "");

        // Check if any folders were filtered out
        if (validFiles.length !== originalFiles.length) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pueden cargar carpetas' });
        }

        // Update the file list in the FileUpload component
        if (fileUploadRef && fileUploadRef.current) {
            fileUploadRef.current.setFiles(validFiles);
        }

        if (validFiles[0]) {
            setSelectedLogoURL(validFiles[0].objectURL);
        }
    };

    const onTemplateClear = () => {
        setSelectedLogoURL(null);
    };

    const headerTemplate = (options) => {
        const { className, chooseButton, cancelButton, uploadButton } = options;

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                {cancelButton}
            </div>
        );
    };

    const onTemplateRemove = (file, callback) => {
        setSelectedLogoURL(null);
        callback();
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="logo-picker-container">
                <span className="file-name">
                    {file.name}
                </span>
                <button className="rounded-icon-btn" onClick={() => onTemplateRemove(file, props.onRemove)} >
                    <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                </button>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <span className="dragndrop-msg">
                    Arrastra y suelta la imagen aquí
                </span>
            </div>
        );
    };

    const chooseOptions = { icon: 'pi pi-folder-open', iconOnly: true, className: 'custom-choose-btn select-doc-btn' };
    const cancelOptions = { icon: 'pi pi-times', iconOnly: true, className: 'custom-cancel-btn delete-doc-btn' };

    // -----------------------------------------------------------------------------------------------

    const fetchMarcaData = async (marca) => {
        try {
            setIsLoading(true);

            const url = `${apiEndpoint}/Marcas/${marca.marcaId}`;
            const accessToken = await getAccessToken();
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un error al contactar con el servidor',
                    life: 3000,
                });
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }

            const fetchedData = await res.json();
            if (fetchedData) {
                return fetchedData;
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un error al recuperar la marca',
                    life: 3000,
                });
                throw new Error("Hubo un problema con el servidor, intenta de nuevo");
            }
        } catch (error) {
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!isMarcaFetched && selectedMarcaToCopy) {
                const marcaFetched = await fetchMarcaData(selectedMarcaToCopy);
                if (marcaFetched) {
                    setMarca({
                        ...marcaFetched,
                        selectedTipoSistema: marcaFetched.tipoSistemaMarca,
                        selectedCliente: marcaFetched.cliente,
                        selectedOficinaTramitante: marcaFetched.oficinaTramitante,
                        selectedAbogado: abogados?.find(abogado => abogado.abogadoId === marcaFetched.abogado.abogadoId),
                        selectedTipoSigno: marcaFetched.tipoSignoMarca,
                        selectedTipoMarca: marcaFetched.tipoMarca,
                    }); // EDITABLE

                    // Dropdowns
                    setContactos(marcaFetched.contactos);
                    setCurrentReferencia({});
                    setReferencias(marcaFetched.referencias);
                    setSolicitantes(marcaFetched.solicitantes);
                    setCurrentPrioridad({});
                    setPrioridades(marcaFetched.prioridadMarca);
                    setCurrentPublicacion({});
                    setPublicaciones(marcaFetched.publicaciones);
                    setEstados(marcaFetched.estados);
                    setSelectedEstado(null);
                    setSelectedSolicitante(null);
                    setSelectedPais(null);
                    setSelectedPaises(marcaFetched.paises);
                    setSelectedLogoURL(null);
                    setExpandLogo(false);
                    setCurrentClase({});
                    setSelectedClases(marcaFetched.clases);

                    dispatch(setIsMarcaFetched(true));
                } else {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Hubo un error al recuperar la marca',
                        life: 3000,
                    });
                }
            }
        };

        fetchData();
    }, [selectedMarcaToCopy]);


    return (
        <>
            <Draggable cancel="input, button, textarea, table" bounds="parent">
                <div className={`form-container wider-form ${!isMarcaFetched && 'smaller-form'}`}>
                    {(isLoading || isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <>
                        <section className="form-header">
                            <span>Crear nueva marca {isMarcaFetched && `basada en: ${marca?.marcaId || ''} - ${marca?.signo || ''}`}</span>
                            <div className="form-header-buttons">
                                <Button className="form-header-btn" onClick={handleCancel}>
                                    <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                </Button>
                            </div>
                        </section>


                        {
                            isMarcaFetched ? 
                                
                                <>
                                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} scrollable>
                                        <TabPanel header="Marca" leftIcon="pi pi-verified mr-2">
                                            <div className="form-body form-body--create">
                                                <section>
                                                    <div className="form-group-label">
                                                        <i className="pi pi-info-circle"></i>
                                                        <label>Información de la marca</label>
                                                    </div>
                                                    <div className="form-body-group">
                                                        <div className="form-group form-group-single">
                                                            <label>Figura</label>
                                                            <div className="logo-form-container">
                                                                {
                                                                    selectedLogoURL &&
                                                                    <img alt="logo" src={selectedLogoURL} onClick={() => setExpandLogo(true)} />
                                                                }
                                                                <div className="logo-btns">
                                                                    <button className="form-accept-btn logo-btn" onClick={(e) => opLogo.current.toggle(e)}>
                                                                        <i className="pi pi-image"></i>
                                                                        <span>Agregar</span>
                                                                    </button>
                                                                    {
                                                                        selectedLogoURL &&
                                                                        <button style={{ width: '85px' }} className="form-delete-btn logo-btn" onClick={(e) => setSelectedLogoURL(null)}>
                                                                            <i className="pi pi-times-circle"></i>
                                                                            <span>Remover</span>
                                                                        </button>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Tipo de sistema <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                            <div>
                                                                {
                                                                    errorTSis || !tiposSistemaMarcas ? (
                                                                        <div className="dropdown-error">
                                                                            <div className="dropdown-error-msg">
                                                                                {isLoadingTSis || (isRefreshing && isValidatingTSis) ?
                                                                                    <div className="small-spinner" /> :
                                                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                            </div>
                                                                            <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <Dropdown
                                                                            className={`${requiredFields.selectedTipoSistema && 'form-group-empty'}`}
                                                                            style={{ width: '100%' }}
                                                                            value={marca?.selectedTipoSistema}
                                                                            onChange={(e) => updateSelectedObject('selectedTipoSistema', e.value)}
                                                                            options={tiposSistemaMarcas}
                                                                            optionLabel="nombre"
                                                                            placeholder="Selecciona un tipo de sistema"
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
                                                            <label>Tipo de marca <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                            <div>
                                                                {
                                                                    errorTM || !tiposMarcas ? (
                                                                        <div className="dropdown-error">
                                                                            <div className="dropdown-error-msg">
                                                                                {isLoadingTM || (isRefreshing && isValidatingTM) ?
                                                                                    <div className="small-spinner" /> :
                                                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                            </div>
                                                                            <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <Dropdown
                                                                            className={`${requiredFields.selectedTipoMarca && 'form-group-empty'}`}
                                                                            style={{ width: '100%' }}
                                                                            value={marca?.selectedTipoMarca}
                                                                            onChange={(e) => updateSelectedObject('selectedTipoMarca', e.value)}
                                                                            options={tiposMarcas}
                                                                            optionLabel="nombre"
                                                                            placeholder="Selecciona un tipo de marca"
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
                                                            <input className={`${requiredFields.referenciaInterna && 'form-group-empty'}`} type="text" name="referenciaInterna" value={marca?.referenciaInterna || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia interna" />
                                                        </div>
                                                        <div className="form-group form-group-single">
                                                            <label>Paises de la marca <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                                <div style={{ width: '100%' }}>
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
                                                                                className={`${requiredFields.paises && 'form-group-empty'}`}
                                                                                showClear
                                                                                style={{ width: '100%', maxWidth: '588px' }}
                                                                                value={selectedPais}
                                                                                onChange={(e) => setSelectedPais(e.value)}
                                                                                options={paises}
                                                                                optionLabel="nombre"
                                                                                placeholder="Selecciona un país"
                                                                                filter
                                                                                filterBy="codigoPais,nombre"
                                                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                                                valueTemplate={selectedValueTemplate}
                                                                                itemTemplate={optionTemplate}
                                                                            />
                                                                        )
                                                                    }
                                                                </div>
                                                                <button className='rounded-icon-btn' onClick={handleAddPais}>
                                                                    <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <table className="table-list">
                                                            <thead>
                                                                <tr className="table-head">
                                                                    <th>Paises agregados ({selectedPaises?.length})</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody style={{ maxHeight: selectedLogoURL ? '55px' : '70px' }}>
                                                                {selectedPaises?.map((pais, index) => (
                                                                    <tr className="table-row" key={index}>
                                                                        <td className="table-nombre-abogado"><strong>{pais.codigoPais} - </strong>{pais.nombre}</td>
                                                                        <td className="table-delete-button">
                                                                            <button  className="rounded-icon-btn" onClick={(e) => handleDeletePais(e, pais)}>
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
                                                                    <th>Referencias Agregadas ({referencias?.length})</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody style={{ maxHeight: selectedLogoURL ? '55px' : '70px' }}>
                                                                {referencias?.map((ref, index) => (
                                                                    <tr className="table-row" key={index}>
                                                                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '50% 50%' }}>
                                                                            <td className="table-nombre-abogado"><strong>Tipo: </strong>{ref.tipoReferencia}</td>
                                                                            <td className="table-nombre-abogado"><strong>Referencia: </strong>{ref.referencia}</td>
                                                                        </div>
                                                                        <td className="table-delete-button">
                                                                            <button  className="rounded-icon-btn" onClick={(e) => handleDeleteReferencia(e, ref)}>
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
                                                            <DebounceDropdown className={`${requiredFields.selectedCliente && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedCliente', value)} selectedObject={marca.selectedCliente} filterBy="clienteId,nombre" />
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
                                                                                <button style={{color: 'white', minHeight: '24px', height:'24px', minWidth:'24px', width: '24px'}} className="rounded-icon-btn" onClick={(event) => fetchContactosData(marca.selectedCliente, event)}>
                                                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                                </button>
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
                                                                    <th>Contactos Agregados ({contactos?.length})</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {contactos?.map((contacto, index) => (
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
                                                        <div className="form-group" style={{ minWidth: 'calc(100% - 20px)' }}>
                                                            <label>Oficina Tramitante <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                            <DebounceDropdown className={`${requiredFields.selectedOficinaTramitante && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedOficinaTramitante', value)} selectedObject={marca.selectedOficinaTramitante} filterBy="clienteId,nombre" />
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
                                                                            value={marca.selectedAbogado}
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
                                                            <input type="text" name="abogadoInternacional" value={marca?.abogadoInternacional || ''} onChange={handleInputChange} maxLength="70" placeholder="Nombre completo del responsable" />
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>
                                        </TabPanel>
                                        <TabPanel header="Solicitud" leftIcon="pi pi-users mr-2">
                                            <div className="form-body form-body--create">
                                                <section>
                                                    <div className="form-group-label">
                                                        <i className="pi pi-tags"></i>
                                                        <label>Identificación de la Marca</label>
                                                    </div>
                                                    <div className="form-body-group">
                                                        <div className="form-group">
                                                            <label>Signo <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                            <input  className={`${requiredFields.signo && 'form-group-empty'}`} type="text" name="signo" value={marca?.signo || ''} onChange={handleInputChange} maxLength="70" placeholder="Denominación" />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Tipo de signo <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                            <div>
                                                                {
                                                                    errorTSig || !tiposSignoMarcas ? (
                                                                        <div className="dropdown-error">
                                                                            <div className="dropdown-error-msg">
                                                                                {isLoadingTSig || (isRefreshing && isValidatingTSig) ?
                                                                                    <div className="small-spinner" /> :
                                                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                            </div>
                                                                            <Button className="rounded-icon-btn" onClick={refreshData}>
                                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <Dropdown
                                                                            className={`${requiredFields.selectedTipoSigno && 'form-group-empty'}`}
                                                                            style={{ width: '100%' }}
                                                                            value={marca.selectedTipoSigno}
                                                                            onChange={(e) => updateSelectedObject('selectedTipoSigno', e.value)}
                                                                            options={tiposSignoMarcas}
                                                                            optionLabel="nombre"
                                                                            placeholder="Selecciona un tipo de signo"
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
                                                        <i className="pi pi-briefcase"></i>
                                                        <label>Solicitantes</label>
                                                    </div>
                                                    <div className="form-body-group">
                                                        <div className="form-group form-group-single">
                                                            <label>Propietarios</label>
                                                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                                <div style={{ width: '100%' }}>
                                                                    <DebounceDropdown  endpoint='Propietarios' optionLabel='nombre' showClear={true} setter={setSelectedSolicitante} selectedObject={selectedSolicitante} filterBy="propietarioId,nombre" />
                                                                </div>
                                                                <button  className='rounded-icon-btn' onClick={handleAddSolicitante}>
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
                                                            <tbody style={{ maxHeight: '60px' }}>
                                                                {solicitantes?.map((sol, index) => (
                                                                    <tr className="table-row" key={index}>
                                                                        <td className="table-nombre-abogado"><strong>{sol.propietarioId} - </strong>{sol.nombre}</td>
                                                                        <td className="table-delete-button">
                                                                            <button  className="rounded-icon-btn" onClick={(e) => handleDeleteSolicitante(e, sol)}>
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
                                                        <i className="pi pi-th-large"></i>
                                                        <label>Clases</label>
                                                    </div>
                                                    <div className="form-body-group">
                                                        <button  className="form-accept-btn logo-btn" onClick={(e) => opClasesCreate.current.toggle(e)}>
                                                            <i className="pi pi-th-large"></i>
                                                            <span>Agregar</span>
                                                        </button>
                                                        <table className="table-list">
                                                            <thead>
                                                                <tr className="table-head">
                                                                    <th>Clases Agregadas ({selectedClases?.length})</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody style={{ maxHeight: '135px' }}>
                                                                {selectedClases?.map((clase, index) => (
                                                                    <tr className="table-row" key={index}>
                                                                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '6% 47% 47%' }}>
                                                                            <td style={{ display: 'flex', alignItems: 'start', fontSize: '12px', justifyContent: 'center' }} className="table-nombre-abogado"><strong>{clase.codigoClase}</strong></td>
                                                                            <td className="table-nombre-abogado">{clase.coberturaEspanol}</td>
                                                                            <td className="table-nombre-abogado">{clase.coberturaIngles}</td>
                                                                        </div>
                                                                        <td className="table-delete-button">
                                                                            <button  className="rounded-icon-btn" onClick={(e) => handleDeleteClase(e, clase)}>
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
                                        <TabPanel header="Extra" leftIcon="pi pi-plus-circle mr-2">
                                            <div className="form-body form-body--create">
                                                <section>
                                                    <div className="form-group-label">
                                                        <i className="pi pi-calendar"></i>
                                                        <label>Actividad de la Marca</label>
                                                    </div>
                                                    <div className="form-body-group">
                                                        <div className="form-group">
                                                            <label>Fecha de primer uso</label>
                                                            <input  type="date" name="primerUso" value={marca?.primerUso ? marca.primerUso.split('T')[0] : ''} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Fecha de prueba de uso</label>
                                                            <input  type="date" name="pruebaUso" value={marca?.pruebaUso ? marca.pruebaUso.split('T')[0] : ''} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="form-group center-switch">
                                                            <label>Comparación</label>
                                                            <label className="switch">
                                                                <input   type="checkbox" name="comparacion" checked={marca?.comparacion} onChange={handleInputChange} />
                                                                <span className="slider round"></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </section>
                                                <section>
                                                    <div className="form-group-label">
                                                        <i className="pi pi-inbox"></i>
                                                        <label>Información de almacenamiento</label>
                                                    </div>
                                                    <div className="form-body-group">
                                                        <div className="form-group">
                                                            <label>Caja</label>
                                                            <input  type="text" name="caja" value={marca?.caja || ''} onChange={handleInputChange} maxLength="70" placeholder="Caja en donde se guarda la carpeta de la marca" />
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
                                                                <input  style={{ width: '30%' }} type="date" name="fecha" value={currentPrioridad.fecha || ''} onChange={(e) => setCurrentPrioridad({ ...currentPrioridad, fecha: e.target.value })} />
                                                                <input  style={{ width: '30%' }} type="text" name="numero" value={currentPrioridad.numero || ''} onChange={(e) => setCurrentPrioridad({ ...currentPrioridad, numero: e.target.value })} maxLength="70" placeholder="Número" />
                                                                <button  className='rounded-icon-btn' onClick={handleAddPrioridad}>
                                                                    <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <table className="table-list">
                                                            <thead>
                                                                <tr className="table-head">
                                                                    <th>Prioridades Agregadas ({prioridades?.length})</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody style={{ maxHeight: '50px' }}>
                                                                {prioridades?.map((prio, index) => (
                                                                    <tr className="table-row" key={index}>
                                                                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
                                                                            <td className="table-nombre-abogado"><strong>País: </strong>{paises && paises?.find(pais => pais.codigoPais === prio.codigoPais).nombre}</td>
                                                                            <td className="table-nombre-abogado"><strong>Fecha: </strong>{prio.fecha.split('T')[0]}</td>
                                                                            <td className="table-nombre-abogado"><strong>Número: </strong>{prio.numero}</td>
                                                                        </div>
                                                                        <td className="table-delete-button">
                                                                            <button  className="rounded-icon-btn" onClick={(e) => handleDeletePrioridad(e, prio)}>
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
                                                                <input  style={{ width: '20%' }} type="text" name="pagina" value={currentPublicacion.pagina || ''} onChange={(e) => setCurrentPublicacion({ ...currentPublicacion, pagina: e.target.value })} maxLength="10" placeholder="Página" />
                                                                <button  className='rounded-icon-btn' onClick={handleAddPublicacion}>
                                                                    <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <table className="table-list">
                                                            <thead>
                                                                <tr className="table-head">
                                                                    <th>Publicaciones Agregadas ({publicaciones?.length})</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody style={{ maxHeight: '50px' }}>
                                                                {publicaciones?.map((pub, index) => (
                                                                    <tr className="table-row" key={index}>
                                                                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
                                                                            <td className="table-nombre-abogado"><strong>Tipo: </strong>{tiposPublicaciones && tiposPublicaciones?.find(tp => tp.tipoPublicacionId === pub.tipoPublicacionId).nombre}</td>
                                                                            <td className="table-nombre-abogado"><strong>Gaceta N°: </strong>{pub.numeroGaceta}</td>
                                                                            <td className="table-nombre-abogado"><strong>Página: </strong>{pub.pagina}</td>
                                                                        </div>
                                                                        <td className="table-delete-button">
                                                                            <button  className="rounded-icon-btn" onClick={(e) => handleDeletePublicacion(e, pub)}>
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
                                                                <button  className='rounded-icon-btn' onClick={handleAddEstado}>
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
                                                            <tbody style={{ maxHeight: '75px' }}>
                                                                {estados?.map((est, index) => (
                                                                    <tr className="table-row" key={index}>
                                                                        <td className="table-nombre-abogado" style={{ color: est.color }}><strong>{est.codigo} - </strong>{est.descripcionEspanol}/{est.descripcionIngles}</td>
                                                                        <td className="table-delete-button">
                                                                            <button  className="rounded-icon-btn" onClick={(e) => handleDeleteEstado(e, est)}>
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
                                                            <input  type="text" name="solicitud" value={marca?.solicitud || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de solicitud" />
                                                        </div>
                                                        <div className="form-group form-group-double">
                                                            <label>Fecha de solicitud</label>
                                                            <input  type="date" name="fechaSolicitud" value={marca?.fechaSolicitud ? marca.fechaSolicitud.split('T')[0] : ''}  onChange={handleInputChange} />
                                                        </div>
                                                        <div className="form-group form-group-double">
                                                            <label>Registro</label>
                                                            <input  type="text" name="registro" value={marca?.registro || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de registro" />
                                                        </div>
                                                        <div className="form-group form-group-double">
                                                            <label>Fecha de concesión</label>
                                                            <input  type="date" name="fechaRegistro" value={marca?.fechaRegistro ? marca.fechaRegistro.split('T')[0] : ''} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="form-group form-group-double">
                                                            <label>Fecha de emisión de certificado</label>
                                                            <input  type="date" name="fechaCertificado" value={marca.fechaCertificado ? marca.fechaCertificado.split('T')[0] : ''} onChange={handleInputChange} />
                                                        </div>
                                                        <div className="form-group form-group-double">
                                                            <label>Fecha de vencimiento</label>
                                                            <input  type="date" name="vencimiento" value={marca.vencimiento ? marca.vencimiento.split('T')[0] : ''}  onChange={handleInputChange} />
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>
                                        </TabPanel>
                                        <TabPanel header="Comentarios" leftIcon="pi pi-comments mr-2">
                                            <CommentsC onCommentsChange={handleComentariosCallback} persistedCommentsData={comentariosData} resetStates={resetComments} setResetStates={setResetComments} />
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
                                        <button style={errorTSis || errorA || errorTSig || errorTM && { backgroundColor: 'var(--even-darker-gray)' }} disabled={errorTSis || errorA || errorTSig || errorTM} type="submit" className="form-accept-btn" onClick={handleCreate}>Crear</button>
                                    </section>
                                </>
                                : 

                                <div className="duplication-screen-container">
                                    <h4>Asistente de duplicación</h4>
                                    <p>Por favor, selecciona una marca. Esta servirá como base para la nueva marca que estás por crear. Se cargarán los datos de la marca seleccionada, a excepción de su logo, comentarios y documentos.</p>
                                    <div className="form-group form-group-double">
                                        <label>Marca a duplicar</label>
                                        <DebounceDropdown endpoint='Marcas' optionLabel='signo' showClear={false} setter={setSelectedMarcaToCopy} selectedObject={selectedMarcaToCopy} filterBy="marcaId,signo" />
                                    </div>
                                </div>
                                
                        }
                    </>
                </div>
            </Draggable>
            <Toast ref={toast} />
            <ConfirmPopup />
            <OverlayPanel ref={opLogo} showCloseIcon className="overlay-logos">
                <div className="logo-upload-overlay-container">
                    <FileUpload ref={fileUploadRef} accept="image/*" maxFileSize={2097152}
                        onError={onTemplateError} onSelect={onTemplateSelect} onClear={onTemplateClear}
                        headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate}
                        chooseOptions={chooseOptions} cancelOptions={cancelOptions}
                        invalidFileSizeMessageSummary="Tamaño de imagen inválido"
                        invalidFileSizeMessageDetail="La imagen es demasiado grande. El tamaño máximo es de 2MB" />
                </div>
            </OverlayPanel>
            <Dialog visible={expandLogo} style={{ width: '50vw' }} draggable={false} onHide={() => setExpandLogo(false)} >
                <div className="logo-dialog-container">
                    <img alt="logo" src={selectedLogoURL} />
                </div>
            </Dialog>
            <OverlayPanel ref={opClasesCreate} showCloseIcon className="overlay-logos">
                <div className="form-group overlay-form">
                    <label>Clases</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                            <div style={{ width: '100%' }}>
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
                                            showClear
                                            style={{ width: '100%' }}
                                            value={currentClase.selectedClase}
                                            onChange={(e) => setCurrentClase({ ...currentClase, selectedClase: e.value })}
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
                            <button className='rounded-icon-btn' onClick={handleAddClase}>
                                <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                                <label>Cobertura en español</label>
                                <textarea placeholder="Cobertura en español" style={{ width: '100%', maxHeight: '140px', height: '140px' }} type="text" name="coberturaEspanol" value={currentClase.coberturaEspanol || ''} onChange={(e) => setCurrentClase({ ...currentClase, coberturaEspanol: e.target.value })} maxLength={1000} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                                <label>Cobertura en inglés</label>
                                <textarea placeholder="Cobertura en inglés" style={{ width: '100%', maxHeight: '140px', height: '140px' }} type="text" name="coberturaIngles" value={currentClase.coberturaIngles || ''} onChange={(e) => setCurrentClase({ ...currentClase, coberturaIngles: e.target.value })} maxLength={1000} />
                            </div>
                        </div>
                    </div>
                </div>
            </OverlayPanel>
        </>
    );
}

export default MarcasDuplicate;