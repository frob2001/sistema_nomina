import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveData, deleteData, setIsEditing } from '../../../context/estadoSlice'; // EDITABLE
import useSWR from 'swr';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { ToggleButton } from 'primereact/togglebutton';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useEstados } from '../../../services/useEstados'; // EDITABLE
import { useTiposEstados } from '../../../services/useTiposEstados'; // EDITABLE
const apiEndpoint = import.meta.env.VITE_MAIN_ENDPOINT;
const API_BASE_URL = `${apiEndpoint}/Estados`;

// Auth
import { useMsal } from '@azure/msal-react';

function EstadosDetails(props) { // EDITABLE

    // --------------- Redux store settings -------------------------------------------------------

    const dispatch = useDispatch();
    const estadoDetails = useSelector(state => state.estado.EstadoDetails); // EDITABLE
    const isEditing = useSelector(state => state.estado.isEditing); // EDITABLE
    const { tiposEstados, error: errorTE, isLoading: isLoadingTE, isValidating: isValidatingTE, refresh: refreshTE } = useTiposEstados(); // EDITABLE
    const [sortedTiposEstados, setSortedTiposEstados] = useState(tiposEstados);

    // --------------- Setup (Servicios, Contextos, Referencias) -----------------------------------

    // Auth
    const { instance, accounts } = useMsal();
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
    const { data: estadoData, error, isLoading } = useSWR(`${API_BASE_URL}/${props.estadoId}`, fetcher); // SWR para los datos: EDITABLE
    const { deleteEstado, updateEstado } = useEstados(); // Servicio necesario: EDITABLE
    const prevEstadoIdRef = useRef(props.estadoId); // Referencia para saber si el usuario selecciona otro objeto: EDITABLE

    // --------------- Estados que no requieren persistencia --------------------------------------------

    const [isLoading2, setIsLoading2] = useState(false);
    const [isRefreshingTE, setIsRefreshingTE] = useState(false);
    const colorOptions = [
        { name: "Negro", value: "#2D3748" },
        { name: "Rojo", value: "#E53E3E" },
        { name: "Verde", value: "#2F855A" },
        { name: "Azul", value: "#2B6CB0" },
        { name: "Amarillo", value: "#D69E2E" },
        { name: "Naranja", value: "#DD6B20" },
        { name: "Púrpura", value: "#6B46C1" },
        { name: "Cian", value: "#319795" },
        { name: "Marrón", value: "#975A16" },
        { name: "Rosa", value: "#D53F8C" }
    ];
    const defaultEstado = {
        codigo: '',
        descripcionEspanol: '',
        descripcionIngles: '',
        color: '#2D3748',
        tipoEstadoId: '',
    }; //EDITABLE
    const defaultEmptyFields = {
        codigo: false,
        descripcionEspanol: false,
        descripcionIngles: false,
        tipoEstado: false,
    }; // EDITABLE

    // --------------- Estados que requieren persistencia --------------------------------------------

    const [selectedTipoEstado, setSelectedTipoEstado] = useState(estadoData?.tipoEstado); // saber el tipo de estado seleccionado: ESPECIFICO
    const [selectedColor, setSelectedColor] = useState(estadoData?.color); // saber el color seleccionado: ESPECIFICO
    const [isAnyEmpty, setisAnyEmpty] = useState(false); // Saber si hay campos vacíos: GENERAL
    const [emptyFields, setEmptyFields] = useState(defaultEmptyFields); // Mapea los inputs requeridos: ESPECIFICO
    const [estado, setEstado] = useState({}); // Tiene el objeto seleccionado: ESPECIFICO

    // --------------- Funciones necesarias para persistencia ----------------------------------------

    useEffect(() => {
        if (estadoDetails) {
            setSelectedTipoEstado(estadoDetails.selectedTipoEstado || estadoData?.tipoEstado); // EDITABLE
            setSelectedColor(estadoDetails.selectedColor || colorOptions[0]); // EDITABLE
            setisAnyEmpty(estadoDetails.isAnyEmpty || false); // EDITABLE
            setEstado(estadoDetails.estado || defaultEstado); // EDITABLE
            setEmptyFields(estadoDetails.emptyFields || defaultEmptyFields); // EDITABLE
        }
    }, []); // Se ejecuta cuando el componente renderiza, lee los datos guardados: ESPECIFICO
    const saveState = () => {
        dispatch(saveData({ objectName: 'EstadoDetails', value: { isAnyEmpty, estado, emptyFields, selectedTipoEstado, selectedColor } }));
    }; // Guarda en el store los estados como objetos: ESPECIFICO
    useEffect(() => {
        return () => {
            if (!isClosingRef.current) {
                saveState();
            }
        };
    }, [isAnyEmpty, estado, emptyFields, selectedTipoEstado, selectedColor , isEditing]); // Se ejecuta con cada cambio de estado, persiste los datos: ESPECIFICO -> PUEDE OPTIMIZARSE
    const deletePersistedStates = () => {
        dispatch(setIsEditing(false));
        dispatch(deleteData({ objectName: 'EstadoDetails' }));
    }; // Elimina los datos en el objeto del contexto: ESPECIFICO

    // --------------- Funciones especificas del componente ------------------------------------------

    useEffect(() => {
        if (tiposEstados) {
            const sortedOptions = tiposEstados.sort((a, b) => a.tipoEstadoId - b.tipoEstadoId);
            setSortedTiposEstados([...sortedOptions]);
        }
    }, [tiposEstados]);

    const refreshDataTE = (e) => {
        e.preventDefault();
        setIsRefreshingTE(true);
        refreshTE();
    }; // Refresca los datos: GENERAL
    useEffect(() => {
        if (isRefreshingTE) {
            setIsRefreshingTE(false);
        }
    }, [isValidatingTE]); // Cambia el estado de refreshing: GENERAL
    useEffect(() => {
        if (selectedTipoEstado) {
            setEstado(prevEstado => ({
                ...prevEstado,
                tipoEstado: selectedTipoEstado
            }));
        }
    }, [selectedTipoEstado]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO
    useEffect(() => {
        if (selectedColor) {
            setEstado(prevEstado => ({
                ...prevEstado,
                color: selectedColor
            }));
        }
    }, [selectedColor]); // Actualiza el objeto cuando el valor del dropdown cambia (hacer uno por cada dropdown): ESPECIFICO
    useEffect(() => {
        if (props.estadoId !== prevEstadoIdRef.current) {
            if (estadoData) {
                setEstado(estadoData); // EDITABLE
                setSelectedColor(estadoData.color);
                setSelectedTipoEstado(estadoData.tipoEstado);
                setisAnyEmpty(false);
                setEmptyFields(defaultEmptyFields);
                prevEstadoIdRef.current = props.estadoId;
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
                    if (estadoData) {
                        setEstado(estadoData); // EDITABLE
                        setSelectedColor(estadoData.color);
                        setSelectedTipoEstado(estadoData.tipoEstado);
                        setisAnyEmpty(false);
                        setEmptyFields(defaultEmptyFields);
                    }
                }
            }
        }
    }, [estadoData, isEditing, props.estadoId]); // useEffect para escuchar cambios en estadooData y mapearlos al objeto, solo si no se está editando: ESPECIFICO
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Only update the state if the input is not 'codigo' or if it is 'codigo' and the value matches the allowed pattern
        if (name !== 'codigo' || (name === 'codigo' && /^[0-9.]*$/.test(value))) {
            const updatedEmptyFields = { ...emptyFields };
            updatedEmptyFields[name] = false;
            setEmptyFields(updatedEmptyFields);

            setEstado({ ...estado, [name]: value });
        }
    }; // Maneja el cambio en un input: ESPECIFICO
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
            const response = await deleteEstado(props.estadoId);
            if (response === 204) {
                deletePersistedStates();
                props.onDeleted()
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al eliminar el estado',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la eliminación del objeto: ESPECIFICO
    const isAnyFieldEmpty = () => {
        const valuesArray = Object.values(estado);
        return valuesArray.some(value => {
            // First, check if the value is null or undefined
            if (value === null || value === undefined) {
                return true;
            }
            // If the value is a string, use trim to check if it's empty
            if (typeof value === 'string') {
                return value.trim() === '';
            }
            // If the value is a number, check if it's not a number (NaN)
            if (typeof value === 'number') {
                return isNaN(value);
            }
            return false;
        });
    }; // Verifica si existe un campo del objeto vacío: ESPECIFICO (Hay que tener ciudado con el ID)
    const handleEdit = async (e) => {
        e.preventDefault();

        // Verificar si existe algun campo vacío
        if (isAnyFieldEmpty()) {
            const updatedEmptyFields = {};

            for (const field in estado) {
                if (estado[field] === null || estado[field] === undefined) {
                    updatedEmptyFields[field] = true;
                } else if (typeof estado[field] === 'string' && estado[field].trim() === '') {
                    updatedEmptyFields[field] = true;
                } else if (typeof estado[field] === 'number' && isNaN(estado[field])) {
                    updatedEmptyFields[field] = true;
                } else {
                    updatedEmptyFields[field] = false;
                }
            }

            setEmptyFields(updatedEmptyFields);
            setisAnyEmpty(true);
            return;
        } else {
            setisAnyEmpty(false);
        }

        // Intentar el request usando el servicio
        try {
            setIsLoading2(true);
            const estadoEdit = {
                "descripcionEspanol": estado.descripcionEspanol,
                "descripcionIngles": estado.descripcionIngles,
                "color": estado.color,
                "tipoEstadoId": estado.tipoEstado.tipoEstadoId,
                "codigo": estado.codigo
            }
            const response = await updateEstado(props.estadoId, estadoEdit);

            if (response === 204) {
                deletePersistedStates();
                props.onEdited();
                props.onClose();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al editar el estado',
                life: 3000,
            });
        } finally {
            setIsLoading2(false);
        }
    }; // Maneja la edición del objeto: ESPECIFICO (Hay que tener ciudado con el ID)
    const handleCancel = () => {
        isClosingRef.current = true;
        deletePersistedStates();
        props.onClose();
    }; // Maneja el cancelar del formulario (Datos no persisten): GENERAL
    const getColorNameByValue = (colorValue) => {
        const color = colorOptions.find(option => option.value === colorValue);
        return color ? color.name : null;
    }; // Obtiene el nombre del color con su valor hexadecimal
    const colorOptionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <div className="dropdown-color-options" style={{ backgroundColor: option.value }}>

                </div>
                <div>{option.name}</div>
            </div>
        );
    };
    const selectedColorTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <div className="dropdown-color-options" style={{ backgroundColor: option.value }}>

                    </div>
                    <div>{option.name}</div>
                </div>
            );
        }

        return (
            <div className="dropdown-item-container">
                <div className="dropdown-color-options" style={{ backgroundColor: colorOptions[0].value }}>

                </div>
                <div>{colorOptions[0].name}</div>
            </div>
        );
    };
    const tipoEstadoOptionTemplate = (option) => {
        return (
            <div className="dropdown-item-container">
                <span className="">{option.displayName}</span>
            </div>
        );
    };
    const selectedTipoEstadoTemplate = (option, props) => {
        if (option) {
            return (
                <div className="dropdown-item-container">
                    <span className="">{option.displayName}</span>
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    };

    // -----------------------------------------------------------------------------------------------

    return (
        <>
            <Draggable cancel="input, button, textarea" bounds="parent">
                <div className="form-container">
                    {(isLoading || isLoading2) &&
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    }
                    <>
                        <section className="form-header">
                            <span>{"Estado  " + (estado?.codigo || '')}</span>
                            <div className="form-header-buttons">
                                <Button className="form-header-btn" onClick={handleCancel}>
                                    <i className="pi pi-times" style={{ fontSize: '0.6rem', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                </Button>
                            </div>
                        </section>
                        <form className="form-body">
                            <div>
                                <ToggleButton onLabel="Leer" offLabel="Editar" onIcon="pi pi-eye" offIcon="pi pi-pencil"
                                    checked={isEditing} onChange={(e) => dispatch(setIsEditing(e.value))} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="codigo">Código <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <input readOnly className={`${emptyFields.codigo && 'form-group-empty'}`} type="text" id="codigo" name="codigo" value={estado?.codigo || ''} onChange={handleInputChange} required maxLength="10" placeholder="Código único del estado" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="descripcionEspanol">Descripción en español <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <textarea readOnly={!isEditing} className={`${emptyFields.descripcionEspanol && 'form-group-empty'}`} type="text" id="descripcionEspanol" name="descripcionEspanol" value={estado?.descripcionEspanol || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Descripción del estado en español" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="descripcionIngles">Descripción en inglés <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <textarea readOnly={!isEditing} className={`${emptyFields.descripcionIngles && 'form-group-empty'}`} type="text" id="descripcionIngles" name="descripcionIngles" value={estado?.descripcionIngles || ''} onChange={handleInputChange} required maxLength="1000" placeholder="Descripción del estado en inglés" />
                            </div>
                            <div className="form-group">
                                <label>Tipo de estado <small className="requiredAsterisk">(Obligatorio)</small></label>
                                <div>
                                    {
                                        errorTE || !tiposEstados ? (
                                            <div className="dropdown-error">
                                                <div className="dropdown-error-msg">
                                                    {isLoadingTE || (isRefreshingTE && isValidatingTE) ?
                                                        <div className="small-spinner" /> :
                                                        <span>Ocurrió un error: sin opciones disponibles</span>}
                                                </div>
                                                <Button className="rounded-icon-btn" onClick={refreshDataTE}>
                                                    <i className="pi pi-refresh" style={{ fontSize: '0.8rem', margin: '0' }}></i>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Dropdown
                                                disabled={!isEditing}
                                                className={`${emptyFields.tipoEstado && 'form-group-empty'}`}
                                                style={{ width: '100%' }}
                                                value={selectedTipoEstado}
                                                onChange={(e) => setSelectedTipoEstado(e.value)}
                                                options={sortedTiposEstados}
                                                optionLabel="displayName"
                                                placeholder="Selecciona un tipo de estado"
                                                filter
                                                virtualScrollerOptions={{ itemSize: 38 }}
                                                valueTemplate={selectedTipoEstadoTemplate}
                                                itemTemplate={tipoEstadoOptionTemplate}
                                            />
                                        )
                                    }
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Color</label>
                                <div>
                                    <Dropdown
                                        disabled={!isEditing}
                                        className={`${emptyFields.color && 'form-group-empty'}`}
                                        style={{ width: '100%' }}
                                        inputId="estadoColor"
                                        value={selectedColor}
                                        onChange={(e) => setSelectedColor(e.value)}
                                        options={colorOptions}
                                        optionLabel="name"
                                        placeholder="Selecciona un color"
                                        virtualScrollerOptions={{ itemSize: 38 }}
                                        valueTemplate={selectedColorTemplate}
                                        itemTemplate={colorOptionTemplate} />
                                </div>
                            </div>
                        </form>
                        {(isAnyEmpty && isEditing) && 
                            <div className="empty-fields-msg">
                                <i className="pi pi-exclamation-circle" style={{ fontSize: '0.8rem', margin: '0', color: 'var(--secondary-blue)', fontWeight: '600' }}></i>
                                <span>Por favor, llena todos los datos <strong>requeridos</strong></span>
                            </div>
                        }
                        <div className="center-hr">
                            <hr />
                        </div>
                        <section className="form-footer">
                            <button className="form-cancel-btn" onClick={handleCancel}>Cancelar</button>
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

export default EstadosDetails;