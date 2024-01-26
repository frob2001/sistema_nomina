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
import { saveData, deleteData, setIsEditing } from '../../../context/patenteSlice'; // EDITABLE
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
const API_BASE_URL = `${apiEndpoint}/Patentes`;
import { usePatentes } from '../../../services/usePatentes'; // EDITABLE: MAIN
import { useTipoPatente } from '../../../services/useTipoPatente';
import { useAbogados } from '../../../services/useAbogados';
import { usePaises } from '../../../services/usePais';
import { useTipoReferencia } from '../../../services/useTipoReferencia';
import { useGacetas } from '../../../services/useGacetas';
import { useTipoPublicacion } from '../../../services/useTipoPublicacion';
import { useEstados } from '../../../services/useEstados'; 

// Auth
import { useMsal } from '@azure/msal-react';

function PatentesDetails(props) { // EDITABLE

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
    const patenteDataDetails = useSelector(state => state.patente.PatenteDetails); // EDITABLE: guarda los datos de persistencia
    const isEditing = useSelector(state => state.patente.isEditing); // EDITABLE: guarda si se está editando o no

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    const toast = useRef(null); // GENERAL
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
 
    
    const { data: patenteData, error, isLoading, mutate: refresh } = useSWR(`${API_BASE_URL}/${props.patenteId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteObject, updateObject } = usePatentes(); // Para editar y eliminar un objeto: EDITABLE
    const prevPatenteIdRef = useRef(props.patenteId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    const { tiposPatentes, error: errorTP, isLoading: isLoadingTP, isValidating: isValidatingTP, refresh: refreshTP } = useTipoPatente(); // Para el dropdown de tipos de patentes
    const { abogados, error: errorA, isLoading: isLoadingA, isValidating: isValidatingA, refresh: refreshA } = useAbogados(); // Para el dropdown de abogados
    const { paises, error: errorP, isLoading: isLoadingP, isValidating: isValidatingP, refresh: refreshP } = usePaises(); // Para el dropdown de paises
    const { tiposReferencias, error: errorTR, isLoading: isLoadingTR, isValidating: isValidatingTR, refresh: refreshTR } = useTipoReferencia(); // Para el dropdown de tipos de referencias
    const { gacetas, error: errorG, isLoading: isLoadingG, isValidating: isValidatingG, refresh: refreshG } = useGacetas(); // Para el dropdown de gacetas
    const { tiposPublicaciones, error: errorTPu, isLoading: isLoadingTPu, isValidating: isValidatingTPu, refresh: refreshTPu } = useTipoPublicacion(); // Para el dropdown de tipos de publicaciones
    const { estados: estadosOptions, error: errorE, isLoading: isLoadingE, isValidating: isValidatingE, refresh: refreshE } = useEstados(); // Para el dropdown de estados

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false); // Loader para la eliminación o edición
    const [isRefreshing, setIsRefreshing] = useState(false);
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
    };  // EDITABLE: solo los campos requeridos

    // --------------- Estados para comentarios (requieren persistencia) --------------------------------------------

    const [currentComentario, setCurrentComentario] = useState({}); // Para el comentario que se está creando

    // --------------- Estados que requieren persistencia --------------------------------------------

    // Dropdowns (selecciones múltiples)
    const [contactos, setContactos] = useState(patenteData?.contactos || []); // mapea los contactos que serán añadidos
    const [currentReferencia, setCurrentReferencia] = useState({}); // contiene la referencia que se está creando
    const [referencias, setReferencias] = useState(patenteData?.referencias || []); // mapea las referencias que serán añadidas
    const [inventores, setInventores] = useState(patenteData?.inventores || []); // mapea los inventores que serán añadidos
    const [solicitantes, setSolicitantes] = useState(patenteData?.solicitantes || []); // mapea los solicitantes que serán añadidos
    const [currentPrioridad, setCurrentPrioridad] = useState({}); // contiene la prioridad que se está creando
    const [prioridades, setPrioridades] = useState(patenteData?.prioridadPatente || []); // mapea las prioridades que serán añadidas
    const [currentPublicacion, setCurrentPublicacion] = useState({}); // contiene la publicación que se está creando
    const [publicaciones, setPublicaciones] = useState(patenteData?.publicaciones || []); // mapea las publicaciones que serán añadidas
    const [estados, setEstados] = useState(patenteData?.estados || []); // mapea los estados que serán añadidos
    const [currentPago, setCurrentPago] = useState({}); // contiene el pago que se está creando
    const [pagos, setPagos] = useState(patenteData?.pagosPatente || []); // mapea los pagos que serán añadidas
    const [selectedEstado, setSelectedEstado] = useState(null);
    const [selectedSolicitante, setSelectedSolicitante] = useState(null);
    const [selectedInventor, setSelectedInventor] = useState(null);

    // Lógica general
    const [patente, setPatente] = useState({});// mapea el objeto: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL
    const [activeIndex, setActiveIndex] = useState(0); // Conoce el indice de tab activo para el tabview

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (patenteDataDetails) {

            // Comentarios
            setCurrentComentario(patenteDataDetails.currentComentario || {});

            // Dropdowns
            setContactos(patenteDataDetails.contactos || patenteData?.contactos);
            setCurrentReferencia(patenteDataDetails.currentReferencia || {});
            setReferencias(patenteDataDetails.referencias || patenteData?.referencias);
            setInventores(patenteDataDetails.inventores || patenteData?.inventores);
            setSolicitantes(patenteDataDetails.solicitantes || patenteData?.solicitantes);
            setCurrentPrioridad(patenteDataDetails.currentPrioridad || {});
            setPrioridades(patenteDataDetails.prioridades || patenteData?.prioridadPatente);
            setCurrentPublicacion(patenteDataDetails.currentPublicacion || {});
            setPublicaciones(patenteDataDetails.publicaciones || patenteData?.publicaciones);
            setEstados(patenteDataDetails.estados || patenteData?.estados);
            setCurrentPago(patenteDataDetails.currentPago || {});
            setPagos(patenteDataDetails.pagos || patenteData?.pagosPatente);
            setSelectedEstado(patenteDataDetails.selectedEstado || null);
            setSelectedSolicitante(patenteDataDetails.selectedSolicitante || null);
            setSelectedInventor(patenteDataDetails.selectedInventor || null);

            // Lógica general
            setPatente(patenteDataDetails.patente || {});
            setisAnyEmpty(patenteDataDetails.isAnyEmpty || false);
            setRequiredFields(patenteDataDetails.requiredFields || defaultRequiredFields);
            setActiveIndex(patenteDataDetails.activeIndex || 0);
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({
            objectName: 'PatenteDetails', value:
            {
                currentComentario,
                contactos,
                currentReferencia,
                referencias,
                inventores,
                solicitantes,
                currentPrioridad,
                prioridades,
                currentPublicacion,
                publicaciones,
                currentPago, 
                pagos,
                estados,
                patente,
                isAnyEmpty,
                requiredFields,
                activeIndex,
                selectedEstado,
                selectedSolicitante,
                selectedInventor,
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
        inventores,
        solicitantes,
        currentPrioridad,
        prioridades,
        currentPublicacion,
        publicaciones,
        currentPago,
        pagos,
        estados,
        patente,
        isAnyEmpty,
        requiredFields,
        activeIndex,
        selectedEstado,
        selectedSolicitante,
        selectedInventor,
        isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'PatenteDetails' }));
        dispatch(deleteRecordatoriosData({ objectName: 'RecordatoriosPatentes' }));
        dispatch(deleteRecordatoriosDataDetails({ objectName: 'RecordatoriosPatentesDetails' }));
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
        fetchContactosData(patente?.selectedCliente);
    }, [patente?.selectedCliente]) // Busca los contactos de acuerdo con el cliente elegido !!! REVISAR: Cuando se cambia de cliente debe borrar los contactos pero eso da un problema con la persistencia
    useEffect(() => {

        const contactosIds = contactos?.map(contacto => contacto.contactoId);

        setPatente(prevPatente => ({
            ...prevPatente,
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
        setPatente(prevPatente => ({
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
        const inventoresIds = inventores?.map(inv => inv.inventorId);
        setPatente(prevPatente => ({
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
        const solicitantesIds = solicitantes?.map(sol => sol.propietarioId);
        setPatente(prevPatente => ({
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
        setPatente(prevPatente => ({
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
        setPatente(prevPatente => ({
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
        const estadosIds = estados?.map(est => est.codigo);
        setPatente(prevPatente => ({
            ...prevPatente,
            estadosIds: estadosIds
        }));
    }, [estados]); // Guarda los ids de los estados elegidos en la propiedad de la patente

    // Pagos
    const handleAddPago = (e) => {
        e.preventDefault();
        const { fecha, descripcion } = currentPago;

        if (!descripcion || !fecha || fecha?.trim() === '' || descripcion?.trim() === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Alerta',
                detail: 'Para añadir un pago, todos los campos deben estar completos', // EDITABLE
                life: 3000,
            });
            return; // Exit the function if the condition is not met
        }

        if (!pagos.some(pag => (pag.fecha === fecha) && (pag.descripcion === descripcion))) {
            const storedValue = sessionStorage.getItem('userData');
            if (storedValue) {
                const parsedValue = JSON.parse(storedValue);
                const currentPagoTreated = {
                    fecha: fecha,
                    descripcion: descripcion,
                    usuarioId: parsedValue.idUsuario,
                }
                setPagos([...pagos, currentPagoTreated]);
                setCurrentPago({});
            }
        }
    }; // Agrega un pago a la lista
    const handleDeletePago = (e, object) => {
        e.preventDefault();
        const updatedPagos = pagos.filter((item) => item !== object);
        setPagos(updatedPagos);
    }; // Quita un pago de la lista
    useEffect(() => {
        setPatente(prevPatente => ({
            ...prevPatente,
            pagoPatentes: pagos
        }));
    }, [pagos]); // Guarda los pagos en la propiedad de la patente

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
    }, [isValidatingP, isValidatingA, isValidatingTP, isValidatingTR, isValidatingG, isValidatingTPu, isValidatingE]); // Cambia el estado de refreshing: GENERAL

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

    // ------------------ FIN DROPDOWNS ---------------------------------------

    useEffect(() => {
        if (props.patenteId !== prevPatenteIdRef.current) {
            if (patenteData) {
                setPatente({
                    ...patenteData,
                    selectedPais: patenteData.pais,
                    selectedTipoPatente: patenteData.tipoPatente,
                    selectedCliente: patenteData.cliente,
                    selectedOficinaTramitante: patenteData.oficinaTramitante,
                    selectedAbogado: abogados?.find(abogado => abogado.abogadoId === patenteData.abogado.abogadoId),
                }); // EDITABLE

                // Dropdowns
                setContactos(patenteData.contactos);
                setCurrentReferencia({});
                setReferencias(patenteData.referencias);
                setInventores(patenteData.inventores);
                setSolicitantes(patenteData.solicitantes);
                setCurrentPrioridad({});
                setPrioridades(patenteData.prioridadPatente);
                setCurrentPublicacion({});
                setPublicaciones(patenteData.publicaciones);
                setEstados(patenteData.estados);
                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);

                // Estados de los dropdowns
                setSelectedContacto(null);
                setSelectedInventor(null);
                setSelectedSolicitante(null);
                setSelectedEstado(null);

                dispatch(deleteRecordatoriosData({ objectName: 'RecordatoriosPatentes' }));  // Eliminar recordatorios si es que cambia la referencia.
                dispatch(deleteRecordatoriosDataDetails({ objectName: 'RecordatoriosPatentesDetails' }));  // Eliminar recordatorios si es que cambia la referencia.

                prevPatenteIdRef.current = props.patenteId;
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
                    if (patenteData) {
                        setPatente({
                            ...patenteData,
                            selectedPais: patenteData.pais,
                            selectedTipoPatente: patenteData.tipoPatente,
                            selectedCliente: patenteData.cliente,
                            selectedOficinaTramitante: patenteData.oficinaTramitante,
                            selectedAbogado: abogados?.find((abogado => abogado.abogadoId === patenteData.abogado.abogadoId)),
                        }); // EDITABLE

                        // Dropdowns
                        setContactos(patenteData.contactos);
                        setCurrentReferencia({});
                        setReferencias(patenteData.referencias);
                        setInventores(patenteData.inventores);
                        setSolicitantes(patenteData.solicitantes);
                        setCurrentPrioridad({});
                        setPrioridades(patenteData.prioridadPatente);
                        setCurrentPublicacion({});
                        setPublicaciones(patenteData.publicaciones);
                        setEstados(patenteData.estados);

                        // Estados de los dropdowns
                        setSelectedContacto(null);
                        setSelectedInventor(null);
                        setSelectedSolicitante(null);
                        setSelectedEstado(null);

                        setisAnyEmpty(false);
                        setRequiredFields(defaultRequiredFields);
                    }
                }
            }
        }
    }, [patenteData, isEditing, props.patenteId]); // useEffect para escuchar cambios en estadoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO

    const updateSelectedObject = (selectedObject, value) => {
        setPatente(prev => ({ ...prev, [selectedObject]: value })); // Editar
    }; // Maneja el cambio para un dropdown

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; // Use value for text inputs, and checked for checkboxes
        if (requiredFields.hasOwnProperty(name)) {
            const updatedRequiredFields = { ...requiredFields };
            updatedRequiredFields[name] = false;
            setRequiredFields(updatedRequiredFields);
        } // Check if the input name is a key in the requiredFields
        setPatente(prev => ({ ...prev, [name]: inputValue })); // Update the newCliente state with the new value for text inputs
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
            const response = await deleteObject(props.patenteId); // EDITABLE
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

    const validateRequiredFields = (propietario) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(propietario[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    function datesInvalid(startDateParam, endDateParam) {
        if (!startDateParam || !endDateParam) return false;

        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        return startDate > endDate;
    }

    const handleEdit = async (e) => {
        e.preventDefault();

        // VALIDACIONES DE FECHAS
        const dateValidationPairs = [
            { from: patente?.pagoAnualidadDesde, to: patente?.pagoAnualidadHasta, name: "Pago de anualidad" },
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
        const anyFieldEmpty = validateRequiredFields(patente);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const finalPatente = {
                "tipoPatenteId": patente.selectedTipoPatente.tipoPatenteId,
                "clienteId": patente.selectedCliente.clienteId,
                "contactosIds": patente.contactosIds ? patente.contactosIds : patente.contactos.map(contacto => contacto.contactoId),
                "oficinaTramitanteId": patente.selectedOficinaTramitante.clienteId,
                "abogadoId": patente.selectedAbogado.abogadoId,
                "abogadoInternacional": patente.abogadoInternacional,
                "codigoPais": patente.selectedPais.codigoPais,
                "tituloEspanol": patente.tituloEspanol,
                "tituloIngles": patente.tituloIngles,
                "resumen": patente.resumen,
                "inventoresIds": patente.inventoresIds ? patente.inventoresIds : patente.inventores.map(inv => inv.inventorId),
                "solicitantesIds": patente.solicitantesIds ? patente.solicitantesIds : patente.solicitantes.map(sol => sol.propietarioId),
                "referenciaInterna": patente.referenciaInterna,
                "referencias": patente.referencias.map(ref => ({
                    tipoReferenciaId: ref.tipoReferenciaId,
                    referencia: ref.referencia
                })),
                "estados": patente.estadosIds ? patente.estadosIds : patente.estados.map(est => est.codigo),
                "caja": patente.caja,
                "registro": patente.registro,
                "fechaRegistro": patente.fechaRegistro,
                "publicacion": patente.publicacion,
                "fechaPublicacion": patente.fechaPublicacion,
                "certificado": patente.certificado,
                "vencimiento": patente.vencimiento,
                "pctSolicitud": patente.pctSolicitud,
                "fechaPctSolicitud": patente.fechaPctSolicitud,
                "pctPublicacion": patente.pctPublicacion,
                "fechaPctPublicacion": patente.fechaPctPublicacion,
                "prioridadPatente": patente.prioridadPatente.map(prio => ({
                    codigoPais: prio.codigoPais,
                    numero: prio.numero,
                    fecha: prio.fecha,
                })),
                "publicaciones": patente.publicaciones.map(pub => ({
                    tipoPublicacionId: pub.tipoPublicacionId,
                    numeroGaceta: pub.numeroGaceta,
                    pagina: pub.pagina,
                })),
                "pagoAnualidad": patente.pagoAnualidad,
                "pagoAnualidadDesde": patente.pagoAnualidadDesde,
                "pagoAnualidadHasta": patente.pagoAnualidadHasta,
                "pagoPatentes": patente.pagoPatentes ? patente.pagoPatentes : patente.pagosPatente,
            }

            const response = await updateObject(props.patenteId, finalPatente);

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

    // Función para buscar la patente en OMPI
    const searchPatenteOMPI = (e) => {
        e.preventDefault();
        if (patente?.pctPublicacion) {
            const publicacionParts = patente?.pctPublicacion.split(' ');
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
                            <span>{`Patente: ${patente?.patenteId || ''} - ${patente?.tituloEspanol || ''} / ${patente?.tituloIngles || ''}`}</span>
                            <div className="form-header-buttons">
                                <Button className="form-header-btn" onClick={handleCancel}>
                                    <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                </Button>
                            </div>
                        </section>

                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} scrollable>
                            <TabPanel header="Patente" leftIcon="pi pi-shield mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-info-circle"></i>
                                            <label>Información de la patente</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Título <small>(ES)</small> <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.tituloEspanol && 'form-group-empty'}`} type="text" name="tituloEspanol" value={patente?.tituloEspanol || ''} onChange={handleInputChange} required maxLength="70" placeholder="Título de la patente en español" />
                                            </div>
                                            <div className="form-group">
                                                <label>Título <small>(EN)</small> <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                <input readOnly={!isEditing} className={`${requiredFields.tituloIngles && 'form-group-empty'}`} type="text" name="tituloIngles" value={patente?.tituloIngles || ''} onChange={handleInputChange} required maxLength="70" placeholder="Título de la patente en inglés" />
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
                                                                disabled={!isEditing}
                                                                className={`${requiredFields.selectedTipoPatente && 'form-group-empty'}`}
                                                                style={{ width: '100%' }}
                                                                value={patente.selectedTipoPatente}
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
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 'calc(31.8%)' }}>
                                                <div className="form-group">
                                                    <label>Referencia interna <small className="requiredAsterisk">(Obligatorio)</small></label>
                                                    <input readOnly={!isEditing} className={`${requiredFields.referenciaInterna && 'form-group-empty'}`} type="text" name="referenciaInterna" value={patente?.referenciaInterna || ''} onChange={handleInputChange} maxLength="100" placeholder="Referencia interna" />
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
                                                                    value={patente.selectedPais}
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
                                                <textarea readOnly={!isEditing} style={{ height: '65px', maxHeight: '65px' }} type="text" name="resumen" value={patente?.resumen || ''} onChange={handleInputChange} maxLength="1000" placeholder="Resumen de la patente" />
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
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-credit-card"></i>
                                            <label>Anualidad</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group center-switch">
                                                <label>¿Pago de anualidad?</label>
                                                <label className="switch">
                                                    <input disabled={!isEditing} type="checkbox" name="pagoAnualidad" checked={patente?.pagoAnualidad} onChange={handleInputChange} />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                            <div className="form-group">
                                                <label>Fecha de Inicio de Pago</label>
                                                <input disabled={!isEditing} type="date" name="pagoAnualidadDesde" value={patente.pagoAnualidadDesde ? patente.pagoAnualidadDesde.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-group">
                                                <label>Fecha de Fin de Pago</label>
                                                <input disabled={!isEditing} type="date" name="pagoAnualidadHasta" value={patente.pagoAnualidadHasta ? patente.pagoAnualidadHasta.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
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
                                                <DebounceDropdown disabled={!isEditing} className={`${requiredFields.selectedCliente && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedCliente', value)} selectedObject={patente?.selectedCliente} filterBy="clienteId,nombre" />
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
                                                                    <button style={{color: 'white', minHeight: '24px', height:'24px', minWidth:'24px', width: '24px'}} className="rounded-icon-btn" onClick={(event) => fetchContactosData(patente?.selectedCliente, event)}>
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
                                                <DebounceDropdown disabled={!isEditing} className={`${requiredFields.selectedOficinaTramitante && 'form-group-empty'}`} endpoint='Clientes' optionLabel='nombre' showClear={false} setter={(value) => updateSelectedObject('selectedOficinaTramitante', value)} selectedObject={patente?.selectedOficinaTramitante} filterBy="clienteId,nombre" />
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
                                                                value={patente.selectedAbogado}
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
                                                <input readOnly={!isEditing} type="text" name="abogadoInternacional" value={patente?.abogadoInternacional || ''} onChange={handleInputChange} maxLength="70" placeholder="Nombre completo del responsable" />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </TabPanel>
                            <TabPanel header="Solicitud" leftIcon="pi pi-users mr-2">
                                <div className="form-body form-body--create">
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
                                                        <DebounceDropdown disabled={!isEditing} endpoint='Inventores' optionLabel='nombre' showClear={true} setter={setSelectedInventor} selectedObject={selectedInventor} filterBy="inventorId,nombre,apellido" />
                                                    </div>
                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddInventor}>
                                                        <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Inventores agregados ({inventores?.length})</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {inventores?.map((inv, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <td className="table-nombre-abogado"><strong>{inv.inventorId} - </strong>{inv.nombre} {inv.apellido}</td>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteInventor(e, inv)}>
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
                            <TabPanel header="Extra" leftIcon="pi pi-plus-circle mr-2">
                                <div className="form-body form-body--create">
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-inbox"></i>
                                            <label>Información de almacenamiento</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group">
                                                <label>Caja</label>
                                                <input disabled={!isEditing} type="text" name="caja" value={patente?.caja || ''} onChange={handleInputChange} maxLength="70" placeholder="Caja en donde se guarda la carpeta de la patente" />
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
                                                                    disabled={!isEditing}
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
                                                    <input disabled={!isEditing} style={{ width: '30%' }} type="date" name="fecha" value={currentPrioridad.fecha || ''} onChange={(e) => setCurrentPrioridad({ ...currentPrioridad, fecha: e.target.value })} />
                                                    <input disabled={!isEditing} style={{ width: '30%' }} type="text" name="numero" value={currentPrioridad.numero || ''} onChange={(e) => setCurrentPrioridad({ ...currentPrioridad, numero: e.target.value })} maxLength="70" placeholder="Número" />
                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddPrioridad}>
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
                                                <tbody style={{ maxHeight: '70px' }}>
                                                    {prioridades?.map((prio, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
                                                                <td className="table-nombre-abogado"><strong>País: </strong>{paises && paises?.find(pais => pais.codigoPais === prio.codigoPais).nombre}</td>
                                                                <td className="table-nombre-abogado"><strong>Fecha: </strong>{prio.fecha.split('T')[0]}</td>
                                                                <td className="table-nombre-abogado"><strong>Número: </strong>{prio.numero}</td>
                                                            </div>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeletePrioridad(e, prio)}>
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
                                                                    disabled={!isEditing}
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
                                                                    disabled={!isEditing}
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
                                                    <input disabled={!isEditing} style={{ width: '20%' }} type="text" name="pagina" value={currentPublicacion.pagina || ''} onChange={(e) => setCurrentPublicacion({ ...currentPublicacion, pagina: e.target.value })} maxLength="10" placeholder="Página" />
                                                    <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddPublicacion}>
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
                                                <tbody style={{ maxHeight: '70px' }}>
                                                    {publicaciones?.map((pub, index) => (
                                                        <tr className="table-row" key={index}>
                                                            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '33% 33% 33%' }}>
                                                                <td className="table-nombre-abogado"><strong>Tipo: </strong>{tiposPublicaciones && tiposPublicaciones?.find(tp => tp.tipoPublicacionId === pub.tipoPublicacionId).nombre}</td>
                                                                <td className="table-nombre-abogado"><strong>Gaceta N°: </strong>{pub.numeroGaceta}</td>
                                                                <td className="table-nombre-abogado"><strong>Página: </strong>{pub.pagina}</td>
                                                            </div>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeletePublicacion(e, pub)}>
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
                                                <tbody style={{ maxHeight: '75px' }}>
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
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-file-edit"></i>
                                            <label>Solicitud de registro</label>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-double">
                                                <label>Solicitud</label>
                                                <input readOnly={!isEditing} type="text" name="publicacion" value={patente?.publicacion || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de solicitud" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de solicitud</label>
                                                <input readOnly={!isEditing} type="date" name="fechaPublicacion" value={patente.fechaPublicacion ? patente.fechaPublicacion.split('T')[0] : ''}  onChange={handleInputChange} />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Registro</label>
                                                <input readOnly={!isEditing} type="text" name="registro" value={patente?.registro || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de registro" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de registro</label>
                                                <input readOnly={!isEditing} type="date" name="fechaRegistro" value={patente.fechaRegistro ? patente.fechaRegistro.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Certificado</label>
                                                <input readOnly={!isEditing} type="text" name="certificado" value={patente?.certificado || ''} onChange={handleInputChange} maxLength="70" placeholder="Certificado" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de vencimiento</label>
                                                <input readOnly={!isEditing} type="date" name="vencimiento" value={patente.vencimiento ? patente.vencimiento.split('T')[0] : ''}  onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </section>
                                    <section>
                                        <div className="form-group-label">
                                            <i className="pi pi-file-edit"></i>
                                            <label>PCT</label>
                                            <button onClick={(e) => searchPatenteOMPI(e)} disabled={patente?.pctPublicacion ? false : true} className="rounded-icon-btn" style={{ minHeight: '16px', height: '16px', color: 'white', minWidth: '70px', padding: '5px', gap:'4px' }}>
                                                <small>Buscar</small>
                                                <i className="pi pi-external-link"></i>
                                            </button>
                                        </div>
                                        <div className="form-body-group">
                                            <div className="form-group form-group-double">
                                                <label>Solicitud</label>
                                                <input readOnly={!isEditing} type="text" name="pctSolicitud" value={patente?.pctSolicitud || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de solicitud" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de solicitud</label>
                                                <input readOnly={!isEditing} type="date" name="fechaPctSolicitud" value={patente.fechaPctSolicitud ? patente.fechaPctSolicitud.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Publicación</label>
                                                <input readOnly={!isEditing} type="text" name="pctPublicacion" value={patente?.pctPublicacion || ''} onChange={handleInputChange} maxLength="70" placeholder="Número de publicación" />
                                            </div>
                                            <div className="form-group form-group-double">
                                                <label>Fecha de publicación</label>
                                                <input readOnly={!isEditing} type="date" name="fechaPctPublicacion"  value={patente.fechaPctPublicacion ? patente.fechaPctPublicacion.split('T')[0] : ''} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </TabPanel>
                            <TabPanel header="Eventos" leftIcon="pi pi-calendar mr-2">
                                <EventosHandler tablaConexion="patente" idConexion={props.patenteId} propietariosExistentes={patente?.solicitantes} nombreRegistro={patente?.tituloEspanol} onDialogVisibilityChange={handleDialogVisibilityChange} isClosingRef={isClosingRef} />
                            </TabPanel>
                            <TabPanel header="Comentarios" leftIcon="pi pi-comments mr-2">
                                <CommentsD onCommentChange={setCurrentComentario} persistedComment={currentComentario} tablaConexion="patente" idConexion={props.patenteId} />
                            </TabPanel>
                            {
                                patente?.pagoAnualidad && 
                                <TabPanel header="Pagos" leftIcon="pi pi-wallet mr-2">
                                    <div className="form-body form-body--create">
                                        <section>
                                            <div className="form-group-label">
                                                <i className="pi pi-wallet"></i>
                                                <label>Pagos</label>
                                            </div>
                                            <div className="form-body-group">
                                                <div className="form-group">
                                                    <label>Ingresa un pago</label>
                                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                                        <input disabled={!isEditing} style={{ width: '25%' }} type="date" name="fecha" value={currentPago.fecha || ''} onChange={(e) => setCurrentPago({ ...currentPago, fecha: e.target.value })} />
                                                        <textarea disabled={!isEditing} style={{ width: '75%' }} type="text" name="descripcion" value={currentPago.descripcion || ''} onChange={(e) => setCurrentPago({ ...currentPago, descripcion: e.target.value })} maxLength="200" placeholder="Descripción del pago (máx. 200 caracteres)" />
                                                        <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddPago}>
                                                            <i className="pi pi-plus-circle" style={{ color: 'white', fontSize: '16px' }}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                <table className="table-list">
                                                    <thead>
                                                        <tr className="table-head">
                                                            <th>Pagos Agregados ({pagos?.length})</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody style={{ maxHeight: '300px' }}>
                                                        {pagos?.map((pago, index) => (
                                                            <tr className="table-row" key={index}>
                                                                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '25% 75%' }}>
                                                                    <td className="table-nombre-abogado">{pago.fecha ? pago.fecha.split('T')[0] : ''}</td>
                                                                    <td className="table-nombre-abogado">{pago.descripcion}</td>
                                                                </div>
                                                                <td className="table-delete-button">
                                                                    <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeletePago(e, pago)}>
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
                            }
                            <TabPanel header="Recordatorios" leftIcon="pi pi-bell mr-2">
                                <RecordatorioHandler tablaConexion="patente" idConexion={props.patenteId} nombrePadre="RecordatoriosPatentes" isClosingRef={isClosingRef} />
                            </TabPanel>
                            <TabPanel header="Documentos" leftIcon="pi pi-paperclip mr-2">
                                <div className="form-info-msg" style={{ paddingBottom: '0' }}>
                                    <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                    <span>Por favor, permanezca en la pestaña para conservar cualquier cambio y archivo seleccionado</span>
                                </div>
                                <section className="form-body form-body--create">
                                    <DocumentViewer type="documentos" tablaConexion="patente" idConexion={props.patenteId} />
                                    <DocumentViewer type="correos" tablaConexion="patente" idConexion={props.patenteId} />
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

export default PatentesDetails;