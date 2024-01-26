import React, { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import Draggable from 'react-draggable';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { RadioButton } from 'primereact/radiobutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

// Auth
import { useMsal } from '@azure/msal-react';

// Services
import { useRecordatorios } from '../../services/useRecordatorios'; // Para la creación de recordatorios
import { useUsuarios } from '../../services/useUsuarios'; // Para el dropdown de usuarios
import { useInstanciasRecordatorios } from '../../services/useInstanciasRecordatorio'; // Para refrescar los recordatorios
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Recordatorios`;

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsEditing } from '../../context/recordatorioSectionSlice'; 

// Dates logic
import { addDays, addWeeks, addMonths, addYears, isBefore, isEqual, startOfDay, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

function RecordatorioDetails(props) { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const recordatorioDetailsData = useSelector(state => state.recordatorioSection.RecordatorioDetails); // EDITABLE
    const isEditing = useSelector(state => state.recordatorioSection.isEditing); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    // Auth
    const { instance, accounts } = useMsal();
    const { editRecordatorio, deleteRecordatorio } = useRecordatorios();
    const { refresh: refreshInstancias } = useInstanciasRecordatorios();

    const toast = useRef(null); // GENERAL
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE

    const getAccessToken = async () => {
        try {
            const accessTokenRequest = {
                scopes: ["api://corralrosales.com/kattion/tasks.write", "api://corralrosales.com/kattion/tasks.read"], // Para leer y escribir tareas
                account: accounts[0],
            };
            const response = await instance.acquireTokenSilent(accessTokenRequest);
            return response.accessToken;
        } catch (e) {
            // Handle token acquisition errors
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

    const { data: recordatorioData, error, isLoading } = useSWR(`${API_BASE_URL}/${props.recordatorioId}`, fetcher); // SWR para los datos: EDITABLE

    const prevRecordatorioIdRef = useRef(props.recordatorioId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const defaultRequiredFields = {
        descripcion: false,
        instancias: false,
        idUsuarios: false,
    }; 
    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { usuarios, error: errorU, isLoading: isLoadingU, isValidating: isValidatingU, refresh: refreshU } = useUsuarios(); // Para el dropdown de usuarios

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isAnyEmpty, setisAnyEmpty] = useState(false); // Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // Mapea los inputs requeridos: ESPECIFICO

    // Estados que requieren persistencia
    const [descripcion, setDescripcion] = useState('');
    const [selectedUsuario, setSelectedUsuario] = useState(null); // mapea el usuario que será añadido a la lista
    const [usuariosList, setUsuariosList] = useState([]); // mapea los usuarios que serán añadidos
    const [fechasList, setFechasList] = useState([]); // mapea las fechas de las instancias del recordatorio
    const [option, setOption] = useState('single'); // 'single' or 'range'
    const [singleDate, setSingleDate] = useState('');

    // Estados de la lógica de fechas
    const [number, setNumber] = useState(1);
    const [unit, setUnit] = useState('día');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const units = number === 1 ? ['día', 'semana', 'mes', 'año'] : ['días', 'semanas', 'meses', 'años'];

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (recordatorioDetailsData) {
            setisAnyEmpty(recordatorioDetailsData.isAnyEmpty || false);
            setRequiredFields(recordatorioDetailsData.requiredFields || defaultRequiredFields);

            setDescripcion(recordatorioDetailsData.descripcion || '');
            setSelectedUsuario(recordatorioDetailsData.selectedUsuario || null);
            setUsuariosList(recordatorioDetailsData.usuariosList || []);
            setFechasList(recordatorioDetailsData.fechasList || []);
            setOption(recordatorioDetailsData.option || 'single');
            setSingleDate(recordatorioDetailsData.singleDate || '');

            setNumber(recordatorioDetailsData.number || 1);
            setUnit(recordatorioDetailsData.unit || 'día');
            setStartDate(recordatorioDetailsData.startDate || '');
            setEndDate(recordatorioDetailsData.endDate || '');
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'RecordatorioDetails', value: { isAnyEmpty, requiredFields, descripcion, selectedUsuario, usuariosList, fechasList, option, singleDate, number, unit, startDate, endDate } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, requiredFields, descripcion, selectedUsuario, usuariosList, fechasList, option, singleDate, number, unit, startDate, endDate, isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(setIsEditing(false));
        dispatch(deleteData({ objectName: 'RecordatorioDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        if (props.recordatorioId !== prevRecordatorioIdRef.current) {
            if (recordatorioData) {
                setDescripcion(recordatorioData?.descripcion);
                setSelectedUsuario(null);
                setUsuariosList(recordatorioData?.usuarios);
                setFechasList(recordatorioData?.instancias?.map(rec => rec.fecha.split('T')[0]));
                setOption('single');
                setSingleDate('');
                setNumber(1);
                setUnit('día');
                setStartDate('');
                setEndDate('');

                setisAnyEmpty(false);
                setRequiredFields(defaultRequiredFields);
                prevRecordatorioIdRef.current = props.recordatorioId;
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
                    setDescripcion(recordatorioData?.descripcion);
                    setSelectedUsuario(null);
                    setUsuariosList(recordatorioData?.usuarios);
                    setFechasList(recordatorioData?.instancias?.map(rec => rec.fecha.split('T')[0]));
                    setOption('single');
                    setSingleDate('');
                    setNumber(1);
                    setUnit('día');
                    setStartDate('');
                    setEndDate('');

                    setisAnyEmpty(false);
                    setRequiredFields(defaultRequiredFields);
                }
            }
        }
    }, [recordatorioData, isEditing, props.recordatorioId]); // useEffect para escuchar cambios en abogadoData y mapearlos al objeto, solo si no se está editando: ESPECIFICO

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


    // --------------- Añadir el recordatorio ------------------------------------------

    const isEmptyValue = value => {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }; // Verifica si un valor específico está vacío

    const validateRequiredFields = (recordatorio) => {
        const updatedRequiredFields = { ...defaultRequiredFields };

        // Iterate over the required field keys
        Object.keys(updatedRequiredFields).forEach(key => {
            updatedRequiredFields[key] = isEmptyValue(recordatorio[key]);
        });

        setRequiredFields(updatedRequiredFields);

        // Return true if any of the required fields is empty
        return Object.values(updatedRequiredFields).some(value => value);
    }; // Valida que los campos en REQUIRED_FIELDS no estén vacíos en el nuevo objeto

    const confirmDeletion = (event) => {
        confirmPopup({
            target: event.currentTarget,
            message: '¿Estás seguro? Todas las instancias se eliminarán',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => handleDelete()
        });
    }; // Maneja la confirmación para eliminar o no: GENERAL

    const handleDelete = async (e) => {
        try {
            setIsLoading2(true);
            const response = await deleteRecordatorio(props.recordatorioId);
            if (response === 204) {
                deletePersistedStates();
                props.onDeleted()
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al eliminar el recordatorio',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la eliminación del objeto: ESPECIFICO

    
    const handleEdit = async (e) => {
        e.preventDefault();

        // Crear el recordatorio que será editado
        const NewRecordatorio = {
            idUsuarios: usuariosList?.map(usu => usu.idUsuario),
            instancias: fechasList?.map(fecha => {
                // Check if the date exists in the original instancias from the database
                const existingInstance = recordatorioData?.instancias?.find(inst => inst.fecha.split('T')[0] === fecha);

                if (existingInstance) {
                    // Use the existing 'activo' attribute for instances from the database
                    return { fecha, activo: existingInstance.activo };
                } else {
                    // For new instances, set 'activo' to true
                    return { fecha, activo: true };
                }
            }),
            descripcion: descripcion
        }

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(NewRecordatorio);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }


        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const response = await editRecordatorio(NewRecordatorio, props.recordatorioId); 

            if (response === 204) {
                deletePersistedStates();
                props.onEdited();
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Ha ocurrido un error al intentar editar el recordatorio',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
            refreshInstancias();
        }

    }; // Maneja la edición del objeto: ESPECIFICO (Hay que tener ciudado con el ID)

    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates();
        props.onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea, table" bounds="parent">
                <div className="form-container wide-form">
                    {(isLoading || isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>Editar recordatorio</span>
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
                    <div className="form-body-group recordatorio-body-group rec-create-details">
                        <div className="form-group recordatorio-group--recordatorio">
                            <div className="recordatorio-area">
                                <label>Recordatorio <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <textarea readOnly={!isEditing}
                                    className={`${requiredFields.descripcion && 'form-group-empty'}`}
                                    type="text" placeholder="Recordatorio (máx. 1000 caracteres)"
                                    maxLength="1000" value={descripcion || ''}
                                    onChange={(e) => setDescripcion(e.target.value)} />
                            </div>
                            <div className="usuarios-area">
                                <label>Usuarios <small className="requiredAsterisk">(Obligatorio)</small></label>
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
                                                        className={`${requiredFields.idUsuarios && 'form-group-empty'}`}
                                                        disabled={!isEditing}
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
                                        <button disabled={!isEditing} className='rounded-icon-btn' onClick={handleAddUsuario}>
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
                                                {usuariosList?.map((usuario, index) => {
                                                    return (
                                                        <tr className="table-row" key={index}>
                                                            <td className="table-nombre-abogado">
                                                                <strong>{`${usuario.nombre} ${usuario.apellido}`}</strong>  {`(${usuario.correo})`}
                                                            </td>
                                                            <td className="table-delete-button">
                                                                <button disabled={!isEditing} className="rounded-icon-btn" onClick={(e) => handleDeleteUsuario(e, usuario)}>
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
                        <label style={{ marginLeft: '5px' }}>Fechas del recordatorio <small className="requiredAsterisk">(Obligatorio)</small>:</label>
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
                                        onChange={(e) => setSingleDate(e.target.value)} />
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
                                <button disabled={isEditing ? (fechasList?.length === 0 ? true : false) : true} className="form-delete-btn recordatorios-dates-btns" onClick={clearAllDates}>
                                    <i className="pi pi-calendar-times"></i>
                                    <span>Descartar</span>
                                </button>
                                <button disabled={!isEditing} className={`form-accept-btn recordatorios-dates-btns ${requiredFields.instancias && 'form-group-empty'}`} onClick={addDate}>
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
                                        {fechasList?.map((date, index) => {
                                            const dateParts = date.split('-');
                                            return (
                                                <tr className="table-row" key={index}>
                                                    <td className="table-nombre-abogado">
                                                        <strong>{`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`}</strong>  {`(${formatDate(date)}, ${getSpanishDayOfWeek(date)})`}
                                                    </td>
                                                    <td className="table-delete-button">
                                                        <button disabled={!isEditing} className="rounded-icon-btn" onClick={() => removeDate(index)}>
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
                </div>
            </Draggable>
            <Toast ref={toast} />
            <ConfirmPopup />
        </>
    );
}

export default RecordatorioDetails;