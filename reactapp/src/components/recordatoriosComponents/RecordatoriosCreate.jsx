import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';

// Auth
import { useMsal } from '@azure/msal-react';

// Services
import { useRecordatorios } from '../../services/useRecordatorios'; // Para la creación de recordatorios
import { useUsuarios } from '../../services/useUsuarios'; // Para el dropdown de usuarios
import { useInstanciasRecordatorios } from '../../services/useInstanciasRecordatorio'; // Para refrescar los recordatorios

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData } from '../../context/recordatorioSectionSlice'; 

// Dates logic
import { addDays, addWeeks, addMonths, addYears, isBefore, isEqual, startOfDay, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

function RecordatoriosCreate({ onClose }) { //EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const recordatorioCreateData = useSelector(state => state.recordatorioSection.RecordatorioCreate); // EDITABLE

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    // Auth
    const { instance, accounts } = useMsal();
    const { uploadRecordatorio } = useRecordatorios();
    const { refresh: refreshInstancias } = useInstanciasRecordatorios();
    const isClosingRef = useRef(false); // Referencia para eliminar persistencia: EDITABLE
    const toast = useRef(null); // Referencia para el toast: GENERAL

    const { usuarios, error: errorU, isLoading: isLoadingU, isValidating: isValidatingU, refresh: refreshU } = useUsuarios(); // Para el dropdown de usuarios

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const defaultRecordatorioData = {
        descripcion: '',
        instancias: [],
        idUsuarios: [],
    }
    const defaultRequiredFields = {
        descripcion: false,
        instancias: false,
        idUsuarios: false,
    }; 
    const [isLoading2, setIsLoading2] = useState(false); // Loader para la creación
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // --------------- Estados que requieren persistencia --------------------------------------------

    const [isAnyEmpty, setisAnyEmpty] = useState(false); //Saber si hay campos vacíos: GENERAL
    const [requiredFields, setRequiredFields] = useState(defaultRequiredFields); // mapea los inputs requeridos: GENERAL

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

    const units = number === 1 ? ['día', 'semana', 'mes', 'año'] : ['días', 'semanas', 'meses', 'años'];

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (recordatorioCreateData) {
            setisAnyEmpty(recordatorioCreateData.isAnyEmpty || false); 
            setRequiredFields(recordatorioCreateData.requiredFields || defaultRequiredFields); 

            setRecordatorioData(recordatorioCreateData.recordatorioData || defaultRecordatorioData);
            setSelectedUsuario(recordatorioCreateData.selectedUsuario || null);
            setUsuariosList(recordatorioCreateData.usuariosList || []);
            setFechasList(recordatorioCreateData.fechasList || []);
            setOption(recordatorioCreateData.option || 'single');
            setSingleDate(recordatorioCreateData.singleDate || '');

            setNumber(recordatorioCreateData.number || 1);
            setUnit(recordatorioCreateData.unit || 'día');
            setStartDate(recordatorioCreateData.startDate || '');
            setEndDate(recordatorioCreateData.endDate || '');

        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: GENERAL
    const saveState = () => {
        dispatch(saveData({ objectName: 'RecordatorioCreate', value: { isAnyEmpty, requiredFields, recordatorioData, selectedUsuario, usuariosList, fechasList, option, singleDate, number, unit, startDate, endDate  } }));
    }; // Guarda en el contexto los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, requiredFields, recordatorioData, selectedUsuario, usuariosList, fechasList, option, singleDate, number, unit, startDate, endDate]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(deleteData({ objectName: 'RecordatorioCreate' })); // EDITABLE
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO
    const resetStates = () => {

        setisAnyEmpty(false);
        setRequiredFields(defaultRequiredFields);

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

    const handleAddRecordatorio = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo requerido vacío
        const anyFieldEmpty = validateRequiredFields(recordatorioData);

        if (anyFieldEmpty) {
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        try {
            setIsLoading2(true);

            const userData = sessionStorage.getItem('userData');
            let userId;

            if (userData) {
                const parsedData = JSON.parse(userData);
                userId = parsedData.idUsuario;
            } else {
                console.error('User data not found in sessionStorage');
                userId = null;
            }


            await uploadRecordatorio(recordatorioData, userId, "usuario");

            // Show success toast
            toast.current.show({
                severity: 'success',
                summary: 'Recordatorio agregado',
                detail: `El recordatorio se ha agregado con éxito`,
                life: 3000,
            });

            resetStates();
            refreshInstancias();

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
        
    }; // Maneja la creación del objeto: ESPECIFICO

    /* CONTINUAR AQUÍ */

    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates();
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
                <div className="form-container wide-form">
                    {(isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <section className="form-header">
                        <span>Crear nuevo recordatorio</span> 
                        <div className="form-header-buttons">
                            <Button className="form-header-btn" onClick={handleMinimize}>
                                <i className="pi pi-minus" style={{ fontSize: '0.6rem', color:'var(--secondary-blue)',fontWeight: '800' }}></i>
                            </Button>
                            <Button className="form-header-btn" onClick={handleCancel}>
                                <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                            </Button>
                        </div>
                    </section>
                    <div className="form-body-group recordatorio-body-group rec-create-details">
                        <div className="form-group recordatorio-group--recordatorio">
                            <div className="recordatorio-area">
                                <label>Recordatorio <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <textarea className={`${requiredFields.descripcion && 'form-group-empty'}`} type="text" placeholder="Recordatorio (máx. 1000 caracteres)" maxLength="1000" value={recordatorioData.descripcion || ''} onChange={(e) => setRecordatorioData({
                                    ...recordatorioData,
                                    descripcion: e.target.value
                                })} />
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
                                <button className="form-delete-btn recordatorios-dates-btns" disabled={fechasList?.length === 0 ? true : false} onClick={clearAllDates}>
                                    <i className="pi pi-calendar-times"></i>
                                    <span>Descartar</span>
                                </button>
                                <button className={`form-accept-btn recordatorios-dates-btns ${requiredFields.instancias && 'form-group-empty'}`} onClick={addDate}>
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
                    </div>
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
                        <button type="submit" className="form-accept-btn" onClick={handleAddRecordatorio}>Crear</button>
                    </section>
                </div>
            </Draggable>
            <Toast ref={toast} />
        </>
    );
}

export default RecordatoriosCreate;