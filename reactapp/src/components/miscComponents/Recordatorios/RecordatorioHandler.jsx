import React, { useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { ToggleButton } from 'primereact/togglebutton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmPopup } from 'primereact/confirmpopup';
import { Checkbox } from 'primereact/checkbox';

// Auth
import { useMsal } from '@azure/msal-react';

// Services
import { useRecordatorios } from '../../../services/useRecordatorios'; // Para la creación de recordatorios
import { useUsuarios } from '../../../services/useUsuarios'; // Para el dropdown de usuarios
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;

// Dates logic
import { addDays, addWeeks, addMonths, addYears, isBefore, isEqual, startOfDay, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, completelyDeleteData } from '../../../context/recordatorioSlice'; 
import { saveDataDetails, deleteDataDetails, completelyDeleteDataDetails, toggleIsEditing } from '../../../context/recordatorioDetailsSlice';

function RecordatorioHandler({ tablaConexion, idConexion, nombrePadre, isClosingRef }) {


    const [isAdding, setIsAdding] = useState(false);
    const defaultRecordatorioData = {
        descripcion: '',
        instancias: [],
        idUsuarios: [],
    }
    const dispatch = useDispatch();

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

    // ------------- Obtención de datos --------------------------------------

    const URL_POBLAR_TABLA = `${apiEndpoint}/InstanciasRecordatorios/Buscar?tablaConexion=${tablaConexion}&idConexion=${idConexion}`;
    const { data: recordatoriosTabla, error: errorTb, isLoading: isLoadingTb, mutate: refreshTb } = useSWR(URL_POBLAR_TABLA, fetcher);

    // ########################################################################### Estados para la edición ###########################################################################

    
    const [selectedInstancia, setSelectedInstancia] = useState(null);
    const [selectedRecordatorio, setSelectedRecordatorio] = useState(null); // El recordatorio que se editará

    // Estados que requieren persistencia
    const [descripcionDetails, setDescripcionDetails] = useState('');
    const [selectedUsuarioDetails, setSelectedUsuarioDetails] = useState(null); // mapea el usuario que será añadido a la lista
    const [usuariosListDetails, setUsuariosListDetails] = useState([]); // mapea los usuarios que serán añadidos
    const [fechasListDetails, setFechasListDetails] = useState([]); // mapea las fechas de las instancias del recordatorio
    const [optionDetails, setOptionDetails] = useState('single'); // 'single' or 'range'
    const [singleDateDetails, setSingleDateDetails] = useState('');

    // Estados de la lógica de fechas
    const [numberDetails, setNumberDetails] = useState(1);
    const [unitDetails, setUnitDetails] = useState('día');
    const [startDateDetails, setStartDateDetails] = useState('');
    const [endDateDetails, setEndDateDetails] = useState('');

    const unitsDetails = numberDetails === 1 ? ['día', 'semana', 'mes', 'año'] : ['días', 'semanas', 'meses', 'años'];

    // ------------------- Funciones necesarias para persistencia ---------------------------------

    // Persistencia
    const persistedDataDetails = useSelector(state => {
        switch (nombrePadre) {
            case 'RecordatoriosPatentes':
                return state.recordatorioDetails.RecordatoriosPatentesDetails;
            case 'RecordatoriosMarcas':
                return state.recordatorioDetails.RecordatoriosMarcasDetails;
            case 'RecordatoriosAcciones':
                return state.recordatorioDetails.RecordatoriosAccionesDetails;
            case 'RecordatoriosRegulatorio':
                return state.recordatorioDetails.RecordatoriosRegulatorioDetails;
            case 'RecordatoriosRecordatorios':
                return state.recordatorioDetails.RecordatoriosRecordatoriosDetails;
            default:
                return null; // Or some default state
        }
    }); // Determine which part of the state to select based on nombrePadre
    const isEditing = persistedDataDetails?.isEditing;

    useEffect(() => {
        if (persistedDataDetails && isEditing) { 
            setSelectedInstancia(persistedDataDetails.selectedInstancia || null);
            setSelectedRecordatorio(persistedDataDetails.selectedRecordatorio || null);

            setDescripcionDetails(persistedDataDetails.descripcionDetails || '');
            setSelectedUsuarioDetails(persistedDataDetails.selectedUsuarioDetails || null);
            setUsuariosListDetails(persistedDataDetails.usuariosListDetails || []);
            setFechasListDetails(persistedDataDetails.fechasListDetails || []);
            setOptionDetails(persistedDataDetails.optionDetails || 'single');
            setSingleDateDetails(persistedDataDetails.singleDateDetails || '');

            setNumberDetails(persistedDataDetails.numberDetails || 1);
            setUnitDetails(persistedDataDetails.unitDetails || 'día');
            setStartDateDetails(persistedDataDetails.startDateDetails || '');
            setEndDateDetails(persistedDataDetails.endDateDetails || '');
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL

    const saveStateDetails = () => {
        dispatch(saveDataDetails({ objectName: `${nombrePadre}Details`, value: { selectedInstancia, selectedRecordatorio, descripcionDetails, selectedUsuarioDetails, usuariosListDetails, fechasListDetails, optionDetails, singleDateDetails, numberDetails, unitDetails, startDateDetails, endDateDetails } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO

    const willStoreDefault = () => {
        return (selectedInstancia === null &&
            selectedRecordatorio === null &&
            descripcionDetails === '' &&
            selectedUsuarioDetails === null &&
            usuariosListDetails.length === 0 &&
            fechasListDetails.length === 0 &&
            optionDetails === 'single' &&
            singleDateDetails === '' &&
            numberDetails === 1 &&
            unitDetails === 'día' &&
            startDateDetails === '' &&
            endDateDetails === ''
        )
    } // Evita que se quieran guardar datos default

    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                if (isEditing && !willStoreDefault()) { 
                    saveStateDetails();
                }
            }
        };
    }, [isEditing, selectedInstancia, selectedRecordatorio, descripcionDetails, selectedUsuarioDetails, usuariosListDetails, fechasListDetails, optionDetails, singleDateDetails, numberDetails, unitDetails, startDateDetails, endDateDetails]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    useEffect(() => {
        if (isAdding) {
            resetStatesDetails();
            deletePersistedStatesDetails();
        }
    }, [isAdding]) // Si el usuario va a añadir un recordatorio, la data que se está editando se elimina

    // ------------------- Funciones para reseteo de estados --------------------

    const deletePersistedStatesDetails = () => {
        dispatch(deleteDataDetails({ objectName: `${nombrePadre}Details` }));
    };
    const resetStatesDetails = () => {
        setSelectedInstancia(null);
        setSelectedRecordatorio(null);

        setDescripcionDetails('');
        setSelectedUsuarioDetails(null);
        setUsuariosListDetails([]);
        setFechasListDetails([]);
        setOptionDetails('single');
        setSingleDateDetails('');

        setNumberDetails(1);
        setUnitDetails('día');
        setStartDateDetails('');
        setEndDateDetails('');
    }
    useEffect(() => {
        if (persistedDataDetails && persistedDataDetails.hasOwnProperty('wasDeleted')) {
            resetStatesDetails();
            dispatch(completelyDeleteDataDetails({ objectName: `${nombrePadre}Details` }));
        }
    }, [persistedDataDetails])

    // ########################################################################### Lógica para la creación de recordatorios ###########################################################################

    // Persistencia
    const persistedData = useSelector(state => {
        switch (nombrePadre) {
            case 'RecordatoriosPatentes':
                return state.recordatorio.RecordatoriosPatentes;
            case 'RecordatoriosMarcas':
                return state.recordatorio.RecordatoriosMarcas;
            case 'RecordatoriosAcciones':
                return state.recordatorio.RecordatoriosAcciones;
            case 'RecordatoriosRegulatorio':
                return state.recordatorio.RecordatoriosRegulatorio;
            case 'RecordatoriosRecordatorios':
                return state.recordatorio.RecordatoriosRecordatorios;
            default:
                return null; // Or some default state
        }
    }); // Determine which part of the state to select based on nombrePadre

    // Setup
    const { uploadRecordatorio, editRecordatorio } = useRecordatorios(); // Servicio para subir recordatorios
    const { usuarios, error: errorU, isLoading: isLoadingU, isValidating: isValidatingU, refresh: refreshU } = useUsuarios(); // Para el dropdown de usuarios
    const toast = useRef(null);

    // Estados que requieren persistencia
    const [recordatorioData, setRecordatorioData] = useState(defaultRecordatorioData);
    const [selectedUsuario, setSelectedUsuario] = useState(null); // mapea el usuario que será añadido a la lista
    const [usuariosList, setUsuariosList] = useState([]); // mapea los usuarios que serán añadidos
    const [fechasList, setFechasList] = useState([]); // mapea las fechas de las instancias del recordatorio
    const [option, setOption] = useState('single'); // 'single' or 'range'
    const [singleDate, setSingleDate] = useState('');

    // Estados de la lógica de fechas
    const [number, setNumber] = useState(1);
    const [unit, setUnit] = useState('día');
    const [startDate, setStartDate] = useState(''); // Assuming date picker returns a Date object
    const [endDate, setEndDate] = useState('');

    // Estados que no requieren persistencia
    const [isLoading2, setIsLoading2] = useState(false); // Loader para la creación
    const [isRefreshing, setIsRefreshing] = useState(false);
    const units = number === 1 ? ['día', 'semana', 'mes', 'año'] : ['días', 'semanas', 'meses', 'años'];

    // ------------------- Funciones necesarias para persistencia ---------------------------------

    useEffect(() => {
        if (persistedData) { // EDITABLE

            setIsAdding(persistedData.isAdding || false);

            setRecordatorioData(persistedData.recordatorioData || defaultRecordatorioData);
            setSelectedUsuario(persistedData.selectedUsuario || null);
            setUsuariosList(persistedData.usuariosList || []);
            setFechasList(persistedData.fechasList || []);
            setOption(persistedData.option || 'single');
            setSingleDate(persistedData.singleDate || '');

            setNumber(persistedData.number || 1);
            setUnit(persistedData.unit || 'día');
            setStartDate(persistedData.startDate || '');
            setEndDate(persistedData.endDate || '');
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: nombrePadre, value: { isAdding, recordatorioData, selectedUsuario, usuariosList, fechasList, option, singleDate, number, unit, startDate, endDate } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAdding, recordatorioData, selectedUsuario, usuariosList, fechasList, option, singleDate, number, unit, startDate, endDate]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE

    // ------------------- Funciones para reseteo de estados --------------------

    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: nombrePadre })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO
    const resetStates = () => {
        setRecordatorioData(defaultRecordatorioData);
        setSelectedUsuario(null);
        setUsuariosList([]);
        setFechasList([]);
        setOption('single');
        setSingleDate('');

        setNumber(1);
        setUnit('día');
        setStartDate('');
        setEndDate('');
    }
    useEffect(() => {
        if (persistedData && persistedData.hasOwnProperty('wasDeleted')) {
            resetStates();
            dispatch(completelyDeleteData({ objectName: nombrePadre }));
        }
    }, [persistedData])

    // ------------------- Funciones para generación de fechas ---------------------------------

    useEffect(() => {
        if (number === 1) {
            switch (unit) {
                case 'días':
                    setUnit('día');
                    break;
                case 'semanas':
                    setUnit('semana');
                    break;
                case 'meses':
                    setUnit('mes');
                    break;
                case 'años':
                    setUnit('año');
                    break;
                default:
                    break;
            }
        } else {
            switch (unit) {
                case 'día':
                    setUnit('días');
                    break;
                case 'semana':
                    setUnit('semanas');
                    break;
                case 'mes':
                    setUnit('meses');
                    break;
                case 'año':
                    setUnit('años');
                    break;
                default:
                    break;
            }
        }
    }, [number, unit]); // Cambia la unidad dependiendo del número elegido
    const generateDates = () => {
        let dates = [];
        let currentDate = new Date(startDate); // Convert the date string to a Date object

        while (isBefore(currentDate, new Date(endDate)) || isSameDay(currentDate, new Date(endDate))) {
            dates.push(currentDate.toISOString().split('T')[0]); // Push the date string

            switch (unit) {
                case 'día':
                case 'días':
                    currentDate = addDays(currentDate, number);
                    break;
                case 'semana':
                case 'semanas':
                    currentDate = addWeeks(currentDate, number);
                    break;
                case 'mes':
                case 'meses':
                    currentDate = addMonths(currentDate, number);
                    break;
                case 'año':
                case 'años':
                    currentDate = addYears(currentDate, number);
                    break;
                default:
                    break;
            }
        }

        // Check if endDate is already included in the dates array
        if (!dates.some(date => isSameDay(new Date(date), new Date(endDate)))) {
            dates.push(endDate); // Push the endDate string if not included
        }

        return dates;
    };
    const isSameDay = (date1, date2) => {
        return isEqual(startOfDay(date1), startOfDay(date2));
    }; // Helper function to compare dates without time components

    // ------------------- Funciones para selección de tipo de generación de fechas ---------------------------------

    const handleOptionChange = (event) => {
        setOption(event.target.value);
    };
    const isValidRangeInput = () => {
        return number > 0 && unit && startDate && endDate;
    };
    const addDate = () => {
        if (option === 'single') {
            if (singleDate) {
                setFechasList(prevDates => {
                    if (!prevDates.some(date => isSameDay(new Date(date), new Date(singleDate)))) {
                        return [...prevDates, singleDate].sort((a, b) => new Date(a) - new Date(b)); // Sort after adding
                    }
                    return prevDates;
                });
            } else {
                toast.current.show({ severity: 'warn', summary: 'Alerta', detail: 'Selecciona una fecha', life: 3000 });
            }
        } else {
            if (!isValidRangeInput()) {
                toast.current.show({ severity: 'warn', summary: 'Alerta', detail: 'Todos los campos deben estar llenos y el número debe ser positivo', life: 3000 });
                return;
            }
            if (!isBefore(startDate, endDate)) {
                toast.current.show({ severity: 'warn', summary: 'Alerta', detail: 'La fecha Desde, debe ser anterior a la fecha Hasta', life: 3000 });
                return;
            }
            // Use the generateDates logic
            const newDates = generateDates(); // Modified to return new dates
            setFechasList(prevDates => {
                const combinedDates = [...prevDates, ...newDates];
                // Filter out duplicates and sort
                const uniqueDates = combinedDates.filter((date, index, self) =>
                    index === self.findIndex(d => isEqual(d, date))
                );
                return uniqueDates.sort((a, b) => new Date(a) - new Date(b));
            });
        }
    };

    // ------------------- Funciones para manejo de fechas ---------------------------------

    const clearAllDates = () => {
        setFechasList([]);
    };
    const removeDate = (index) => {
        setFechasList(prevDates => prevDates.filter((_, i) => i !== index));
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC', // Set the time zone to UTC
        };
        const formatter = new Intl.DateTimeFormat('es-ES', options);
        return formatter.format(date);
    };
    function getSpanishDayOfWeek(dateString) {
        const date = parseISO(dateString); // Parse the ISO date string
        const formattedDay = format(date, 'EEEE', { locale: es });
        return formattedDay;
    }
    const handleNumberChange = (e) => {
        const value = e.target.value;
        const number = parseInt(value, 10);

        if (isNaN(number) || number > 0) {
            setNumber(number);
        } else {
            setNumber(1); // Reset to 1 if the input is invalid
        }
    };

    /* -------------------- Dropdown de Usuarios -------------------- */

    const refreshData = (e) => {
        setIsRefreshing(true);
        refreshU();
    }; // Refresca los datos del los dropdowns: GENERAL
    useEffect(() => {
        if (isRefreshing) {
            setIsRefreshing(false);
        }
    }, [isValidatingU]); // Cambia el estado de refreshing: GENERAL
    const optionTemplateU = (option) => {
        return (
            <div className="dropdown-item-container">
                <span>{option.nombre} {option.apellido}</span>
            </div>
        );
    }; // EDITABLE: template para mostrar las opciones de un dropdown
    const selectedValueTemplateU = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span>{option.nombre} {option.apellido}</span>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    }; //EDITABLE: template para mostrar el valor seleccionado de un dropdown
    const handleAddUsuario = (e) => {
        e.preventDefault();
        if (selectedUsuario && !usuariosList.some(usu => usu.idUsuario === selectedUsuario.idUsuario)) {
            setUsuariosList([...usuariosList, selectedUsuario]);
            setSelectedUsuario(null);
        }
    }; // Agrega un usuario a la lista
    const handleDeleteUsuario = (e, object) => {
        e.preventDefault();
        const updatedUsuarios = usuariosList.filter((item) => item !== object);
        setUsuariosList(updatedUsuarios);
    }; // Quita un usuario de la lista
    useEffect(() => {
        const idUsuarios = usuariosList?.map(usu => usu.idUsuario); // 
        setRecordatorioData(prev => ({
            ...prev,
            idUsuarios: idUsuarios
        }));
    }, [usuariosList]); // Guarda los ids de los usuarios elegidos
    useEffect(() => {
        const instancias = fechasList?.map(fecha => ({
            fecha: fecha,
            activo: true,
        })); // 
        setRecordatorioData(prev => ({
            ...prev,
            instancias: instancias
        }));
    }, [fechasList]); // Guarda las instancias del recordatorio

    /* ------------------------- Añadir el recordatorio --------------------------*/

    const handleAddRecordatorio = async () => {

        if (recordatorioData.descripcion.trim() === '') {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: `El recordatorio no puede estar vacío`, // EDITABLE
                life: 3000,
            });
            return;
        }

        if (recordatorioData.idUsuarios.length === 0) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: `Debe seleccionar al menos un usuario`, // EDITABLE
                life: 3000,
            });
            return;
        }

        if (recordatorioData.instancias.length === 0) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: `Debe seleccionar al menos una fecha`, // EDITABLE
                life: 3000,
            });
            return;
        }

        try {
            setIsLoading2(true);
            await uploadRecordatorio(recordatorioData, idConexion, tablaConexion);

            // Show success toast
            toast.current.show({
                severity: 'success',
                summary: 'Recordatorio agregado',
                detail: `El recordatorio se ha agregado con éxito`,
                life: 3000,
            });

            resetStates();
            deletePersistedStates();
            refreshTb();

        } catch (uploadError) {
            console.error(uploadError);

            // Show error toast
            toast.current.show({
                severity: 'error',
                summary: 'Error de carga',
                detail: `Ha ocurrido un error al intentar cargar el recordatorio`,
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }

    // ########################################################################### Lógica para la visualización de recordatorios ###########################################################################

    const [isDeleting, setIsDeleting] = useState(false);
    const [activeCheckbox, setActiveCheckbox] = useState(null);

    // --------------------- Funciones necesarias ------------------------------------

    const confirmDeletion = (event, rowData) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Solamente se eliminará esta instancia del recordatorio',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteInstancia(rowData)
        });
    };
    const deleteInstancia = async (rowData) => {
        try {
            setIsDeleting(true);
            const url = `${apiEndpoint}/InstanciasRecordatorios/${rowData.instanciasRecordatorioId}`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Instancia eliminada correctamente`,
                life: 3000,
            });

            refreshTb();

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al eliminar la instancia`,
                life: 3000,
            });
        } finally {
            setIsDeleting(false);
            refreshTb();
        }
    };

    // ------------ Tabla ----------------------------------------------------

    const renderHeader = () => {
        return (
            <div className="document-header-container">
                <div className="document-header-title">
                    <i className='pi pi-bell' style={{ fontSize: '14px', fontWeight: '500', margin: '0', color: 'white' }}></i>
                    <span>Recordatorios</span>
                </div>
            </div>
        );
    }; // Contiene el header de la tabla: GENERAL
    const header = renderHeader();
    const actionsTemplate = (rowData) => {
        return (
            <div className="table-downloadbtn" >
                <button className="rounded-icon-btn" id="dwn-pdf" type="button" style={{ minHeight: '10px', minWidth: '10px', height: '20px' }} onClick={(event) => confirmDeletion(event, rowData)}>
                    <i className="pi pi-times" style={{ fontSize: '10px', margin: '0', color: 'white' }}></i>
                </button>
            </div>
        );
    };

    const handleInstanceChange = async (instanciaId,activoInstancia) => {
        try {
            setActiveCheckbox(instanciaId);
            const url = `${apiEndpoint}/InstanciasRecordatorios/${instanciaId}/activo`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(activoInstancia),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: activoInstancia ? 'info' : 'success',
                summary: 'Éxito',
                detail: activoInstancia ? 'Instancia pendiente' : 'Instancia completada',
                life: 1000,
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al cambiar el estado del recordatorio`,
                life: 3000,
            });
        } finally {
            setActiveCheckbox(null); 
            refreshTb();
        }
    }

    const fechaBodyTemplate = (rowData) => {
        let fecha = rowData.fecha.split('T')[0];
        let dateParts = fecha.split('-');

        const handleCheckboxChange = (e) => {
            e.stopPropagation();  // This stops the event from propagating to the row
            handleInstanceChange(rowData.instanciasRecordatorioId, !rowData.activo);
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                {activeCheckbox === rowData.instanciasRecordatorioId ?
                    <div className="checkbox-loader-container">
                        <div className="small-spinner" />
                    </div> :
                    <Checkbox onChange={handleCheckboxChange} checked={!rowData.activo}></Checkbox>
                }
                <span>{`${getSpanishDayOfWeek(fecha)}, ${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`}</span>
            </div>
            
        );
    };
    const recordatorioBodyTemplate = (rowData) => {
        return (
            <div>
                {rowData.recordatorio.descripcion}
            </div>
        );
    };


    // ########################################################################### Lógica para la edición de recordatorios ###########################################################################

    useEffect(() => {
        if (selectedRecordatorio && Object.keys(persistedDataDetails).length === 1) {
            setDescripcionDetails(selectedRecordatorio?.descripcion);
            setSelectedUsuarioDetails(null);
            setUsuariosListDetails(selectedRecordatorio?.usuarios);
            setFechasListDetails(selectedRecordatorio?.instancias.map(rec => rec.fecha.split('T')[0]));
            setOptionDetails('single');
            setSingleDateDetails('');
            setNumberDetails(1);
            setUnitDetails('día');
            setStartDateDetails('');
            setEndDateDetails('');
        } 
    }, [selectedRecordatorio]) // Carga los datos solamente si es que no hay datos persistidos y se seleccionó un recordatorio

    const [isOpeningViewer, setIsOpeningViewer] = useState(false);
    const [isLoading3, setIsLoading3] = useState(false);
    const [isDeletingRecordatorio, setIsDeletingRecordatorio] = useState(false);

    const onRowSelect = async (event) => {
        let successRetrieval = false;
        let data = null;
        try {
            setIsOpeningViewer(true);
            const url = `${apiEndpoint}/Recordatorios/${event.data.recordatorio.recordatorioId}`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                successRetrieval = true;
            }

            data = await response.json(); 

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al abrir el recordatorio`,
                life: 3000,
            });
        } finally {
            if (successRetrieval && data) {
                setSelectedRecordatorio(data);
                dispatch(toggleIsEditing({ objectName: `${nombrePadre}Details`, isEditingValue: true }));
            }
            setSelectedInstancia(null);
            setIsOpeningViewer(false);
        }
    };

    const handleAddUsuarioDetails = (e) => {
        e.preventDefault();
        if (selectedUsuarioDetails && !usuariosListDetails.some(usu => usu.idUsuario === selectedUsuarioDetails.idUsuario)) {
            setUsuariosListDetails([...usuariosListDetails, selectedUsuarioDetails]);
            setSelectedUsuarioDetails(null);
        }
    }; // Agrega un usuario a la lista de detalles
    const handleDeleteUsuarioDetails = (e, object) => {
        e.preventDefault();
        const updatedUsuarios = usuariosListDetails.filter((item) => item !== object);
        setUsuariosListDetails(updatedUsuarios);
    }; // Quita un usuario de la lista de detalles

    const handleOptionChangeDetails = (event) => {
        setOptionDetails(event.target.value);
    };
    const handleNumberChangeDetails = (e) => {
        const value = e.target.value;
        const number = parseInt(value, 10);

        if (isNaN(number) || number > 0) {
            setNumberDetails(number);
        } else {
            setNumberDetails(1); // Reset to 1 if the input is invalid
        }
    };
    const clearAllDatesDetails = () => {
        setFechasListDetails([]);
    };
    const removeDateDetails = (index) => {
        setFechasListDetails(prevDates => prevDates.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (numberDetails === 1) {
            switch (unitDetails) {
                case 'días':
                    setUnitDetails('día');
                    break;
                case 'semanas':
                    setUnitDetails('semana');
                    break;
                case 'meses':
                    setUnitDetails('mes');
                    break;
                case 'años':
                    setUnitDetails('año');
                    break;
                default:
                    break;
            }
        } else {
            switch (unitDetails) {
                case 'día':
                    setUnitDetails('días');
                    break;
                case 'semana':
                    setUnitDetails('semanas');
                    break;
                case 'mes':
                    setUnitDetails('meses');
                    break;
                case 'año':
                    setUnitDetails('años');
                    break;
                default:
                    break;
            }
        }
    }, [numberDetails, unitDetails]); // Cambia la unidad dependiendo del número elegido
    const generateDatesDetails = () => {
        let dates = [];
        let currentDate = new Date(startDateDetails); // Convert the date string to a Date object

        while (isBefore(currentDate, new Date(endDateDetails)) || isSameDay(currentDate, new Date(endDateDetails))) {
            dates.push(currentDate.toISOString().split('T')[0]); // Push the date string

            switch (unitDetails) {
                case 'día':
                case 'días':
                    currentDate = addDays(currentDate, numberDetails);
                    break;
                case 'semana':
                case 'semanas':
                    currentDate = addWeeks(currentDate, numberDetails);
                    break;
                case 'mes':
                case 'meses':
                    currentDate = addMonths(currentDate, numberDetails);
                    break;
                case 'año':
                case 'años':
                    currentDate = addYears(currentDate, numberDetails);
                    break;
                default:
                    break;
            }
        }

        // Check if endDate is already included in the dates array
        if (!dates.some(date => isSameDay(new Date(date), new Date(endDateDetails)))) {
            dates.push(endDateDetails); // Push the endDate string if not included
        }

        return dates;
    };

    const isValidRangeInputDetails = () => {
        return numberDetails > 0 && unitDetails && startDateDetails && endDateDetails;
    };
    const addDateDetails = () => {
        if (optionDetails === 'single') {
            if (singleDateDetails) {
                setFechasListDetails(prevDates => {
                    if (!prevDates.some(date => isSameDay(new Date(date), new Date(singleDateDetails)))) {
                        return [...prevDates, singleDateDetails].sort((a, b) => new Date(a) - new Date(b)); // Sort after adding
                    }
                    return prevDates;
                });
            } else {
                toast.current.show({ severity: 'warn', summary: 'Alerta', detail: 'Selecciona una fecha', life: 3000 });
            }
        } else { 
            if (!isValidRangeInputDetails()) {
                toast.current.show({ severity: 'warn', summary: 'Alerta', detail: 'Todos los campos deben estar llenos y el número debe ser positivo', life: 3000 });
                return;
            }
            if (!isBefore(startDateDetails, endDateDetails)) {
                toast.current.show({ severity: 'warn', summary: 'Alerta', detail: 'La fecha Desde, debe ser anterior a la fecha Hasta', life: 3000 });
                return;
            }
            // Use the generateDates logic
            const newDates = generateDatesDetails();
            setFechasListDetails(prevDates => {
                const combinedDates = [...prevDates, ...newDates];
                // Filter out duplicates and sort
                const uniqueDates = combinedDates.filter((date, index, self) =>
                    index === self.findIndex(d => isEqual(d, date))
                );
                return uniqueDates.sort((a, b) => new Date(a) - new Date(b));
            });
        }
    };

    const handleEditRecordatorio = async () => {

        if (descripcionDetails.trim() === '') {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: `El recordatorio no puede estar vacío`, // EDITABLE
                life: 3000,
            });
            return;
        }

        if (usuariosListDetails?.length === 0) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: `Debe seleccionar al menos un usuario`, // EDITABLE
                life: 3000,
            });
            return;
        }

        if (fechasListDetails?.length === 0) {
            toast.current.show({
                severity: 'warn',
                summary: 'Alerta',
                detail: `Debe seleccionar al menos una fecha`, // EDITABLE
                life: 3000,
            });
            return;
        }

        if (selectedRecordatorio) {
            try {
                setIsLoading3(true);
                const editedRecordatorio = {
                    descripcion: descripcionDetails,
                    idUsuarios: usuariosListDetails.map(usu => usu.idUsuario),
                    instancias: fechasListDetails.map(inst => ({fecha: inst, activo: true}))
                }

                await editRecordatorio(editedRecordatorio, selectedRecordatorio.recordatorioId); 

                // Show success toast
                toast.current.show({
                    severity: 'success',
                    summary: 'Recordatorio agregado',
                    detail: `El recordatorio se ha editado con éxito`,
                    life: 3000,
                });

                resetStatesDetails();
                deletePersistedStatesDetails();
                refreshTb();

            } catch (uploadError) {
                console.error(uploadError);

                // Show error toast
                toast.current.show({
                    severity: 'error',
                    summary: 'Error de carga',
                    detail: `Ha ocurrido un error al intentar editar el recordatorio`,
                    life: 3000,
                });
            } finally {
                setIsLoading3(false);
            }
        }
    }

    const handleGoTotable = () => {
        resetStatesDetails();
        deletePersistedStatesDetails();
    }

    const confirmDeletionRecordatorio = (event) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Todas las instancias se eliminarán',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteRecordatorio()
        });
    };

    const deleteRecordatorio = async () => {
        try {
            setIsDeletingRecordatorio(true);
            const url = `${apiEndpoint}/Recordatorios/${selectedRecordatorio.recordatorioId}`;
            const accessToken = await getAccessToken();
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Recordatorio eliminado correctamente`,
                life: 3000,
            });

            resetStatesDetails();
            deletePersistedStatesDetails();
            refreshTb();

        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Hubo un problema al eliminar el recordatorio`,
                life: 3000,
            });
        } finally {
            setIsDeletingRecordatorio(false);
            refreshTb();
        }
    };

    return (
        <div>
            <Toast ref={toast}></Toast>
            <div className="form-body form-body--create">
                <section>
                    <div className="form-group-label">
                        <i className="pi pi-bell"></i>
                        <label>{isAdding ? 'Ingresa un nuevo recordatorio' : 'Recordatorios'}</label>
                        <ToggleButton onLabel="Ver recordatorios" offLabel="Ingresar recordatorios" onIcon="pi pi-eye" offIcon="pi pi-bell"
                            checked={isAdding} onChange={(e) => setIsAdding(e.value)} className="recordatorios-toggle"/>
                    </div>
                    {
                        !isAdding ? (
                            <>
                                <div className={isEditing && "form-body-group recordatorio-body-group"} >
                                    {isEditing ? (
                                        <>
                                            <div className="form-group recordatorio-group--recordatorio">
                                                <div className="recordatorio-area">
                                                    <label>Recordatorio</label>
                                                    <textarea type="text" placeholder="Recordatorio (máx. 1000 caracteres)" maxLength="1000" value={descripcionDetails || ''} onChange={(e) => setDescripcionDetails(e.target.value)} />
                                                </div>
                                                <div className="usuarios-area">
                                                    <label>Usuarios</label>
                                                    <div className="form-group recordatorio-group--usuarios">
                                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', width: '100%' }}>
                                                            <div style={{ width: '100%' }}>
                                                                {
                                                                    errorU || !usuarios ? (
                                                                        <div className="dropdown-error">
                                                                            <div className="dropdown-error-msg">
                                                                                {isLoadingU || (isRefreshing && isValidatingU) ?
                                                                                    <div className="small-spinner" /> :
                                                                                    <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                            </div>
                                                                            <button className="rounded-icon-btn" onClick={refreshData}>
                                                                                <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <Dropdown
                                                                            style={{ width: '100%' }}
                                                                            value={selectedUsuarioDetails}
                                                                            onChange={(e) => setSelectedUsuarioDetails(e.value)}
                                                                            options={usuarios}
                                                                            optionLabel="nombre"
                                                                            placeholder="Selecciona un usuario"
                                                                            filter
                                                                            filterBy="nombre,apellido"
                                                                            virtualScrollerOptions={{ itemSize: 38 }}
                                                                            valueTemplate={selectedValueTemplateU}
                                                                            itemTemplate={optionTemplateU}
                                                                        />
                                                                    )
                                                                }

                                                            </div>
                                                            <button className='rounded-icon-btn' onClick={handleAddUsuarioDetails}>
                                                                <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                            </button>
                                                        </div>
                                                        <div>
                                                            <table className="table-list">
                                                                <thead>
                                                                    <tr className="table-head">
                                                                        <th>Usuarios agregados</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {usuariosListDetails?.map((usuario, index) => {
                                                                        return (
                                                                            <tr className="table-row" key={index}>
                                                                                <td className="table-nombre-abogado">
                                                                                    <strong>{`${usuario.nombre} ${usuario.apellido}`}</strong>  {`(${usuario.correo})`}
                                                                                </td>
                                                                                <td className="table-delete-button">
                                                                                    <button className="rounded-icon-btn" onClick={(e) => handleDeleteUsuarioDetails(e, usuario)}>
                                                                                        <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}

                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <label style={{ marginLeft: '5px' }}>Fechas del recordatorio:</label>
                                            <div className="form-group recordatorio-group--fechas">
                                                <div className="single-group">
                                                    <div className="fecha-radio">
                                                        <RadioButton
                                                            name="dateOptionDetails"
                                                            value="single"
                                                            onChange={handleOptionChangeDetails}
                                                            checked={optionDetails === 'single'} />
                                                    </div>
                                                    <div className="fecha-single-form">
                                                        <input readOnly={optionDetails === 'single' ? false : true} type="date" value={singleDateDetails}
                                                            onChange={(e) => setSingleDateDetails(e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="range-group">
                                                    <div className="fecha-radio">
                                                        <RadioButton
                                                            name="dateOptionDetails"
                                                            value="range"
                                                            checked={optionDetails === 'range'}
                                                            onChange={handleOptionChangeDetails}
                                                        />
                                                    </div>
                                                    <div className="fecha-range-form">
                                                        <div className="fecha-range-form-section">
                                                            <p className={`${optionDetails === 'single' && 'disabled'}`}>Cada: </p>
                                                            <input readOnly={optionDetails === 'single' ? true : false} type="number" min="1" value={numberDetails} onChange={handleNumberChangeDetails} /> 
                                                            <Dropdown
                                                                disabled={optionDetails === 'single' ? true : false}
                                                                value={unitDetails}
                                                                onChange={(e) => setUnitDetails(e.target.value)}
                                                                options={unitsDetails}
                                                                placeholder="unidad de tiempo"
                                                            />
                                                        </div>
                                                        <div className="fecha-range-form-section">
                                                            <p className={`${optionDetails === 'single' && 'disabled'}`}>Desde: </p>
                                                            <input readOnly={optionDetails === 'single' ? true : false} type="date" value={startDateDetails}
                                                                onChange={(e) => setStartDateDetails(e.target.value)} />
                                                            <p className={`${optionDetails === 'single' && 'disabled'}`}>Hasta: </p>
                                                            <input readOnly={optionDetails === 'single' ? true : false} type="date" value={endDateDetails}
                                                                onChange={(e) => setEndDateDetails(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="fecha-botones">
                                                    <button className="form-delete-btn recordatorios-dates-btns" disabled={fechasListDetails?.length === 0 ? true : false} onClick={clearAllDatesDetails}>
                                                        <i className="pi pi-calendar-times"></i>
                                                        <span>Descartar</span>
                                                    </button>
                                                    <button className="form-accept-btn recordatorios-dates-btns" onClick={addDateDetails}>
                                                        <i className="pi pi-calendar-plus"></i>
                                                        <span>Agregar</span>
                                                    </button>
                                                </div>
                                                <div className="fecha-tabla">
                                                    <table className="table-list">
                                                        <thead>
                                                            <tr className="table-head">
                                                                <th>Fechas agregadas</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fechasListDetails?.map((date, index) => {
                                                                const dateParts = date.split('-');
                                                                return (
                                                                    <tr className="table-row" key={index}>
                                                                        <td className="table-nombre-abogado">
                                                                            <strong>{`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`}</strong>  {`(${formatDate(date)}, ${getSpanishDayOfWeek(date)})`}
                                                                        </td>
                                                                        <td className="table-delete-button">
                                                                            <button className="rounded-icon-btn" onClick={() => removeDateDetails(index)}>
                                                                                <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div className="recordatorio-other-btns" style={{ margin: '0 0 0 6px' }}>
                                                    <button className="form-cancel-btn" onClick={handleGoTotable}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>   
                                                    {(isDeletingRecordatorio) ? 
                                                        <div className="spinner-container--recordatorios" style={{ minWidth: '130px' }}>
                                                            <div className="small-spinner" />
                                                        </div> :
                                                        <div className="recordatorio-edit-btns">
                                                            <button className="form-delete-btn" onClick={(e) => confirmDeletionRecordatorio(e)} style={{ minWidth: '130px' }}>
                                                                Eliminar recordatorio
                                                            </button>
                                                        </div>
                                                    }
                                                    {(isLoading3) ?
                                                        <div className="spinner-container--recordatorios" style={{ minWidth: '120px', margin: '0 6px 0 auto' }}>
                                                            <div className="small-spinner" />
                                                        </div> :
                                                        <div className="recordatorio-edit-btns" style={{ margin: '0 6px 0 auto' }}>
                                                            <button className="form-accept-btn" onClick={handleEditRecordatorio}>
                                                                Editar recordatorio
                                                            </button>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </>
                                        ) : (
                                        <>
                                            <div className="tabla tabla-documentos">
                                                {(isLoadingTb || isDeleting || isOpeningViewer) &&
                                                    <div className="spinner-container">
                                                        <div className="spinner" />
                                                    </div>
                                                }
                                                <DataTable
                                                    value={recordatoriosTabla}
                                                    header={header}
                                                    removableSort
                                                    scrollable
                                                    scrollHeight={isEditing ? '100px' : '380px'}
                                                    size="small"
                                                    emptyMessage={`No se encontraron recordatorios `}
                                                    dataKey="instanciasRecordatorioId"
                                                    selectionMode="single"
                                                    sortField="fecha"
                                                    sortOrder={1}
                                                    selection={selectedInstancia}
                                                    onSelectionChange={(e) => setSelectedInstancia(e.value)}
                                                    onRowSelect={onRowSelect}>

                                                    <Column style={{ minWidth: '230px' }} body={fechaBodyTemplate} header="Fecha"></Column>
                                                    <Column body={recordatorioBodyTemplate} header="Recordatorio"></Column>
                                                    <Column body={actionsTemplate} header="Acciones"></Column>
                                                </DataTable>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-body-group recordatorio-body-group">
                                    <div className="form-group recordatorio-group--recordatorio">
                                        <div className="recordatorio-area">
                                            <label>Recordatorio</label>
                                            <textarea type="text" placeholder="Recordatorio (máx. 1000 caracteres)" maxLength="1000" value={recordatorioData.descripcion || ''} onChange={(e) => setRecordatorioData({
                                                ...recordatorioData,
                                                descripcion: e.target.value
                                            })} />
                                        </div>
                                        <div className="usuarios-area">
                                            <label>Usuarios</label>
                                            <div className="form-group recordatorio-group--usuarios">
                                                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', width: '100%' }}>
                                                    <div style={{ width: '100%' }}>
                                                        {
                                                            errorU || !usuarios ? (
                                                                <div className="dropdown-error">
                                                                    <div className="dropdown-error-msg">
                                                                        {isLoadingU || (isRefreshing && isValidatingU) ?
                                                                            <div className="small-spinner" /> :
                                                                            <span>Ocurrió un error: sin opciones disponibles</span>}
                                                                    </div>
                                                                    <button className="rounded-icon-btn" onClick={refreshData}>
                                                                        <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <Dropdown
                                                                    style={{ width: '100%' }}
                                                                    value={selectedUsuario}
                                                                    onChange={(e) => setSelectedUsuario(e.value)}
                                                                    options={usuarios}
                                                                    optionLabel="nombre"
                                                                    placeholder="Selecciona un usuario"
                                                                    filter
                                                                    filterBy="nombre,apellido"
                                                                    virtualScrollerOptions={{ itemSize: 38 }}
                                                                    valueTemplate={selectedValueTemplateU}
                                                                    itemTemplate={optionTemplateU}
                                                                />
                                                            )
                                                        }

                                                    </div>
                                                    <button className='rounded-icon-btn' onClick={handleAddUsuario}>
                                                        <i className="pi pi-user-plus" style={{ color: 'white', fontSize: '16px' }}></i>
                                                    </button>
                                                </div>
                                                <div>
                                                    <table className="table-list">
                                                        <thead>
                                                            <tr className="table-head">
                                                                <th>Usuarios agregados</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {usuariosList.map((usuario, index) => {
                                                                return (
                                                                    <tr className="table-row" key={index}>
                                                                        <td className="table-nombre-abogado">
                                                                            <strong>{`${usuario.nombre} ${usuario.apellido}`}</strong>  {`(${usuario.correo})`}
                                                                        </td>
                                                                        <td className="table-delete-button">
                                                                            <button className="rounded-icon-btn" onClick={(e) => handleDeleteUsuario(e, usuario)}>
                                                                                <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <label style={{marginLeft: '5px'}}>Fechas del recordatorio:</label>
                                    <div className="form-group recordatorio-group--fechas">
                                        <div className="single-group">
                                            <div className="fecha-radio">
                                                <RadioButton
                                                    name="dateOption"
                                                    value="single"
                                                    onChange={handleOptionChange}
                                                    checked={option === 'single'} />
                                            </div>
                                            <div className="fecha-single-form">
                                                <input readOnly={option === 'single' ? false : true} type="date" value={singleDate}
                                                    onChange={(e) => setSingleDate(e.target.value)}  />
                                            </div>
                                        </div>
                                        <div className="range-group">
                                            <div className="fecha-radio">
                                                <RadioButton
                                                    name="dateOption"
                                                    value="range"
                                                    checked={option === 'range'}
                                                    onChange={handleOptionChange}
                                                />
                                            </div>
                                            <div className="fecha-range-form">
                                                <div className="fecha-range-form-section">
                                                    <p className={`${option === 'single' && 'disabled'}`}>Cada: </p>
                                                    <input readOnly={option === 'single' ? true : false} type="number" min="1" value={number} onChange={handleNumberChange} />
                                                    <Dropdown
                                                        disabled={option === 'single' ? true : false}
                                                        value={unit}
                                                        onChange={(e) => setUnit(e.target.value)}
                                                        options={units}
                                                        placeholder="unidad de tiempo"
                                                    />
                                                </div>
                                                <div className="fecha-range-form-section">
                                                    <p className={`${option === 'single' && 'disabled'}`}>Desde: </p>
                                                    <input readOnly={option === 'single' ? true : false} type="date" value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)} />
                                                    <p className={`${option === 'single' && 'disabled'}`}>Hasta: </p>
                                                    <input readOnly={option === 'single' ? true : false} type="date" value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="fecha-botones">
                                                <button className="form-delete-btn recordatorios-dates-btns" disabled={fechasList?.length === 0 ? true : false} onClick={clearAllDates}>
                                                    <i className="pi pi-calendar-times"></i>
                                                    <span>Descartar</span>
                                                </button>
                                                <button className="form-accept-btn recordatorios-dates-btns" onClick={addDate}>
                                                    <i className="pi pi-calendar-plus"></i>
                                                    <span>Agregar</span>
                                                </button>
                                        </div>
                                        <div className="fecha-tabla">
                                            <table className="table-list">
                                                <thead>
                                                    <tr className="table-head">
                                                        <th>Fechas agregadas</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {fechasList.map((date, index) => {
                                                        const dateParts = date.split('-');
                                                        return (
                                                            <tr className="table-row" key={index}>
                                                                <td className="table-nombre-abogado">
                                                                    <strong>{`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`}</strong>  {`(${formatDate(date)}, ${getSpanishDayOfWeek(date)})`}
                                                                </td>
                                                                <td className="table-delete-button">
                                                                    <button className="rounded-icon-btn" onClick={() => removeDate(index)}>
                                                                        <i className="pi pi-delete-left" style={{ color: 'white', fontSize: '16px' }}></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {
                                        (isLoading2) ?
                                                <div className="spinner-container--recordatorios" style={{ minWidth: '170px', margin: '0 6px 0 auto' }}>
                                                    <div className="small-spinner" />
                                                </div> :
                                        <div className="recordatorio-create-btns" style={{ margin: '0 6px 0 auto' }}>
                                            <button className="form-accept-btn" onClick={handleAddRecordatorio}>
                                                Ingresar nuevo recordatorio
                                            </button>
                                        </div>
                                    }
                                </div>
                            </>
                        )}
                </section>
            </div>
        </div>
    )
}

export default RecordatorioHandler